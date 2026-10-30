from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from backend.config import REPORTS_DIR

def generate_doctor_report_pdf(
    patient_name: str,
    period_label: str,
    summary_data: dict,
    medicines: list,
    events: list,
    output_filename: str
) -> Path:
    """
    Generates a professional, doctor-ready medication report PDF using ReportLab.
    Strictly distinguishes patient-reported, caregiver-reported, skipped, and unconfirmed events.
    """
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = REPORTS_DIR / output_filename

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles adhering to brand palette (#123F3A, #138A7B, #25312F)
    primary_color = colors.HexColor("#123F3A")
    secondary_color = colors.HexColor("#138A7B")
    charcoal = colors.HexColor("#25312F")
    slate_grey = colors.HexColor("#66736F")
    amber_color = colors.HexColor("#D99026")
    mint_bg = colors.HexColor("#E6F4EF")
    ivory_bg = colors.HexColor("#F8F7F2")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=slate_grey
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=charcoal
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=charcoal
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("DOSESAATHI AI — MEDICATION LOG & ADHERENCE REPORT", title_style))
    story.append(Paragraph(f"Confidential Patient Report • Prepared for Healthcare Provider Consultation • Generated: {datetime.now().strftime('%d-%b-%Y %H:%M')}", subtitle_style))
    story.append(Spacer(1, 10))

    # 2. Patient & Period Details Table
    details_data = [
        [
            Paragraph(f"<b>Patient Name:</b> {patient_name}", body_style),
            Paragraph(f"<b>Reporting Period:</b> {period_label}", body_style)
        ],
        [
            Paragraph("<b>Primary Doctor / Clinic:</b> Dr. R. Sharma, MD", body_style),
            Paragraph(f"<b>Caregiver Recorded:</b> Priya (Daughter)", body_style)
        ]
    ]
    t_details = Table(details_data, colWidths=[270, 270])
    t_details.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ivory_bg),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_details)
    story.append(Spacer(1, 10))

    # 3. Transparent Adherence Summary Metrics
    story.append(Paragraph("Adherence Summary & Transparent Accounting", section_heading))

    total = summary_data.get("total_scheduled", 0)
    taken = summary_data.get("reported_taken", 0)
    caregiver = summary_data.get("caregiver_reported", 0)
    skipped = summary_data.get("reported_skipped", 0)
    not_sure = summary_data.get("not_sure", 0)
    unconfirmed = summary_data.get("unconfirmed", 0)
    rate = summary_data.get("reported_adherence_rate", 0.0)

    summary_table_data = [
        ["Total Scheduled", "Patient Reported Taken", "Caregiver Reported", "Reported Skipped", "Not Sure", "Unconfirmed Reminders", "Adherence Rate"],
        [str(total), str(taken), str(caregiver), str(skipped), str(not_sure), str(unconfirmed), f"{rate:.1f}%"]
    ]
    t_summary = Table(summary_table_data, colWidths=[75, 80, 75, 75, 60, 95, 80])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, mint_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_summary)

    # Explanation of calculation
    calc_note = Paragraph(
        "<b>Calculation Formula:</b> Reported Adherence Rate = (Patient Taken + Caregiver Witnessed) ÷ Total Scheduled Doses × 100.<br/>"
        "<b>Important Notice:</b> Unanswered / unconfirmed reminders are NOT counted as taken doses.",
        disclaimer_style
    )
    story.append(Spacer(1, 4))
    story.append(calc_note)
    story.append(Spacer(1, 10))

    # 4. Confirmed Active Medicines Table
    story.append(Paragraph("Confirmed Prescribed Medications", section_heading))
    med_rows = [["Medicine Name", "Dosage", "Schedule / Frequency", "Meal Instruction", "Status"]]
    for m in medicines:
        med_rows.append([
            m.get("medicine_name", "Unknown"),
            m.get("dosage", "1 dose"),
            m.get("frequency", "Daily"),
            m.get("meal_relation", "After meal").replace("_", " ").capitalize(),
            "Confirmed"
        ])
    if len(med_rows) == 1:
        med_rows.append(["No active medications confirmed", "-", "-", "-", "-"])

    t_meds = Table(med_rows, colWidths=[140, 70, 140, 110, 80])
    t_meds.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1A534C")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_meds)
    story.append(Spacer(1, 10))

    # 5. Adherence Events Log (Recent Entries)
    story.append(Paragraph("Detailed Medication Events Log (Recent)", section_heading))
    event_rows = [["Scheduled Time", "Medicine", "Recorded Status", "Source", "Patient Notes / Skipped Reason"]]
    for ev in events[:15]:  # Show recent 15 events
        status_clean = ev.get("status", "").replace("_", " ").title()
        reason = ev.get("skipped_reason") or ev.get("notes") or "—"
        if reason != "—":
            reason = reason.replace("_", " ").capitalize()
        event_rows.append([
            ev.get("scheduled_time", "—"),
            ev.get("medicine_name", "—"),
            status_clean,
            ev.get("reporting_source", "patient").title(),
            reason
        ])

    if len(event_rows) == 1:
        event_rows.append(["No events recorded in period", "—", "—", "—", "—"])

    t_events = Table(event_rows, colWidths=[90, 110, 110, 70, 160])
    t_events.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#334155")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_events)
    story.append(Spacer(1, 12))

    # 6. Clinical & Safety Disclaimers
    disclaimer_box = [
        [Paragraph(
            "<b>LEGAL & CLINICAL DISCLAIMER:</b><br/>"
            "This report is generated by DoseSaathi AI for consultation support between the patient and their healthcare provider. "
            "All dose events are self-reported by the patient or witnessed by a caregiver and do not constitute clinical verification of ingestion. "
            "AI prescription transcriptions are not medical advice and do not substitute for a licensed doctor's diagnosis, prescription, or clinical judgment. "
            "For questions regarding changes in medication dosage or symptoms, please contact the prescribing physician immediately.",
            disclaimer_style
        )]
    ]
    t_disc = Table(disclaimer_box, colWidths=[540])
    t_disc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ivory_bg),
        ('BOX', (0,0), (-1,-1), 1, amber_color),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(KeepTogether(t_disc))

    doc.build(story)
    return pdf_path

