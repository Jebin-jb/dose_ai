import os
import uuid
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import UPLOADS_DIR, REPORTS_DIR
from backend.database import get_connection, init_db
from backend.schemas import (
    PrescriptionAnalysisResult,
    ExtractedMedicine,
    BoundingBox,
    PrescriptionReviewSubmission,
    MedicationScheduleCreate,
    MedicationScheduleOut,
    AdherenceEventCreate,
    AdherenceEventOut,
    ReportSummary,
    MedicineInfoOut
)
from backend.services.image_preprocessor import preprocess_prescription_image
from backend.services.prescription_ai_service import extract_prescription_with_gemini
from backend.services.medicine_info_service import medicine_info_service
from backend.services.report_generator import generate_doctor_report_pdf

# Initialize database tables
init_db()

app = FastAPI(
    title="DoseSaathi AI Backend",
    description="Safety-first, India-focused prescription reading & medication adherence API",
    version="1.0.0"
)

# Enable CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file directories for uploads and reports
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.mount("/reports", StaticFiles(directory=str(REPORTS_DIR)), name="reports")

@app.get("/api/health")
def health_check():
    from backend.config import get_api_key, GEMINI_MODEL
    key = get_api_key()
    masked_key = f"{key[:6]}...{key[-4:]}" if len(key) > 10 else ("Configured" if key else "Not set (Demo mode active)")
    return {
        "status": "healthy",
        "app": "DoseSaathi AI",
        "gemini_api_configured": bool(key and key != "your_gemini_api_key_here"),
        "active_model": GEMINI_MODEL,
        "key_preview": masked_key,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/config/api-key")
def get_api_key_status():
    from backend.config import get_api_key, GEMINI_MODEL
    key = get_api_key()
    has_key = bool(key and key != "your_gemini_api_key_here")
    masked = f"{key[:6]}...{key[-4:]}" if has_key and len(key) > 10 else ""
    return {
        "is_configured": has_key,
        "masked_key": masked,
        "model": GEMINI_MODEL,
        "status_label": "Live Gemini Vision Active" if has_key else "Using Sample/Demo Mode"
    }

@app.post("/api/config/api-key")
def update_api_key(data: dict):
    from backend.config import set_api_key
    new_key = data.get("api_key", "").strip()
    if new_key:
        set_api_key(new_key)
        return {"status": "success", "message": "API key updated successfully"}
    return {"status": "error", "message": "API key cannot be empty"}

# ==========================================
# 1. PRESCRIPTION UPLOAD & PREPROCESSING
# ==========================================

@app.post("/api/prescriptions/upload")
async def upload_prescription(
    file: Optional[UploadFile] = File(None),
    use_sample: bool = Form(False)
):
    """
    Accepts an uploaded prescription image or switches to the authentic sample Indian prescription.
    Runs OpenCV preprocessing to measure clarity and enhance ink strokes.
    """
    prescription_id = str(uuid.uuid4())[:8]

    if use_sample or file is None:
        sample_path = UPLOADS_DIR / "sample_prescription_dr_sharma.jpg"
        if not sample_path.exists():
            from backend.sample_data.create_sample_prescription import generate_sample_prescription_image
            generate_sample_prescription_image(sample_path)
        target_path = sample_path
        filename = "sample_prescription_dr_sharma.jpg"
    else:
        # Validate file format
        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid image format. Please upload JPG, PNG, or WEBP.")

        filename = f"{prescription_id}_{file.filename}"
        target_path = UPLOADS_DIR / filename
        with open(target_path, "wb") as f:
            content = await file.read()
            f.write(content)

    # Run OpenCV preprocessor
    prep_result = preprocess_prescription_image(target_path, UPLOADS_DIR)

    # Save to SQLite
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO prescriptions (id, image_url, original_filename, overall_status, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (prescription_id, f"/uploads/{filename}", filename, "uploaded", datetime.now().isoformat()))
    conn.commit()
    conn.close()

    return {
        "prescription_id": prescription_id,
        "image_url": f"/uploads/{filename}",
        "preprocessing": prep_result
    }

# ==========================================
# 2. AI PRESCRIPTION ANALYSIS (GEMINI VISION)
# ==========================================

@app.post("/api/prescriptions/{id}/analyze", response_model=PrescriptionAnalysisResult)
def analyze_prescription(id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM prescriptions WHERE id = ?", (id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Prescription not found")

    image_filename = Path(row["image_url"]).name
    conn.close()
    image_path = UPLOADS_DIR / image_filename
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Prescription image file missing on disk")

    # Run AI transcription with strict prompt guardrails
    analysis: PrescriptionAnalysisResult = extract_prescription_with_gemini(image_path)
    analysis.prescription_id = id

    # Store analysis results in database
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE prescriptions
    SET patient_name = ?, prescription_date = ?, doctor_clinic = ?, warnings = ?,
        overall_status = ?, notes_for_human = ?
    WHERE id = ?
    """, (
        analysis.patient_name_detected,
        analysis.prescription_date_detected,
        analysis.doctor_clinic_detected,
        json.dumps(analysis.warnings),
        analysis.overall_status,
        analysis.notes_for_human,
        id
    ))

    # Clear previous extracted medicines for this prescription if re-analyzing
    cursor.execute("DELETE FROM extracted_medicines WHERE prescription_id = ?", (id,))

    for m in analysis.medicines:
        if not m.id.startswith(f"{id}_"):
            m.id = f"{id}_{m.id}"
        cursor.execute("""
        INSERT OR REPLACE INTO extracted_medicines (
            id, prescription_id, medicine_name_raw, standardized_name,
            strength_raw, dosage_raw, frequency_raw, duration_raw,
            route_raw, instructions_raw, status, clarification_reason,
            unreadable_fields, bounding_box, is_safe_to_schedule
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            m.id,
            id,
            m.medicine_name_raw,
            m.standardized_name,
            m.strength_raw,
            m.dosage_raw,
            m.frequency_raw,
            m.duration_raw,
            m.route_raw,
            m.instructions_raw,
            m.status,
            m.clarification_reason,
            json.dumps(m.unreadable_fields),
            json.dumps(m.bounding_box.model_dump()) if m.bounding_box else None,
            1 if m.is_safe_to_schedule else 0
        ))

    conn.commit()
    conn.close()

    return analysis

# ==========================================
# 3. GET & REVIEW PRESCRIPTIONS
# ==========================================

@app.get("/api/prescriptions/{id}")
def get_prescription(id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM prescriptions WHERE id = ?", (id,))
    p_row = cursor.fetchone()
    if not p_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Prescription not found")

    cursor.execute("SELECT * FROM extracted_medicines WHERE prescription_id = ?", (id,))
    m_rows = cursor.fetchall()
    conn.close()

    medicines = []
    for r in m_rows:
        bbox = json.loads(r["bounding_box"]) if r["bounding_box"] else None
        medicines.append({
            "id": r["id"],
            "medicine_name_raw": r["medicine_name_raw"],
            "standardized_name": r["standardized_name"],
            "strength_raw": r["strength_raw"],
            "dosage_raw": r["dosage_raw"],
            "frequency_raw": r["frequency_raw"],
            "duration_raw": r["duration_raw"],
            "route_raw": r["route_raw"],
            "instructions_raw": r["instructions_raw"],
            "status": r["status"],
            "clarification_reason": r["clarification_reason"],
            "unreadable_fields": json.loads(r["unreadable_fields"]) if r["unreadable_fields"] else [],
            "bounding_box": bbox,
            "confirmed_by": r["confirmed_by"],
            "confirmed_at": r["confirmed_at"],
            "is_safe_to_schedule": bool(r["is_safe_to_schedule"])
        })

    return {
        "id": p_row["id"],
        "image_url": p_row["image_url"],
        "patient_name": p_row["patient_name"],
        "prescription_date": p_row["prescription_date"],
        "doctor_clinic": p_row["doctor_clinic"],
        "warnings": json.loads(p_row["warnings"]) if p_row["warnings"] else [],
        "overall_status": p_row["overall_status"],
        "notes_for_human": p_row["notes_for_human"],
        "medicines": medicines
    }

@app.put("/api/prescriptions/{id}/review")
def review_prescription(id: str, review_data: PrescriptionReviewSubmission):
    """
    Submits human edits and verifications.
    CRITICAL SAFETY RULE: Only medicines with status == 'confirmed' and no unresolved
    critical fields receive is_safe_to_schedule = True.
    """
    conn = get_connection()
    cursor = conn.cursor()

    for item in review_data.reviewed_medicines:
        # Check if item is genuinely confirmed
        is_safe = (item.status == "confirmed" and bool(item.medicine_name.strip()))

        cursor.execute("""
        UPDATE extracted_medicines
        SET medicine_name_raw = ?,
            strength_raw = ?,
            dosage_raw = ?,
            frequency_raw = ?,
            duration_raw = ?,
            instructions_raw = ?,
            status = ?,
            clarification_reason = ?,
            confirmed_by = ?,
            confirmed_at = ?,
            is_safe_to_schedule = ?
        WHERE id = ?
        """, (
            item.medicine_name,
            item.strength,
            item.dosage,
            item.frequency,
            item.duration,
            item.instructions,
            item.status,
            item.clarification_reason,
            item.confirmed_by if item.status == "confirmed" else None,
            datetime.now().isoformat() if item.status == "confirmed" else None,
            1 if is_safe else 0,
            item.medicine_id
        ))

    # Check overall prescription status
    cursor.execute("SELECT status FROM extracted_medicines WHERE prescription_id = ?", (id,))
    statuses = [r["status"] for r in cursor.fetchall()]
    overall = "confirmed" if all(s == "confirmed" for s in statuses) else (
        "needs_clarification" if any(s == "needs_clarification" for s in statuses) else "review_required"
    )

    cursor.execute("UPDATE prescriptions SET overall_status = ? WHERE id = ?", (overall, id))
    conn.commit()
    conn.close()

    return {"status": "success", "overall_status": overall}

# ==========================================
# 4. MEDICINE EXPLAINER & CATALOG
# ==========================================

@app.get("/api/medicines/info/{name_or_id}")
def get_medicine_info(name_or_id: str):
    info = medicine_info_service.lookup(name_or_id)
    if not info:
        # Return honest unavailable state; never hallucinate medical facts
        return {
            "name": name_or_id,
            "generic_name": "Unspecified / Need Confirmation",
            "brand_names": [],
            "therapeutic_class": "General Medication",
            "plain_language_summary_en": "Standard medicine information for this specific formulation is not in the local certified registry. Please consult your doctor or pharmacist.",
            "plain_language_summary_ta": "இந்த குறிப்பிட்ட மருந்தின் விவரங்கள் சரிபார்க்கப்பட்ட பதிவேட்டில் இல்லை. உங்கள் மருத்துவரிடம் அல்லது மருந்தாளரிடம் உறுதி செய்யவும்.",
            "general_guidance_en": "Take strictly as prescribed on your doctor's confirmed instructions.",
            "general_guidance_ta": "மருத்துவர் அளித்த அறிவுறுத்தலின்படி மட்டுமே உட்கொள்ளவும்.",
            "source_name": "Indian Pharmacopoeia Reference Notice",
            "source_url": "https://cdsco.gov.in",
            "is_verified": False
        }
    return info

@app.get("/api/medicines/catalog")
def get_catalog():
    return medicine_info_service.get_all()

# ==========================================
# 5. MEDICATION SCHEDULES & REMINDERS
# ==========================================

@app.post("/api/medication-schedules", response_model=MedicationScheduleOut)
def create_schedule(schedule_in: MedicationScheduleCreate):
    conn = get_connection()
    cursor = conn.cursor()

    # SAFETY CHECK: Verify that the medicine is confirmed if tied to an extracted medicine
    cursor.execute("SELECT status, is_safe_to_schedule FROM extracted_medicines WHERE id = ?", (schedule_in.medicine_id,))
    med_row = cursor.fetchone()
    if med_row and (med_row["status"] != "confirmed" or not med_row["is_safe_to_schedule"]):
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Safety Violation: Cannot create an active reminder schedule for an unconfirmed or ambiguous prescription instruction."
        )

    sched_id = f"sch_{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().isoformat()

    cursor.execute("""
    INSERT INTO medication_schedules (
        id, prescription_id, medicine_id, medicine_name, dosage,
        frequency, times, meal_relation, start_date, end_date, notes, is_active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    """, (
        sched_id,
        schedule_in.prescription_id,
        schedule_in.medicine_id,
        schedule_in.medicine_name,
        schedule_in.dosage,
        schedule_in.frequency,
        json.dumps(schedule_in.times),
        schedule_in.meal_relation,
        schedule_in.start_date,
        schedule_in.end_date,
        schedule_in.notes,
        now_str
    ))

    # Also automatically seed initial today adherence events for scheduled times
    today_str = datetime.now().strftime("%Y-%m-%d")
    for t in schedule_in.times:
        event_id = f"ev_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
        INSERT INTO adherence_events (
            id, schedule_id, medicine_name, scheduled_time, status, reporting_source, created_at
        ) VALUES (?, ?, ?, ?, 'unconfirmed', 'system', ?)
        """, (event_id, sched_id, schedule_in.medicine_name, f"{today_str} {t}", now_str))

    conn.commit()
    conn.close()

    return MedicationScheduleOut(
        id=sched_id,
        prescription_id=schedule_in.prescription_id,
        medicine_id=schedule_in.medicine_id,
        medicine_name=schedule_in.medicine_name,
        dosage=schedule_in.dosage,
        frequency=schedule_in.frequency,
        times=schedule_in.times,
        meal_relation=schedule_in.meal_relation,
        start_date=schedule_in.start_date,
        end_date=schedule_in.end_date,
        notes=schedule_in.notes,
        is_active=True,
        created_at=now_str
    )

@app.get("/api/medication-schedules", response_model=List[MedicationScheduleOut])
def list_schedules():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM medication_schedules ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    schedules = []
    for r in rows:
        schedules.append(MedicationScheduleOut(
            id=r["id"],
            prescription_id=r["prescription_id"],
            medicine_id=r["medicine_id"],
            medicine_name=r["medicine_name"],
            dosage=r["dosage"],
            frequency=r["frequency"],
            times=json.loads(r["times"]),
            meal_relation=r["meal_relation"],
            start_date=r["start_date"],
            end_date=r["end_date"],
            notes=r["notes"],
            is_active=bool(r["is_active"]),
            created_at=r["created_at"]
        ))
    return schedules

@app.delete("/api/medication-schedules/{id}")
def delete_schedule(id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE medication_schedules SET is_active = 0 WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return {"status": "discontinued", "id": id}

# ==========================================
# 6. ADHERENCE EVENT LOGGING
# ==========================================

@app.post("/api/adherence-events", response_model=AdherenceEventOut)
def record_adherence_event(event_in: AdherenceEventCreate):
    conn = get_connection()
    cursor = conn.cursor()

    event_id = f"ev_{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().isoformat()
    ev_time = event_in.event_time or now_str

    cursor.execute("""
    INSERT INTO adherence_events (
        id, schedule_id, medicine_name, scheduled_time, event_time,
        status, skipped_reason, reporting_source, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event_id,
        event_in.schedule_id,
        event_in.medicine_name,
        event_in.scheduled_time,
        ev_time,
        event_in.status,
        event_in.skipped_reason,
        event_in.reporting_source,
        event_in.notes,
        now_str
    ))

    conn.commit()
    conn.close()

    return AdherenceEventOut(
        id=event_id,
        schedule_id=event_in.schedule_id,
        medicine_name=event_in.medicine_name,
        scheduled_time=event_in.scheduled_time,
        event_time=ev_time,
        status=event_in.status,
        skipped_reason=event_in.skipped_reason,
        reporting_source=event_in.reporting_source,
        notes=event_in.notes,
        created_at=now_str
    )

@app.get("/api/adherence-events")
def list_adherence_events(limit: int = 50):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM adherence_events ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    return [dict(r) for r in rows]

# ==========================================
# 7. ADHERENCE REPORT & PDF GENERATION
# ==========================================

@app.get("/api/reports/summary", response_model=ReportSummary)
def get_report_summary(period: str = "this_week"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM adherence_events")
    rows = cursor.fetchall()
    conn.close()

    total = len(rows)
    taken = sum(1 for r in rows if r["status"] == "patient_reported_taken")
    caregiver = sum(1 for r in rows if r["status"] == "caregiver_reported_taken")
    skipped = sum(1 for r in rows if r["status"] == "patient_reported_skipped")
    not_sure = sum(1 for r in rows if r["status"] == "not_sure")
    unconfirmed = sum(1 for r in rows if r["status"] == "unconfirmed")

    # Transparent mathematical formula:
    # Adherence = (patient taken + caregiver witnessed) / total scheduled events
    rate = ((taken + caregiver) / total * 100) if total > 0 else 0.0

    # Reasons breakdown
    reasons: dict = {}
    for r in rows:
        if r["skipped_reason"]:
            reasons[r["skipped_reason"]] = reasons.get(r["skipped_reason"], 0) + 1

    return ReportSummary(
        period=period.replace("_", " ").title(),
        total_scheduled=total,
        reported_taken=taken,
        caregiver_reported=caregiver,
        reported_skipped=skipped,
        not_sure=not_sure,
        unconfirmed=unconfirmed,
        reported_adherence_rate=round(rate, 1),
        skipped_reasons_breakdown=reasons,
        disclaimer="Adherence numbers represent patient and caregiver self-reports. Unconfirmed reminders are never counted as taken doses."
    )

@app.post("/api/reports/pdf")
def create_pdf_report(period: str = Form("This Week")):
    conn = get_connection()
    cursor = conn.cursor()

    # Get user profile
    cursor.execute("SELECT name FROM user_preferences WHERE id = 'default_user'")
    u_row = cursor.fetchone()
    patient_name = u_row["name"] if u_row else "Ramanathan Iyer"

    # Get active schedules
    cursor.execute("SELECT * FROM medication_schedules WHERE is_active = 1")
    meds = [dict(r) for r in cursor.fetchall()]

    # Get recent adherence events
    cursor.execute("SELECT * FROM adherence_events ORDER BY created_at DESC LIMIT 30")
    events = [dict(r) for r in cursor.fetchall()]

    conn.close()

    # Calculate summary metrics
    total = len(events)
    taken = sum(1 for r in events if r["status"] == "patient_reported_taken")
    caregiver = sum(1 for r in events if r["status"] == "caregiver_reported_taken")
    skipped = sum(1 for r in events if r["status"] == "patient_reported_skipped")
    not_sure = sum(1 for r in events if r["status"] == "not_sure")
    unconfirmed = sum(1 for r in events if r["status"] == "unconfirmed")
    rate = ((taken + caregiver) / total * 100) if total > 0 else 0.0

    summary_data = {
        "total_scheduled": total,
        "reported_taken": taken,
        "caregiver_reported": caregiver,
        "reported_skipped": skipped,
        "not_sure": not_sure,
        "unconfirmed": unconfirmed,
        "reported_adherence_rate": rate
    }

    report_id = f"report_{uuid.uuid4().hex[:8]}.pdf"
    pdf_path = generate_doctor_report_pdf(
        patient_name=patient_name,
        period_label=period,
        summary_data=summary_data,
        medicines=meds,
        events=events,
        output_filename=report_id
    )

    return {
        "report_id": report_id,
        "download_url": f"/reports/{report_id}",
        "filename": report_id,
        "generated_at": datetime.now().isoformat()
    }

# ==========================================
# 8. PREFERENCES & PRIVACY CONTROLS
# ==========================================

@app.get("/api/preferences")
def get_preferences():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_preferences WHERE id = 'default_user'")
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {
        "id": "default_user",
        "name": "Ramanathan Iyer",
        "language": "en",
        "text_size": "normal",
        "voice_assisted": 0,
        "caregiver_enabled": 1,
        "caregiver_name": "Priya (Daughter)",
        "caregiver_permission": "view_and_record",
        "notifications_enabled": 1
    }

@app.put("/api/preferences")
def update_preferences(data: dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE user_preferences
    SET language = coalesce(?, language),
        text_size = coalesce(?, text_size),
        voice_assisted = coalesce(?, voice_assisted),
        caregiver_enabled = coalesce(?, caregiver_enabled),
        caregiver_name = coalesce(?, caregiver_name),
        caregiver_permission = coalesce(?, caregiver_permission),
        notifications_enabled = coalesce(?, notifications_enabled)
    WHERE id = 'default_user'
    """, (
        data.get("language"),
        data.get("text_size"),
        data.get("voice_assisted"),
        data.get("caregiver_enabled"),
        data.get("caregiver_name"),
        data.get("caregiver_permission"),
        data.get("notifications_enabled")
    ))
    conn.commit()
    conn.close()
    return {"status": "updated", "preferences": data}

@app.delete("/api/data/reset")
def reset_patient_data():
    """
    Privacy compliant data deletion: cleans prescriptions, schedules, and adherence logs.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM adherence_events")
    cursor.execute("DELETE FROM medication_schedules")
    cursor.execute("DELETE FROM extracted_medicines")
    cursor.execute("DELETE FROM prescriptions")
    conn.commit()
    conn.close()
    return {"status": "all_patient_data_deleted", "message": "All local prescriptions and logs have been wiped."}
