import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
UPLOADS_DIR = DATA_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
REPORTS_DIR = DATA_DIR / "reports"
REPORTS_DIR.mkdir(exist_ok=True)

DATABASE_URL = f"sqlite:///{DATA_DIR}/dosesaathi.db"

# Load .env or .env.example if present in root
ENV_FILE = ROOT_DIR / ".env"
ENV_EXAMPLE_FILE = ROOT_DIR / ".env.example"

for target_file in [ENV_FILE, ENV_EXAMPLE_FILE]:
    if target_file.exists():
        with open(target_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    val = v.strip()
                    if val and val != "your_gemini_api_key_here":
                        os.environ.setdefault(k.strip(), val)

# Gemini API configuration
# Must not be hardcoded. Read from environment variable.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

def get_api_key():
    return os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)

def set_api_key(key: str):
    global GEMINI_API_KEY
    GEMINI_API_KEY = key
    os.environ["GEMINI_API_KEY"] = key
    # Also persist to local .env
    with open(ENV_FILE, "w", encoding="utf-8") as f:
        f.write(f"GEMINI_API_KEY={key}\nGEMINI_MODEL={GEMINI_MODEL}\n")

# Indian Medicine Information Sources
SOURCES = {
    "jan_aushadhi": "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
    "cdsco": "Central Drugs Standard Control Organisation (CDSCO), Govt. of India",
    "medline_plus": "MedlinePlus Medical Reference",
    "nlm": "National Library of Medicine (NLM)"
}
