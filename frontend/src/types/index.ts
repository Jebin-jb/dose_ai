export type Language = 'en' | 'ta';
export type TextSize = 'normal' | 'large' | 'xl';
export type ScreenName = 
  | 'welcome' 
  | 'about'
  | 'home' 
  | 'scanner' 
  | 'review' 
  | 'explainer' 
  | 'schedule' 
  | 'my_medicines' 
  | 'reports' 
  | 'profile';

export type RecognitionState = 'needs_review' | 'needs_clarification' | 'confirmed';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedMedicine {
  id: string;
  medicine_name_raw: string;
  standardized_name?: string | null;
  strength_raw?: string | null;
  dosage_raw?: string | null;
  frequency_raw?: string | null;
  duration_raw?: string | null;
  route_raw?: string;
  instructions_raw?: string | null;
  status: RecognitionState;
  clarification_reason?: string | null;
  unreadable_fields: string[];
  bounding_box?: BoundingBox | null;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
  is_safe_to_schedule: boolean;
}

export interface Prescription {
  id: string;
  image_url: string;
  patient_name?: string | null;
  prescription_date?: string | null;
  doctor_clinic?: string | null;
  warnings: string[];
  overall_status: string;
  notes_for_human?: string | null;
  medicines: ExtractedMedicine[];
}

export interface MedicationSchedule {
  id: string;
  prescription_id?: string | null;
  medicine_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  times: string[];
  meal_relation: 'before_meal' | 'after_meal' | 'with_meal' | 'as_needed' | 'none';
  start_date: string;
  end_date?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
}

export type AdherenceStatus = 
  | 'patient_reported_taken' 
  | 'caregiver_reported_taken' 
  | 'patient_reported_skipped' 
  | 'not_sure' 
  | 'unconfirmed';

export type SkippedReason = 
  | 'forgot' 
  | 'ran_out' 
  | 'unclear_instructions' 
  | 'side_effect_issue' 
  | 'other';

export interface AdherenceEvent {
  id: string;
  schedule_id: string;
  medicine_name: string;
  scheduled_time: string;
  event_time?: string | null;
  status: AdherenceStatus;
  skipped_reason?: SkippedReason | null;
  reporting_source: 'patient' | 'caregiver' | 'system';
  notes?: string | null;
  created_at: string;
}

export interface MedicineInfo {
  id: string;
  name: string;
  generic_name: string;
  brand_names: string[];
  therapeutic_class: string;
  plain_language_summary_en: string;
  plain_language_summary_ta: string;
  general_guidance_en: string;
  general_guidance_ta: string;
  source_name: string;
  source_url: string;
  is_verified: boolean;
}

export interface ReportSummary {
  period: string;
  total_scheduled: number;
  reported_taken: number;
  caregiver_reported: number;
  reported_skipped: number;
  not_sure: number;
  unconfirmed: number;
  reported_adherence_rate: number;
  skipped_reasons_breakdown: Record<string, number>;
  disclaimer: string;
}

export interface UserPreferences {
  name: string;
  language: Language;
  text_size: TextSize;
  voice_assisted: boolean;
  caregiver_enabled: boolean;
  caregiver_name: string;
  caregiver_permission: 'view_only' | 'view_and_record';
  notifications_enabled: boolean;
}

