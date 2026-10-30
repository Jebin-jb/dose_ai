import sqlite3
import json
from pathlib import Path
from backend.config import DATA_DIR

DB_PATH = DATA_DIR / "dosesaathi.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Prescriptions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        image_url TEXT NOT NULL,
        original_filename TEXT,
        patient_name TEXT,
        prescription_date TEXT,
        doctor_clinic TEXT,
        warnings TEXT,
        overall_status TEXT DEFAULT 'review_required',
        notes_for_human TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Extracted medicines table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS extracted_medicines (
        id TEXT PRIMARY KEY,
        prescription_id TEXT NOT NULL,
        medicine_name_raw TEXT NOT NULL,
        standardized_name TEXT,
        strength_raw TEXT,
        dosage_raw TEXT,
        frequency_raw TEXT,
        duration_raw TEXT,
        route_raw TEXT DEFAULT 'Oral',
        instructions_raw TEXT,
        status TEXT DEFAULT 'needs_review',
        clarification_reason TEXT,
        unreadable_fields TEXT,
        bounding_box TEXT,
        confirmed_by TEXT,
        confirmed_at TEXT,
        is_safe_to_schedule INTEGER DEFAULT 0,
        FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
    )
    """)

    # Medication schedules table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS medication_schedules (
        id TEXT PRIMARY KEY,
        prescription_id TEXT,
        medicine_id TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        times TEXT NOT NULL, -- JSON array of strings, e.g. ["08:00", "20:00"]
        meal_relation TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        notes TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    )
    """)

    # Adherence events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS adherence_events (
        id TEXT PRIMARY KEY,
        schedule_id TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        event_time TEXT,
        status TEXT NOT NULL, -- 'patient_reported_taken', 'caregiver_reported_taken', 'patient_reported_skipped', 'not_sure', 'unconfirmed'
        skipped_reason TEXT,
        reporting_source TEXT DEFAULT 'patient',
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (schedule_id) REFERENCES medication_schedules(id)
    )
    """)

    # User profile / accessibility preferences table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY DEFAULT 'default_user',
        name TEXT DEFAULT 'Ramanathan Iyer',
        language TEXT DEFAULT 'en', -- 'en' or 'ta'
        text_size TEXT DEFAULT 'normal', -- 'normal', 'large', 'xl'
        voice_assisted INTEGER DEFAULT 0,
        caregiver_enabled INTEGER DEFAULT 1,
        caregiver_name TEXT DEFAULT 'Priya (Daughter)',
        caregiver_permission TEXT DEFAULT 'view_and_record',
        notifications_enabled INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    )
    """)

    # Seed default user if not exists
    cursor.execute("SELECT id FROM user_preferences WHERE id = 'default_user'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO user_preferences (id, name, language, text_size, voice_assisted, caregiver_enabled, caregiver_name, caregiver_permission, notifications_enabled, created_at)
        VALUES ('default_user', 'Ramanathan Iyer', 'en', 'normal', 0, 1, 'Priya (Daughter)', 'view_and_record', 1, datetime('now'))
        """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")

