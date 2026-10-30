export const en = {
  brand: {
    name: "DoseSaathi AI",
    tagline: "Understand your medicines. Stay on track.",
    subtitle: "Safety-first prescription assistant for Indian patients & families"
  },
  nav: {
    home: "Home",
    scanner: "Scanner",
    medicines: "My Medicines",
    reports: "Reports",
    profile: "Profile",
    about: "About"
  },
  onboarding: {
    headline: "Your prescription, made easier to understand.",
    subtext: "Scan a prescription, review medicine information and organize confirmed instructions in one place.",
    getStarted: "Get Started",
    languageSelect: "Choose your language",
    accessibilityHeader: "Comfort & Accessibility",
    largerText: "Larger text",
    voiceAssisted: "Voice-assisted guidance",
    privacyNotice: "Prescriptions contain sensitive medical details. Your records remain stored locally on your device unless you choose to export them for your doctor."
  },
  home: {
    greeting: "Vanakkam, Ramanathan",
    greetingSub: "Here is your medication summary for today",
    heroCard: {
      title: "Understand your prescription",
      desc: "Turn handwritten instructions into a readable, reviewable medicine list.",
      scanCTA: "Scan Prescription",
      uploadCTA: "Upload Photo",
      tip: "Takes about 10 seconds with clear lighting"
    },
    todaySection: {
      title: "Today's Schedule",
      nextReminder: "Next Confirmed Reminder",
      viewSchedule: "View today's schedule",
      noReminders: "No confirmed reminders yet. Scan a prescription to get started.",
      instructionStatus: "Confirmed with Doctor's Script",
      reportedTaken: "Reported taken",
      unconfirmedLabel: "Scheduled"
    },
    activitySection: {
      title: "Today's Activity",
      patientReported: "Patient-reported doses",
      skippedDoses: "Recorded skipped doses",
      unanswered: "Unconfirmed reminders",
      disclaimer: "Unanswered reminders are never assumed to be taken."
    },
    emptyState: {
      title: "No active prescriptions",
      desc: "Scan your paper prescription to extract medicines and set verified daily reminders."
    }
  },
  scanner: {
    title: "Prescription Scanner",
    tip: "Place the prescription on a flat surface in good lighting.",
    alignDoc: "Align doctor's slip inside the frame",
    captureBtn: "Capture Prescription",
    useSampleBtn: "Use Sample Indian Prescription (Dr. Sharma)",
    uploadFromDevice: "Upload from Gallery",
    retake: "Retake",
    processingTitle: "Analyzing Prescription",
    stage1: "1. Enhancing photo clarity",
    stage2: "2. Reading handwritten text",
    stage3: "3. Preparing details for your review",
    notice: "No medicine will be scheduled without your review and explicit confirmation."
  },
  review: {
    headline: "Review your prescription",
    subtitle: "Compare extracted details with the original handwritten slip before confirming.",
    viewOriginal: "View Original Handwriting",
    hideOriginal: "Hide Slip",
    highlightTip: "Tap any medicine to inspect its region on the prescription.",
    stateA: "Please review",
    stateB: "Needs clarification",
    stateC: "Confirmed",
    fields: {
      medName: "Medicine Name",
      strength: "Strength",
      dosage: "Dosage / Amount",
      frequency: "Frequency / Timing",
      duration: "Duration",
      instructions: "Meal Instructions"
    },
    editField: "Edit Details",
    saveField: "Save Changes",
    markConfirmed: "Confirm Instructions",
    unclearWarning: "This line is ambiguous in doctor's handwriting. Please verify with doctor or pharmacist before scheduling.",
    confirmAllCTA: "Confirm & Schedule Medicines",
    mustResolveWarning: "Please resolve unclear items before activating reminders.",
    saveDraft: "Save as Draft",
    retakeImage: "Retake Image"
  },
  explainer: {
    headline: "Understand your medicine",
    subtitle: "Plain-language medical purpose verified against official Indian drug standards.",
    whatDoesItDo: "What does it do?",
    confirmedInstructions: "Your Confirmed Prescription Instructions",
    sourceAttribution: "Information Source",
    consultDoctorNote: "This general explanation does not replace your doctor's specific advice. Never change doses without consulting your healthcare provider.",
    continueToSchedule: "Set Daily Reminders"
  },
  schedule: {
    headline: "Confirm & Schedule Medicines",
    subtitle: "Choose daily reminder times that align with your confirmed doctor's instructions.",
    timeSectionTitle: "Daily Reminder Times",
    mealTiming: "Meal Timing Relation",
    beforeMeal: "Before meal (Empty stomach)",
    afterMeal: "After meal",
    withMeal: "With meal",
    none: "Time-based only",
    startDate: "Start Date",
    endDate: "End Date (Optional)",
    confirmScheduleCTA: "Activate Verified Schedule",
    safetyNotice: "Reminders follow the confirmed instructions. They do not replace your doctor's advice. We never invent dosing times."
  },
  reminder: {
    title: "Medication Reminder",
    scheduledFor: "Scheduled for",
    actionTook: "I took it",
    actionSkipped: "I skipped it",
    actionNotSure: "Not sure",
    actionSnooze: "Snooze (15m)",
    skipReasonPrompt: "Why was this dose skipped?",
    reasons: {
      forgot: "Forgot / was away",
      ran_out: "Ran out of medicine",
      unclear_instructions: "Instructions were unclear",
      side_effect_issue: "Felt unwell / side effect",
      other: "Prefer not to say / other"
    },
    recordedSuccess: "Event recorded. Thank you for keeping your health record accurate.",
    neutralMissedNote: "If you missed a dose, do not take a double dose. Refer to your confirmed prescription instructions or speak with your doctor."
  },
  myMedicines: {
    title: "My Medicines",
    tabs: {
      active: "Active",
      pending: "Awaiting Review",
      discontinued: "Completed / Inactive"
    },
    noActive: "No active medications found.",
    scanNew: "Scan New Prescription",
    actions: {
      viewDetails: "Understand Medicine",
      viewSchedule: "Edit Schedule",
      discontinue: "Discontinue"
    }
  },
  reports: {
    title: "Your Medication Report",
    subtitle: "Doctor-ready adherence record showing patient-reported events.",
    filters: {
      thisWeek: "This Week",
      thisMonth: "This Month",
      custom: "Custom Period"
    },
    formulaExplainer: "Reported Adherence Rate = (Patient Taken + Caregiver Witnessed) ÷ Total Scheduled Doses × 100. Unanswered reminders are not counted as taken.",
    breakdownTitle: "Dose Status Breakdown",
    statTaken: "Patient-reported taken",
    statCaregiver: "Caregiver-witnessed",
    statSkipped: "Patient-reported skipped",
    statNotSure: "Uncertain",
    statUnconfirmed: "Unconfirmed reminders",
    generatePDF: "Generate Doctor Report (PDF)",
    downloadSuccess: "Doctor Report PDF generated successfully."
  },
  profile: {
    title: "Profile, Language & Privacy",
    languageSection: "Language Preferences",
    textSizeSection: "Text Display Size",
    sizes: {
      normal: "Standard (16px)",
      large: "Large (18px)",
      xl: "Extra Large (20px)"
    },
    voiceSection: "Voice Guidance",
    voiceDesc: "Spoken prompts and high-contrast cues for older adults",
    caregiverSection: "Caregiver Access & Permissions",
    caregiverDesc: "Designate a family member to monitor schedules and record doses on your behalf.",
    caregiverName: "Authorized Caregiver",
    caregiverPermissions: "Caregiver Permissions",
    permView: "View Only (Schedule & Reports)",
    permRecord: "View & Record (Can record doses on your behalf)",
    privacySection: "Data Privacy & Local Storage",
    privacyDesc: "Your prescriptions are processed solely to assist you and are never shared with third parties or insurers.",
    deleteDataBtn: "Delete All Local Prescription Data",
    deleteConfirm: "Are you sure you want to delete all stored prescriptions and medication logs from this device?",
    dataDeletedMsg: "All prescription data has been completely wiped from local storage."
  }
};

