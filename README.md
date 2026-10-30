# DoseSaathi AI 🩺

> **Understand your medicines. Stay on track.**
> A premium, India-focused prescription reading & medication management application designed for older adults, caregivers, and patients managing ongoing treatment.

---

## 🌟 Overview

Handwritten medical prescriptions in India are often difficult to decipher, leading to missed doses, incorrect timings, or confusion over whether a medicine should be taken before or after meals. 

**DoseSaathi AI** bridges the communication gap between the doctor's handwriting and the patient's daily routine with a safety-first architecture:
- **Scan & Enhance**: Cleans up shadows and boosts stroke contrast using OpenCV.
- **Multimodal Vision Transcription**: Uses Google Gemini Vision (`gemini-3.5-flash-lite`) with strict medical extraction guardrails.
- **Clinical Safety Gate**: **No reminders are ever activated from unverified OCR**. Every medication, strength, and frequency must be explicitly confirmed by the patient or caregiver.
- **Trusted Drug Catalog**: Links medicines to standard CDSCO and Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) verified reference info.
- **Bilingual & Accessible**: Full English & Tamil (தமிழ்) localization, adjustable font sizing (A, A+, A++), and optional voice guidance.
- **Doctor Consultation Reports**: Generates downloadable PDF adherence summaries accounting for patient-reported doses and skipped reasons.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: FastAPI, Python 3.14+, SQLite (with WAL mode), Uvicorn
- **Computer Vision & AI**: OpenCV (adaptive thresholding, unsharp masking, contrast enhancement), Google Gemini Vision SDK (`google-genai`)
- **PDF Generation**: ReportLab
- **Testing**: Pytest, Starlette TestClient, AnyIO

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/Jebin-jb/dose_ai.git
cd dose_ai
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
HOST=127.0.0.1
PORT=8000
```

### 3. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn google-genai opencv-python pillow reportlab pydantic pytest httpx

# Run database initialization
python -m backend.database

# Start FastAPI server
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend API docs available at: `http://127.0.0.1:8000/docs`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```
Open your browser at `http://127.0.0.1:3000`

---

## 🧪 Running Automated Tests

Run the full backend test suite verifying all 8 safety, OCR, and adherence pipeline checks:
```bash
pytest backend/tests/ -v
```

---

## 🔒 Healthcare Safety Standards

1. **Zero Hallucination Tolerance**: The extraction prompt prohibits guessing missing dosages or doctor intent. Ambiguous handwriting is flagged as `needs_clarification`.
2. **Mandatory Human-in-the-Loop**: The backend rejects scheduling requests with HTTP 400 if a medication has not been confirmed.
3. **Transparent Accounting**: Reminders not responded to are tracked as `unconfirmed`, never assumed to be taken or missed.
4. **Medical Disclaimer**: DoseSaathi AI is an assistive transcription and organization tool, not a substitute for professional medical advice.

---

## 📄 License
MIT License. Created for the Healthcare Innovation Challenge.
