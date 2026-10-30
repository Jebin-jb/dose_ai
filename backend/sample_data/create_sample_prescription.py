import os
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

def generate_sample_prescription_image(output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    width = 900
    height = 1200

    # Warm ivory paper background
    img = Image.new("RGB", (width, height), color="#FAF8F3")
    draw = ImageDraw.Draw(img)

    # Subtle doctor letterhead border
    draw.rectangle([30, 30, width - 30, height - 30], outline="#123F3A", width=2)
    draw.line([30, 180, width - 30, 180], fill="#123F3A", width=2)

    # Doctor letterhead header
    draw.text((60, 50), "SHANTI MULTISPECIALITY CLINIC & DIABETES CARE", fill="#123F3A")
    draw.text((60, 80), "Dr. R. Sharma, M.D. (Internal Medicine), Reg. No: TN-48291", fill="#25312F")
    draw.text((60, 105), "42, Anna Salai, T. Nagar, Chennai - 600017 | Ph: 044-28194020", fill="#66736F")
    draw.text((60, 130), "Timings: Mon - Sat 9:00 AM - 1:00 PM, 5:30 PM - 8:30 PM", fill="#66736F")

    # Patient info bar
    draw.rectangle([50, 200, width - 50, 260], fill="#F0EFE9", outline="#CBD5E1")
    draw.text((70, 215), "Patient: Ramanathan Iyer", fill="#25312F")
    draw.text((380, 215), "Age/Sex: 64 / M", fill="#25312F")
    draw.text((580, 215), "Date: 28-10-2026", fill="#25312F")
    draw.text((70, 235), "BP: 138/86 mmHg", fill="#66736F")
    draw.text((380, 235), "FBS: 142 mg/dL", fill="#66736F")
    draw.text((580, 235), "Diagnosis: T2DM + Hypertension", fill="#66736F")

    # Large Rx Symbol
    draw.text((70, 290), "Rx", fill="#123F3A")
    draw.line([70, 340, 120, 340], fill="#123F3A", width=2)

    # Handwritten prescription entries (simulated realistic medical pen script)
    # Item 1: Glycomet
    draw.text((100, 370), "1) Tab. Glycomet 500 mg", fill="#1A202C")
    draw.text((140, 405), "   1 - 0 - 1  (p.c. - after meals)  x 30 days", fill="#1A202C")

    # Item 2: Telma
    draw.text((100, 480), "2) Tab. Telma 40 mg", fill="#1A202C")
    draw.text((140, 515), "   1 - 0 - 0  (b.b.f. - before breakfast)  x 30 days", fill="#1A202C")

    # Item 3: Pan 40
    draw.text((100, 590), "3) Cap. Pan 40 mg", fill="#1A202C")
    draw.text((140, 625), "   1  O.D.  (empty stomach / a.c.)  x 15 days", fill="#1A202C")

    # Item 4: Advice
    draw.line([70, 720, width - 70, 720], fill="#E2E8F0", width=1)
    draw.text((100, 740), "Adv: - Low salt, low glycemic index diet", fill="#4A5568")
    draw.text((100, 770), "     - 30 mins brisk morning walk", fill="#4A5568")
    draw.text((100, 800), "     - Review after 1 month with fasting blood sugar & serum creatinine", fill="#4A5568")

    # Doctor signature and stamp
    draw.line([600, 960, 820, 960], fill="#25312F", width=2)
    draw.text((640, 970), "Dr. R. Sharma, M.D.", fill="#25312F")
    draw.text((630, 995), "Regd. Medical Practitioner", fill="#66736F")

    # Stamp seal
    draw.ellipse([610, 880, 810, 950], outline="#1E40AF", width=2)
    draw.text((635, 905), "SHANTI CLINIC - CHENNAI", fill="#1E40AF")

    # Footer note
    draw.text((70, 1130), "Important: Please verify medicines with your pharmacist before taking. Keep out of reach of children.", fill="#94A3B8")

    img.save(output_path, "JPEG", quality=92)
    print(f"Sample prescription saved to: {output_path}")

if __name__ == "__main__":
    from backend.config import UPLOADS_DIR
    generate_sample_prescription_image(UPLOADS_DIR / "sample_prescription_dr_sharma.jpg")

