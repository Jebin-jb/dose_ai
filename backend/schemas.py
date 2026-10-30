from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class BoundingBox(BaseModel):
    x: float = Field(0, description="Left coordinate in percentage (0-100)")
    y: float = Field(0, description="Top coordinate in percentage (0-100)")
    width: float = Field(100, description="Width in percentage (0-100)")
    height: float = Field(20, description="Height in percentage (0-100)")

class ExtractedMedicine(BaseModel):
    id: str
    medicine_name_raw: str
    standardized_name: Optional[str] = None
    strength_raw: Optional[str] = None
    dosage_raw: Optional[str] = None
    frequency_raw: Optional[str] = None
    duration_raw: Optional[str] = None
    route_raw: Optional[str] = "Oral"
    instructions_raw: Optional[str] = None
    status: str = "needs_review"  # "needs_review" (State A), "needs_clarification" (State B), "confirmed" (State C)
    clarification_reason: Optional[str] = None
    unreadable_fields: List[str] = Field(default_factory=list)
    bounding_box: Optional[BoundingBox] = None
    confirmed_by: Optional[str] = None
    confirmed_at: Optional[str] = None
    is_safe_to_schedule: bool = False

class PrescriptionAnalysisResult(BaseModel):
    prescription_id: str
    image_url: str
    patient_name_detected: Optional[str] = None
    prescription_date_detected: Optional[str] = None
    doctor_clinic_detected: Optional[str] = None
    medicines: List[ExtractedMedicine]
    warnings: List[str] = Field(default_factory=list)
    overall_status: str = "review_required"  # "review_required", "needs_clarification", "confirmed"
    notes_for_human: Optional[str] = None

class MedicineReviewUpdate(BaseModel):
    medicine_id: str
    medicine_name: str
    strength: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    status: str  # "confirmed" or "needs_clarification" or "needs_review"
    clarification_reason: Optional[str] = None
    confirmed_by: Optional[str] = "Patient"

class PrescriptionReviewSubmission(BaseModel):
    prescription_id: str
    reviewed_medicines: List[MedicineReviewUpdate]

class MedicationScheduleCreate(BaseModel):
    prescription_id: Optional[str] = None
    medicine_id: str
    medicine_name: str
    dosage: str
    frequency: str  # e.g., "Once daily", "Twice daily", "Thrice daily"
    times: List[str]  # e.g., ["08:00", "20:00"]
    meal_relation: str = "after_meal"  # "before_meal", "after_meal", "with_meal", "none"
    start_date: str
    end_date: Optional[str] = None
    notes: Optional[str] = None

class MedicationScheduleOut(BaseModel):
    id: str
    prescription_id: Optional[str] = None
    medicine_id: str
    medicine_name: str
    dosage: str
    frequency: str
    times: List[str]
    meal_relation: str
    start_date: str
    end_date: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    created_at: str

class AdherenceEventCreate(BaseModel):
    schedule_id: str
    medicine_name: str
    scheduled_time: str
    event_time: Optional[str] = None
    status: str  # "patient_reported_taken", "caregiver_reported_taken", "patient_reported_skipped", "not_sure", "unconfirmed"
    skipped_reason: Optional[str] = None  # "forgot", "ran_out", "unclear_instructions", "side_effect_issue", "other"
    reporting_source: str = "patient"  # "patient" or "caregiver"
    notes: Optional[str] = None

class AdherenceEventOut(BaseModel):
    id: str
    schedule_id: str
    medicine_name: str
    scheduled_time: str
    event_time: Optional[str] = None
    status: str
    skipped_reason: Optional[str] = None
    reporting_source: str
    notes: Optional[str] = None
    created_at: str

class ReportSummary(BaseModel):
    period: str
    total_scheduled: int
    reported_taken: int
    caregiver_reported: int
    reported_skipped: int
    not_sure: int
    unconfirmed: int
    reported_adherence_rate: float
    skipped_reasons_breakdown: Dict[str, int]
    disclaimer: str

class MedicineInfoOut(BaseModel):
    id: str
    name: str
    generic_name: str
    brand_names: List[str]
    therapeutic_class: str
    plain_language_summary_en: str
    plain_language_summary_ta: str
    general_guidance_en: str
    general_guidance_ta: str
    source_name: str
    source_url: str
    is_verified: bool = True

