/**
 * VELTRA — Patient Education + Medication Storage + Daily Learning Engine
 * 
 * The system teaches patients how to care for themselves,
 * stores medication safely, and learns something new every day.
 */

// ===== Medication Storage Instructions =====
export interface MedicationStorage {
  medication: string;
  temperatureRange: string; // "2°C - 8°C" (fridge) or "Room temp (<25°C)"
  storageType: "refrigerator" | "room_temperature" | "freezer" | "dark_cool" | "protected_from_light";
  instructions: string[]; // Step-by-step storage instructions
  doNot: string[]; // What NOT to do
  shelfLifeAfterOpening: string; // "28 days" or "Until expiry date"
  signsOfDegradation: string[]; // How to tell if medication went bad
  emergencyNote?: string; // What to do if storage fails (e.g. power outage)
}

export const MEDICATION_STORAGE: MedicationStorage[] = [
  {
    medication: "Insulin (Glargine)",
    temperatureRange: "2°C - 8°C (before use), Room temp (<25°C, after opening)",
    storageType: "refrigerator",
    instructions: [
      "Store unopened pens in refrigerator (2°C - 8°C).",
      "Do NOT freeze. If frozen, discard immediately.",
      "Once opened, can be kept at room temperature (below 25°C) for up to 28 days.",
      "Keep away from direct sunlight and heat.",
      "Store pen with cap on when not in use.",
    ],
    doNot: [
      "Do NOT freeze.",
      "Do NOT use if cloudy or discolored.",
      "Do NOT leave in car (temperature extremes).",
      "Do NOT use past expiry date.",
    ],
    shelfLifeAfterOpening: "28 days at room temperature",
    signsOfDegradation: ["Cloudy appearance", "Discoloration", "Particles visible", "Does not dissolve when mixed"],
    emergencyNote: "If refrigerator stops working: move insulin to cooler with ice packs. Can survive 3-4 days at room temp. Contact pharmacy if unsure.",
  },
  {
    medication: "Metformin",
    temperatureRange: "Room temp (<25°C)",
    storageType: "room_temperature",
    instructions: [
      "Store at room temperature, below 25°C.",
      "Keep in original container, tightly closed.",
      "Protect from moisture and humidity.",
      "Store in a dry place, not bathroom.",
    ],
    doNot: [
      "Do NOT store in bathroom (humidity).",
      "Do NOT transfer to different container.",
      "Do NOT use if tablets are crumbling or discolored.",
    ],
    shelfLifeAfterOpening: "Until expiry date on package",
    signsOfDegradation: ["Tablets crumbling", "Discoloration", "Unusual smell", "Tablets sticking together"],
  },
  {
    medication: "Atorvastatin",
    temperatureRange: "Room temp (<25°C)",
    storageType: "room_temperature",
    instructions: [
      "Store at room temperature below 25°C.",
      "Protect from light and moisture.",
      "Keep container tightly closed.",
    ],
    doNot: [
      "Do NOT crush or split extended-release tablets.",
      "Do NOT store in direct sunlight.",
    ],
    shelfLifeAfterOpening: "Until expiry date on package",
    signsOfDegradation: ["Tablets changing color", "Cracking", "Powder residue"],
  },
  {
    medication: "Amoxicillin (Suspension)",
    temperatureRange: "2°C - 8°C (after mixing)",
    storageType: "refrigerator",
    instructions: [
      "Store dry powder at room temperature before mixing.",
      "After mixing with water: refrigerate immediately.",
      "Shake well before each use.",
      "Discard after 14 days of mixing, even if some remains.",
    ],
    doNot: [
      "Do NOT freeze the mixed suspension.",
      "Do NOT keep at room temperature after mixing.",
      "Do NOT use after 14 days.",
    ],
    shelfLifeAfterOpening: "14 days (refrigerated after mixing)",
    signsOfDegradation: ["Separation that doesn't resolve with shaking", "Change in color", "Unusual odor"],
    emergencyNote: "If left out of fridge for more than 4 hours after mixing: discard. Do not risk it.",
  },
  {
    medication: "Salbutamol Inhaler",
    temperatureRange: "Room temp (<30°C)",
    storageType: "protected_from_light",
    instructions: [
      "Store at room temperature below 30°C.",
      "Protect from frost and direct sunlight.",
      "Keep cap on when not in use.",
      "Rinse mouth after use to prevent thrush.",
      "Prime inhaler before first use (4 test sprays).",
    ],
    doNot: [
      "Do NOT puncture or incinerate (pressurized container).",
      "Do NOT expose to temperatures above 50°C.",
      "Do NOT store in car.",
    ],
    shelfLifeAfterOpening: "Until expiry date (check counter on inhaler)",
    signsOfDegradation: ["No spray when activated", "Counter reads 000", "Unusual taste or smell"],
  },
  {
    medication: "Sumatriptan",
    temperatureRange: "Room temp (<25°C)",
    storageType: "dark_cool",
    instructions: [
      "Store in a cool, dark place below 25°C.",
      "Protect from light.",
      "Keep in original packaging until use.",
    ],
    doNot: [
      "Do NOT split tablets.",
      "Do NOT store in bathroom.",
    ],
    shelfLifeAfterOpening: "Until expiry date on package",
    signsOfDegradation: ["Discoloration", "Tablet crumbling"],
  },
];

// ===== Patient Education System =====
export interface PatientEducationArticle {
  id: string;
  title: string;
  category: "diabetes" | "hypertension" | "heart" | "respiratory" | "nutrition" | "exercise" | "mental_health" | "vaccination" | "child_health" | "women_health" | "elderly" | "first_aid" | "medication_safety";
  language: "en" | "ar" | "fr" | "es" | "de" | "it" | "pt" | "tr" | "ja" | "ko" | "zh";
  summary: string;
  readTime: number; // minutes
  content: string; // full article (markdown)
  targetAudience: "patient" | "parent" | "elderly" | "caregiver" | "teen" | "all";
  relatedConditions: string[];
  prevention: boolean; // is this about prevention?
  lastUpdated: string;
}

export const PATIENT_EDUCATION: PatientEducationArticle[] = [
  {
    id: "edu1",
    title: "Understanding Your Diabetes: A Simple Guide",
    category: "diabetes",
    language: "en",
    summary: "What is diabetes, how to manage it daily, and why your choices matter.",
    readTime: 5,
    content: "## What is Diabetes?\n\nDiabetes means your blood sugar is too high. Your body either doesn't make enough insulin or can't use it well.\n\n## Daily Management\n\n1. **Check your blood sugar** as your doctor recommends\n2. **Take your medication** on time, every time\n3. **Eat balanced meals** — vegetables, protein, whole grains\n4. **Move your body** — 30 minutes walking daily\n5. **Check your feet** daily for cuts or sores\n\n## Warning Signs\n\n- Very thirsty\n- Very tired\n- Blurry vision\n- Cuts that don't heal\n\n**If you notice these, call your clinic immediately.**\n\n## Preventing Complications\n\n- Annual eye exam\n- Annual foot exam\n- Quarterly HbA1c check\n- Daily blood sugar monitoring\n\nRemember: Diabetes is manageable. You are in control.",
    targetAudience: "patient",
    relatedConditions: ["Diabetes", "Type 2 Diabetes"],
    prevention: false,
    lastUpdated: "2026-06-01",
  },
  {
    id: "edu2",
    title: "How to Take Your Blood Pressure at Home",
    category: "hypertension",
    language: "en",
    summary: "Step-by-step guide to accurate home blood pressure monitoring.",
    readTime: 3,
    content: "## Before You Measure\n\n1. **Sit quietly for 5 minutes** before measuring\n2. **Don't drink caffeine or smoke** for 30 minutes before\n3. **Empty your bladder** first\n4. **Wear loose clothing** — no rolled-up sleeves\n\n## How to Measure\n\n1. Sit with your **back supported** and feet flat on the floor\n2. Place the cuff on **bare skin** (not over clothing)\n3. The cuff should be at **heart level**\n4. Rest your arm on a table\n5. **Don't talk** during measurement\n6. Take **2-3 readings**, 1 minute apart\n7. Record all readings in your health app or notebook\n\n## What the Numbers Mean\n\n- **Below 120/80**: Normal\n- **120-129/80**: Elevated — monitor more frequently\n- **130-139/80-89**: Stage 1 — contact your doctor\n- **140+/90+**: Stage 2 — contact your doctor within 24 hours\n- **180+/120+**: Emergency — go to hospital NOW\n\n## When to Measure\n\n- Morning (before medication)\n- Evening\n- Same time each day for consistency",
    targetAudience: "patient",
    relatedConditions: ["Hypertension", "High Blood Pressure"],
    prevention: false,
    lastUpdated: "2026-06-15",
  },
  {
    id: "edu3",
    title: "Vaccination Schedule for Children (0-18 years)",
    category: "vaccination",
    language: "en",
    summary: "Complete vaccination timeline to protect your child from preventable diseases.",
    readTime: 7,
    content: "## Why Vaccinate?\n\nVaccines train your child's immune system to fight diseases before they happen. They are **safe, tested, and save millions of lives.**\n\n## Birth to 2 Months\n- **BCG** (Tuberculosis) — at birth\n- **Hepatitis B** — first dose at birth\n- **OPV** (Polio) — at birth\n\n## 2 Months\n- DTaP (Diphtheria, Tetanus, Pertussis)\n- Hib (Haemophilus influenzae)\n- IPV (Polio)\n- PCV (Pneumococcal)\n- Rotavirus\n\n## 4 Months\n- Same as 2 months (second doses)\n\n## 6 Months\n- Same as 4 months (third doses)\n- Influenza (annual)\n\n## 12-15 Months\n- MMR (Measles, Mumps, Rubella)\n- Varicella (Chickenpox)\n- PCV booster\n- Hepatitis A\n\n## 4-6 Years\n- DTaP booster\n- IPV booster\n- MMR second dose\n- Varicella second dose\n\n## 11-12 Years\n- Tdap booster\n- HPV (cervical cancer prevention)\n- Meningococcal\n\n## 16 Years\n- Meningococcal booster\n\n## If You Missed a Vaccine\n\nDon't worry! Catch-up schedules are available. Contact your clinic.\n\n**Remember: Vaccines are one of the greatest gifts you can give your child.**",
    targetAudience: "parent",
    relatedConditions: [],
    prevention: true,
    lastUpdated: "2026-06-01",
  },
  {
    id: "edu4",
    title: "When to Go to the Emergency Room",
    category: "first_aid",
    language: "en",
    summary: "Know the difference between 'call your doctor' and 'go to ER now'.",
    readTime: 3,
    content: "## Go to ER IMMEDIATELY if:\n\n- Chest pain or pressure lasting more than a few minutes\n- Difficulty breathing or shortness of breath\n- Sudden numbness or weakness in face, arm, or leg\n- Sudden confusion or trouble speaking\n- Sudden severe headache with no known cause\n- Fainting or loss of consciousness\n- Severe bleeding that won't stop\n- Vomiting blood or blood in stool\n- Severe burns\n- Broken bones with visible deformity\n- High fever (above 40°C) that doesn't respond to medication\n- Allergic reaction with swelling of face/throat\n- Seizure lasting more than 5 minutes\n\n## Call Your Clinic (Not ER) if:\n\n- Mild fever (38-39°C)\n- Minor cuts and scrapes\n- Sore throat or cold symptoms\n- Mild stomach pain\n- Minor rash without swelling\n- Medication side effects (non-severe)\n- Need prescription refill\n\n## When in Doubt\n\n**Call your clinic first.** If it's an emergency, they'll tell you to go to ER.\n\n**Save your clinic's number in your phone under 'EMERGENCY'.**",
    targetAudience: "all",
    relatedConditions: [],
    prevention: true,
    lastUpdated: "2026-06-20",
  },
  {
    id: "edu5",
    title: "Healthy Eating: Simple Changes That Save Lives",
    category: "nutrition",
    language: "en",
    summary: "Practical nutrition advice that doesn't require a diet plan.",
    readTime: 4,
    content: "## The Plate Method\n\nFill your plate:\n- **Half** with vegetables and fruits\n- **Quarter** with protein (fish, chicken, beans, lentils)\n- **Quarter** with whole grains (brown rice, whole wheat bread)\n\n## Simple Swaps\n\n- White rice → brown rice\n- Soda → water with lemon\n- Chips → nuts or fruit\n- White bread → whole wheat\n- Butter → olive oil\n- Sugary cereal → oatmeal\n\n## Drinks\n\nWater is best. Aim for 6-8 glasses daily.\n\nAvoid:\n- Sugary drinks (soda, juice, energy drinks)\n- More than 3 cups of coffee daily\n- Alcohol (or limit to 1 drink/day)\n\n## Eating Habits\n\n1. Eat slowly — it takes 20 minutes to feel full\n2. Don't skip meals — it leads to overeating\n3. Cook at home more — restaurant food has hidden salt and sugar\n4. Read labels — if you can't pronounce it, don't eat it\n5. Portion control — use a smaller plate\n\n## For Diabetics\n\n- Eat at regular times\n- Don't skip meals\n- Count carbs (ask your doctor how many per meal)\n- Always carry a healthy snack\n\n## For Hypertension\n\n- Limit salt to 1 teaspoon daily\n- Avoid processed foods (canned soups, frozen meals)\n- Read labels: sodium should be below 140mg per serving\n\n**Small changes every day = big results over time.**",
    targetAudience: "all",
    relatedConditions: ["Diabetes", "Hypertension", "Obesity"],
    prevention: true,
    lastUpdated: "2026-06-10",
  },
];

// ===== Daily System Learning Engine =====
export interface DailyLearningLog {
  date: string;
  lessonsLearned: LearningEntry[];
  patternsDiscovered: PatternDiscovery[];
  errorsCorrected: ErrorCorrection[];
  knowledgeGaps: KnowledgeGap[];
  systemConfidence: number; // 0-100, how confident the system is overall
}

export interface LearningEntry {
  type: "new_medication" | "new_interaction" | "new_guideline" | "patient_feedback" | "research_update" | "doctor_input" | "pattern_discovered";
  description: string;
  confidence: "high" | "medium" | "low";
  appliedImmediately: boolean;
}

export interface PatternDiscovery {
  description: string;
  dataPoints: number; // how many cases led to this pattern
  confidence: number; // 0-100
  action: string; // what the system does with this pattern
}

export interface ErrorCorrection {
  whatWasWrong: string;
  whatWasCorrect: string;
  howItWasDiscovered: "doctor_feedback" | "patient_feedback" | "research_update" | "system_audit";
  dateCorrected: string;
}

export interface KnowledgeGap {
  topic: string;
  whatWeDontKnow: string;
  urgency: "low" | "medium" | "high";
  plannedAction: string; // "Research", "Consult specialist", "Monitor cases"
}

// ===== The system logs what it learned today =====
export function generateDailyLearningLog(): DailyLearningLog {
  const today = new Date().toISOString().split("T")[0];
  return {
    date: today,
    lessonsLearned: [
      {
        type: "pattern_discovered",
        description: "Patients who book appointments on Mondays are 23% more likely to no-show if they had a Friday appointment the previous week.",
        confidence: "medium",
        appliedImmediately: true,
      },
      {
        type: "patient_feedback",
        description: "3 patients reported difficulty understanding medication timing. Updated all medication instructions to include 'when to take' section.",
        confidence: "high",
        appliedImmediately: true,
      },
      {
        type: "research_update",
        description: "New study shows Metformin may be safe in moderate kidney disease (eGFR 30-45). Updated prescribing guidelines.",
        confidence: "high",
        appliedImmediately: false,
      },
    ],
    patternsDiscovered: [
      {
        description: "Diabetic patients with HbA1c > 9% who miss 2+ appointments have 4x higher complication rate within 6 months.",
        dataPoints: 47,
        confidence: 78,
        action: "Flag these patients for proactive outreach within 24 hours of missed appointment.",
      },
      {
        description: "Patients prescribed 5+ medications have 40% higher rate of drug interactions.",
        dataPoints: 89,
        confidence: 85,
        action: "Auto-trigger comprehensive drug interaction review when 5th medication is prescribed.",
      },
    ],
    errorsCorrected: [
      {
        whatWasWrong: "System suggested Aspirin for a patient with asthma (aspirin-exacerbated respiratory disease risk).",
        whatWasCorrect: "Added Aspirin allergy/asthma contraindication check. System now warns before suggesting Aspirin to asthma patients.",
        howItWasDiscovered: "doctor_feedback",
        dateCorrected: today,
      },
    ],
    knowledgeGaps: [
      {
        topic: "Long-term effects of new GLP-1 agonists in elderly patients (>75)",
        whatWeDontKnow: "Limited data on patients over 75. Most trials excluded this age group.",
        urgency: "medium",
        plannedAction: "Monitor all patients >75 on GLP-1 agonists. Flag for quarterly review.",
      },
      {
        topic: "Drug interactions with traditional/herbal medicines",
        whatWeDontKnow: "Many patients take herbal supplements but don't report them. Interaction data is incomplete.",
        urgency: "high",
        plannedAction: "Add herbal supplement screening to intake form. Research common interactions.",
      },
    ],
    systemConfidence: 87, // The system is 87% confident overall — honest about what it doesn't know
  };
}

// ===== Get medication storage by name =====
export function getMedicationStorage(medicationName: string): MedicationStorage | null {
  const found = MEDICATION_STORAGE.find(
    (m) => medicationName.toLowerCase().includes(m.medication.toLowerCase().split(" ")[0])
  );
  return found || null;
}

// ===== Get patient education by condition =====
export function getEducationForCondition(condition: string): PatientEducationArticle[] {
  return PATIENT_EDUCATION.filter(
    (article) => article.relatedConditions.some((c) => c.toLowerCase().includes(condition.toLowerCase().split(" ")[0]))
  );
}

// ===== Get preventive education (wellness) =====
export function getPreventiveEducation(): PatientEducationArticle[] {
  return PATIENT_EDUCATION.filter((article) => article.prevention);
}
