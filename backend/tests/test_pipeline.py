import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from backend.main import app
from backend.database import init_db
from backend.services.medicine_info_service import medicine_info_service
from backend.services.report_generator import generate_doctor_report_pdf

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["app"] == "DoseSaathi AI"
    assert "status" in data

def test_prescription_sample_upload_and_preprocess():
    res = client.post("/api/prescriptions/upload", data={"use_sample": "true"})
    assert res.status_code == 200
    data = res.json()
    assert "prescription_id" in data
    assert "preprocessing" in data
    assert data["preprocessing"]["clarity_assessment"] in ["Good", "Moderate", "Low clarity / Blurry"]
    assert len(data["preprocessing"]["steps_applied"]) == 3

def test_prescription_analysis_workflow():
    # 1. Upload sample
    up_res = client.post("/api/prescriptions/upload", data={"use_sample": "true"})
    pid = up_res.json()["prescription_id"]

    # 2. Analyze
    an_res = client.post(f"/api/prescriptions/{pid}/analyze")
    assert an_res.status_code == 200
    analysis = an_res.json()
    assert len(analysis["medicines"]) >= 2
    assert analysis["overall_status"] in ["review_required", "needs_clarification"]

    # Check that at least one item requires review
    statuses = [m["status"] for m in analysis["medicines"]]
    assert "needs_review" in statuses or "needs_clarification" in statuses

def test_safety_rule_blocks_unconfirmed_schedule():
    """
    CRITICAL HEALTHCARE SAFETY TEST:
    A user must NEVER be permitted to activate reminders from unconfirmed OCR output.
    """
    # Upload and analyze
    up_res = client.post("/api/prescriptions/upload", data={"use_sample": "true"})
    pid = up_res.json()["prescription_id"]
    an_res = client.post(f"/api/prescriptions/{pid}/analyze")
    meds = an_res.json()["medicines"]
    unconfirmed_med_id = meds[0]["id"]

    # Attempt to schedule directly without confirming -> MUST return 400 Bad Request
    sched_payload = {
        "prescription_id": pid,
        "medicine_id": unconfirmed_med_id,
        "medicine_name": "Unconfirmed Medicine",
        "dosage": "1 tablet",
        "frequency": "Twice daily",
        "times": ["08:00", "20:00"],
        "meal_relation": "after_meal",
        "start_date": "2026-10-30"
    }
    sched_res = client.post("/api/medication-schedules", json=sched_payload)
    assert sched_res.status_code == 400
    assert "Safety Violation" in sched_res.json()["detail"]

def test_confirm_review_then_schedule_succeeds():
    # Upload and analyze
    up_res = client.post("/api/prescriptions/upload", data={"use_sample": "true"})
    pid = up_res.json()["prescription_id"]
    an_res = client.post(f"/api/prescriptions/{pid}/analyze")
    meds = an_res.json()["medicines"]
    med = meds[0]

    # Human confirms medicine
    review_payload = {
        "prescription_id": pid,
        "reviewed_medicines": [
            {
                "medicine_id": med["id"],
                "medicine_name": med["medicine_name_raw"],
                "strength": med["strength_raw"],
                "dosage": med["dosage_raw"],
                "frequency": med["frequency_raw"],
                "duration": med["duration_raw"],
                "instructions": med["instructions_raw"],
                "status": "confirmed",
                "confirmed_by": "Patient: Ramanathan"
            }
        ]
    }
    rev_res = client.put(f"/api/prescriptions/{pid}/review", json=review_payload)
    assert rev_res.status_code == 200

    # Now scheduling this confirmed medicine MUST succeed
    sched_payload = {
        "prescription_id": pid,
        "medicine_id": med["id"],
        "medicine_name": med["medicine_name_raw"],
        "dosage": "1 tablet",
        "frequency": "Twice daily",
        "times": ["08:00", "20:00"],
        "meal_relation": "after_meal",
        "start_date": "2026-10-30"
    }
    sched_res = client.post("/api/medication-schedules", json=sched_payload)
    assert sched_res.status_code == 200
    sched_data = sched_res.json()
    assert sched_data["is_active"] is True
    assert sched_data["medicine_name"] == med["medicine_name_raw"]

def test_medicine_catalog_lookup():
    # Metformin check
    met = medicine_info_service.lookup("Glycomet")
    assert met is not None
    assert "Metformin" in met.generic_name
    assert "சர்க்கரை" in met.plain_language_summary_ta or "இன்சுலின்" in met.plain_language_summary_ta  # Tamil translation verified
    assert "CDSCO" in met.source_name

    # Unknown drug check - must NOT hallucinate
    unknown = medicine_info_service.lookup("NonExistentDrugXYZ999")
    assert unknown is None

def test_adherence_event_and_transparent_report_calculation():
    # Record events
    client.post("/api/adherence-events", json={
        "schedule_id": "sch_test_1",
        "medicine_name": "Glycomet 500mg",
        "scheduled_time": "2026-10-29 08:00",
        "status": "patient_reported_taken",
        "reporting_source": "patient"
    })
    client.post("/api/adherence-events", json={
        "schedule_id": "sch_test_1",
        "medicine_name": "Glycomet 500mg",
        "scheduled_time": "2026-10-29 20:00",
        "status": "patient_reported_skipped",
        "skipped_reason": "forgot",
        "reporting_source": "patient"
    })

    rep_res = client.get("/api/reports/summary")
    assert rep_res.status_code == 200
    rep = rep_res.json()
    assert rep["reported_taken"] >= 1
    assert rep["reported_skipped"] >= 1
    assert "forgot" in rep["skipped_reasons_breakdown"]
    # Check adherence rate is calculated
    assert 0 <= rep["reported_adherence_rate"] <= 100

def test_pdf_report_generation(tmp_path):
    pdf_res = client.post("/api/reports/pdf", data={"period": "This Week"})
    assert pdf_res.status_code == 200
    pdf_data = pdf_res.json()
    assert pdf_data["filename"].endswith(".pdf")
    assert "/reports/" in pdf_data["download_url"]
