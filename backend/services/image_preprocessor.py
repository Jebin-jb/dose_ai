import cv2
import numpy as np
from pathlib import Path
from PIL import Image

def preprocess_prescription_image(image_path: Path, output_dir: Path) -> dict:
    """
    Preprocesses prescription image to improve legibility of handwritten ink
    using OpenCV while strictly keeping the pristine original image intact.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    processed_filename = f"proc_{image_path.name}"
    processed_path = output_dir / processed_filename

    # Read image using OpenCV
    img = cv2.imread(str(image_path))
    if img is None:
        # Fallback to PIL if OpenCV fails to decode
        pil_img = Image.open(image_path)
        img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    h, w = img.shape[:2]

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Calculate blur/clarity metric (Laplacian variance)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    clarity_assessment = "Good" if laplacian_var > 100 else ("Moderate" if laplacian_var > 40 else "Low clarity / Blurry")

    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) for handwritten ink contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced_gray = clahe.apply(gray)

    # Denoise slightly while preserving thin handwritten edges
    denoised = cv2.fastNlMeansDenoising(enhanced_gray, h=7)

    # Save processed image
    cv2.imwrite(str(processed_path), denoised)

    return {
        "original_path": str(image_path),
        "processed_path": str(processed_path),
        "processed_filename": processed_filename,
        "width": w,
        "height": h,
        "clarity_score": round(laplacian_var, 1),
        "clarity_assessment": clarity_assessment,
        "steps_applied": [
            "Grayscale conversion",
            "Adaptive CLAHE contrast enhancement",
            "Edge-preserving handwritten ink denoising"
        ]
    }

