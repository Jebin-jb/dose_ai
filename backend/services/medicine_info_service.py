import json
from pathlib import Path
from typing import Optional, List
from backend.schemas import MedicineInfoOut
from backend.config import BASE_DIR

CATALOG_PATH = BASE_DIR / "sample_data" / "medicine_catalog.json"

class MedicineInformationService:
    def __init__(self):
        self.catalog = []
        if CATALOG_PATH.exists():
            with open(CATALOG_PATH, "r", encoding="utf-8") as f:
                self.catalog = json.load(f)

    def lookup(self, query: str) -> Optional[MedicineInfoOut]:
        if not query:
            return None
        
        q_clean = query.strip().lower()

        # Try exact match first on brand names or generic name
        for item in self.catalog:
            if q_clean == item["name"].lower() or q_clean == item["generic_name"].lower():
                return MedicineInfoOut(**item)
            for brand in item.get("brand_names", []):
                if q_clean == brand.lower():
                    return MedicineInfoOut(**item)

        # Try substring match
        for item in self.catalog:
            if item["generic_name"].lower() in q_clean or q_clean in item["generic_name"].lower():
                return MedicineInfoOut(**item)
            for brand in item.get("brand_names", []):
                if brand.lower() in q_clean or q_clean in brand.lower():
                    return MedicineInfoOut(**item)

        # If not found in trusted local registry, do NOT hallucinate
        return None

    def get_all(self) -> List[MedicineInfoOut]:
        return [MedicineInfoOut(**item) for item in self.catalog]

medicine_info_service = MedicineInformationService()

