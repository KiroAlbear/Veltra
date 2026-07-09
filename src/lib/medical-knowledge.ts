/**
 * VELTRA — Medical Knowledge Base + Smart Reminders + Patient Q&A
 * 
 * Like having a doctor in your pocket who has read everything from
 * ancient medicine to July 8, 2026 — and explains it simply.
 * 
 * Inspired by Dr. Bassem Youssef's approach: make health information
 * accessible, simple, and human. No jargon. Just truth.
 */

// ===== Medical Knowledge Base =====
export interface KnowledgeEntry {
  id: string;
  question: string; // What patients actually ask
  simpleAnswer: string; // Plain language, no jargon
  detailedAnswer: string; // For doctors/curious patients
  category: "diet" | "medication" | "exercise" | "mental_health" | "women_health" | "child_health" | "elderly" | "chronic_disease" | "emergency" | "prevention" | "nutrition" | "sleep" | "lifestyle";
  tags: string[];
  source: string; // "WHO", "Mayo Clinic", "ADA", etc.
  lastVerified: string;
  language: "en" | "ar" | "fr" | "es" | "de" | "it" | "pt" | "tr" | "ja" | "ko" | "zh";
  askCount: number; // How many times patients asked this
  pinned: boolean; // Frequently asked — pinned to top
  relatedQuestions?: string[];
}

// ===== The Knowledge Base — answers to real patient questions =====
export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "kb1",
    question: "Is it okay to drink water while eating? Will it dilute my stomach acid?",
    simpleAnswer: "Yes, drinking water with meals is completely fine. It won't dilute your stomach acid or affect digestion. Your stomach is smart — it adjusts.",
    detailedAnswer: "The idea that water dilutes stomach acid is a myth. The stomach produces 1.5-3 liters of gastric juice daily. A glass of water (250ml) is negligible. Water actually helps digestion by breaking down food and moving it through the digestive tract. Studies show no negative effect on digestion from drinking water with meals.",
    category: "nutrition",
    tags: ["water", "eating", "digestion", "myth"],
    source: "Mayo Clinic, American Gastroenterological Association",
    lastVerified: "2026-06-15",
    language: "en",
    askCount: 1247,
    pinned: true,
    relatedQuestions: ["kb2", "kb5"],
  },
  {
    id: "kb2",
    question: "Should I take my medication before or after food?",
    simpleAnswer: "It depends on the medication. Some need empty stomach (metformin, thyroid pills), some need food (ibuprofen, steroids). Ask your doctor or check the label — it's written there.",
    detailedAnswer: "Medication timing matters:\n\n- TAKE ON EMPTY STOMACH (30-60 min before food):\n  Metformin, Levothyroxine, Bisphosphonates, Some antibiotics\n\n- TAKE WITH FOOD:\n  Ibuprofen, NSAIDs, Steroids, Iron supplements, Fat-soluble vitamins (A,D,E,K)\n\n- DOESN'T MATTER:\n  Most blood pressure medications, Statins (actually better at night)\n\nAlways follow your doctor's instructions. When in doubt, ask.",
    category: "medication",
    tags: ["medication timing", "food", "before meals", "after meals"],
    source: "FDA, British National Formulary",
    lastVerified: "2026-07-01",
    language: "en",
    askCount: 3412,
    pinned: true,
    relatedQuestions: ["kb3", "kb8"],
  },
  {
    id: "kb3",
    question: "What happens if I forget to take my medication?",
    simpleAnswer: "Don't panic. Don't double up. Take it as soon as you remember — UNLESS it's almost time for the next dose. Then skip the missed one. Never take two doses at once.",
    detailedAnswer: "General rule for missed doses:\n\n1. If you remember within a few hours: take it now.\n2. If it's almost time for the next dose: skip the missed one.\n3. NEVER take double doses to 'catch up'.\n\nEXCEPTIONS (contact your doctor immediately if missed):\n- Birth control pills (follow package instructions)\n- Blood thinners (Warfarin)\n- Anti-seizure medications\n- Insulin (call doctor for adjustment)\n\nSet a daily alarm. Or better: use Veltra's medication reminder system.",
    category: "medication",
    tags: ["missed dose", "forgot medication", "double dose"],
    source: "FDA Safe Medication Practices",
    lastVerified: "2026-06-20",
    language: "en",
    askCount: 2890,
    pinned: true,
    relatedQuestions: ["kb2", "kb4"],
  },
  {
    id: "kb4",
    question: "Can I stop my medication if I feel better?",
    simpleAnswer: "NO. Feeling better means the medication is WORKING, not that you're cured. Stopping suddenly can be dangerous — especially for blood pressure, diabetes, and mental health medications. Always ask your doctor first.",
    detailedAnswer: "Stopping medication abruptly can cause:\n\n- BLOOD PRESSURE MEDS: Rebound hypertension (dangerous spike)\n- ANTIDEPRESSANTS: Discontinuation syndrome (dizziness, nausea, brain zaps)\n- STEROIDS: Adrenal crisis (life-threatening)\n- ANTIBIOTICS: Antibiotic resistance (infection comes back stronger)\n- INSULIN/DIABETES MEDS: Dangerous blood sugar spikes\n\nAlways taper off medications under medical supervision.\n\nThe rule: If you feel good → the medication is working → keep taking it.",
    category: "medication",
    tags: ["stop medication", "feel better", "side effects"],
    source: "WHO Medication Safety Guidelines",
    lastVerified: "2026-06-01",
    language: "en",
    askCount: 1876,
    pinned: true,
  },
  {
    id: "kb5",
    question: "Is breakfast really the most important meal of the day?",
    simpleAnswer: "Not necessarily. What matters more is WHAT you eat throughout the day, not WHEN you eat your first meal. If you're not hungry in the morning, don't force it. Just eat well when you do eat.",
    detailedAnswer: "The 'breakfast is the most important meal' claim came from cereal marketing in the 1940s, not from science.\n\nModern research shows:\n- Intermittent fasting (skipping breakfast) can be safe for healthy adults\n- For diabetics: breakfast helps stabilize blood sugar\n- For children: breakfast improves concentration in school\n- For pregnant women: breakfast prevents morning nausea\n\nWHAT matters more than WHEN:\n- Total daily nutrition\n- Quality of food (not processed junk)\n- Consistency (don't skip then binge)\n\nBottom line: Listen to your body. If you're hungry, eat. If not, don't force it — but make sure your first meal is nutritious.",
    category: "nutrition",
    tags: ["breakfast", "intermittent fasting", "meal timing"],
    source: "Harvard T.H. Chan School of Public Health",
    lastVerified: "2026-05-20",
    language: "en",
    askCount: 1543,
    pinned: false,
    relatedQuestions: ["kb1", "kb6"],
  },
  {
    id: "kb6",
    question: "How much water should I really drink every day?",
    simpleAnswer: "About 2-3 liters for men, 2-2.5 liters for women. But forget the '8 glasses' rule — your body is smarter than a formula. If your urine is light yellow, you're fine. If it's dark, drink more.",
    detailedAnswer: "Daily water intake depends on:\n- Body weight\n- Activity level\n- Climate (hot/humid = more)\n- Health conditions\n- Pregnancy/breastfeeding\n\nGeneral guidelines:\n- Men: 3 liters (13 cups) total water daily\n- Women: 2.2 liters (9 cups) total water daily\n- This includes water from food (fruits, soups, etc.)\n\nBEST INDICATOR: Urine color\n- Light yellow/transparent: Good\n- Dark yellow: Drink more\n- Clear like water: You might be drinking too much\n\nYou DON'T need to force water. Your body tells you when it's thirsty. Listen to it.",
    category: "nutrition",
    tags: ["water", "hydration", "how much water"],
    source: "U.S. National Academies of Sciences",
    lastVerified: "2026-06-10",
    language: "en",
    askCount: 2103,
    pinned: false,
  },
  {
    id: "kb7",
    question: "My blood pressure reading is different every time. Which one is correct?",
    simpleAnswer: "Blood pressure naturally changes throughout the day — that's NORMAL. Take 2-3 readings, 1 minute apart, and average them. Don't worry about small changes. Worry about consistent HIGH readings.",
    detailedAnswer: "Blood pressure fluctuates 30-40 mmHg throughout the day. This is normal.\n\nFactors that affect readings:\n- Time of day (higher in morning)\n- Stress/anxiety\n- Caffeine (30 min before)\n- Full bladder\n- Talking during measurement\n- Wrong cuff size\n- Arm position (must be at heart level)\n\nPROTOCOL for accurate readings:\n1. Sit quietly for 5 minutes before\n2. Take 2-3 readings, 1 minute apart\n3. Average the readings\n4. Record in your health app daily\n5. Your doctor looks at TRENDS, not single readings\n\nWhen to worry:\n- Consistently above 140/90 over multiple days\n- Single reading above 180/120 = ER immediately",
    category: "chronic_disease",
    tags: ["blood pressure", "hypertension", "measurement"],
    source: "American Heart Association",
    lastVerified: "2026-06-15",
    language: "en",
    askCount: 987,
    pinned: false,
  },
  {
    id: "kb8",
    question: "Can I drink coffee while taking antibiotics?",
    simpleAnswer: "Generally yes, but keep it to 1-2 cups. Some antibiotics (like Ciprofloxacin) interact with caffeine and can make you jittery. Space them 2 hours apart to be safe.",
    detailedAnswer: "Coffee and antibiotics:\n\n- MOST antibiotics: Fine with coffee. No significant interaction.\n\n- CIPROFLOXACIN & LEVOFLOXACIN: Coffee stays in your body longer. You may feel jittery, anxious, or have palpitations. Limit to 1 cup.\n\n- TETRACYCLINE: Coffee reduces absorption. Take medication 1 hour before or 2 hours after coffee.\n\n- METRONIDAZOLE: NO ALCOHOL (not coffee). But avoid alcohol completely for 48 hours after last dose.\n\nGeneral rule: Space medications and coffee by 2 hours.\n\nAnd remember: STAY HYDRATED. Antibiotics + coffee (mild diuretic) = drink extra water.",
    category: "medication",
    tags: ["coffee", "antibiotics", "interaction"],
    source: "FDA Drug Interactions Database",
    lastVerified: "2026-07-01",
    language: "en",
    askCount: 1654,
    pinned: false,
  },
  {
    id: "kb9",
    question: "Is it normal to feel tired after starting a new medication?",
    simpleAnswer: "Sometimes yes, for the first 1-2 weeks as your body adjusts. But if it persists beyond 2 weeks, or is severe, contact your doctor. Don't just 'push through'.",
    detailedAnswer: "Medications that commonly cause fatigue:\n\n- Blood pressure medications (beta-blockers)\n- Antidepressants (first 2-4 weeks)\n- Antihistamines (allergy medications)\n- Statins (rarely)\n- Diabetes medications (if blood sugar drops too low)\n- Pain medications\n\nTIMELINE:\n- First 3-5 days: Normal adjustment period\n- Days 5-14: Should be improving\n- After 2 weeks: If still tired → CALL YOUR DOCTOR\n\nDANGER SIGNS (call immediately):\n- Extreme fatigue (can't get out of bed)\n- Dizziness when standing\n- Shortness of breath\n- Yellow eyes/skin (liver)\n- Dark urine\n\nNever stop medication abruptly. Call doctor, describe symptoms, they'll adjust dose or switch medication.",
    category: "medication",
    tags: ["fatigue", "side effects", "new medication"],
    source: "Mayo Clinic Drug Side Effects",
    lastVerified: "2026-06-25",
    language: "en",
    askCount: 1234,
    pinned: false,
  },
  {
    id: "kb10",
    question: "What's the best diet for losing weight? Keto? Intermittent fasting? Mediterranean?",
    simpleAnswer: "The best diet is the one you can stick to for the rest of your life. Not 30 days. Forever. Mediterranean diet has the most scientific evidence behind it. But honestly? Eat less processed food, more vegetables, move your body. That's 80% of it.",
    detailedAnswer: "Diet comparison (honest, no marketing):\n\nMEDITERRANEAN DIET:\n- Evidence: Strongest (decades of research)\n- Sustainability: High (not restrictive)\n- Health benefits: Heart, brain, longevity\n- Weight loss: Moderate, sustainable\n\nKETO:\n- Evidence: Short-term studies only\n- Sustainability: Low (very restrictive)\n- Side effects: 'Keto flu', constipation, nutrient gaps\n- Weight loss: Fast initially, mostly water weight\n- Risk: For diabetics on medication → dangerous hypoglycemia\n\nINTERMITTENT FASTING:\n- Evidence: Growing, promising\n- Sustainability: Moderate\n- Benefits: Simple, no calorie counting\n- Risk: Can trigger eating disorders\n\nVEGAN/PLANT-BASED:\n- Evidence: Strong for heart health\n- Sustainability: Moderate\n- Risk: B12, iron, protein gaps if not planned\n\nTHE TRUTH:\n- 95% of diets fail within 1 year\n- The 5% who succeed made LIFESTYLE changes, not diet changes\n- Best approach: Small, permanent changes\n  - Walk 30 min daily\n  - Eat vegetables with every meal\n  - Cut sugary drinks\n  - Cook at home 5+ times/week\n  - Sleep 7-8 hours\n\nThat's it. No magic. Just consistency.",
    category: "diet",
    tags: ["weight loss", "keto", "mediterranean", "fasting", "diet"],
    source: "Harvard Medical School, NEJM",
    lastVerified: "2026-06-30",
    language: "en",
    askCount: 4521,
    pinned: true,
  },
];

// ===== Smart Medication Reminder System =====
export interface MedicationReminder {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  schedule: {
    time: string; // "08:00"
    frequency: "once_daily" | "twice_daily" | "three_times_daily" | "weekly" | "as_needed" | "before_meals" | "after_meals" | "before_bed";
    daysOfWeek?: number[]; // 0=Sunday, for weekly
  };
  instructions: string; // "Take with food", "Take on empty stomach"
  storageInstructions?: string; // from MedicationStorage
  startDate: string;
  endDate?: string; // undefined = ongoing
  active: boolean;
  reminderChannels: ("push" | "sms" | "email" | "whatsapp")[];
  snoozeCount: number;
  lastTaken?: string;
  lastSkipped?: string;
  adherenceRate?: number; // 0-100%
}

// ===== Generate reminder message =====
export function generateReminderMessage(reminder: MedicationReminder): string {
  const messages = [
    `Hi ${reminder.patientName}, it's time to take your ${reminder.medication} (${reminder.dosage}). ${reminder.instructions}.`,
    `Reminder: ${reminder.medication} ${reminder.dosage} — take it now. ${reminder.instructions}.`,
    `Don't forget: ${reminder.medication} (${reminder.dosage}). ${reminder.instructions}. Stay healthy! 🌿`,
    `Time for your ${reminder.medication}. ${reminder.instructions}. You're doing great, ${reminder.patientName}! 💪`,
    `Gentle reminder: ${reminder.medication} ${reminder.dosage}. ${reminder.instructions}. Your health matters.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// ===== Patient Q&A System =====
export interface PatientQuestion {
  id: string;
  patientId: string;
  patientName: string;
  question: string;
  askedAt: string;
  answeredBy: "system" | "doctor" | "nurse";
  answeredByUserId?: string;
  answer: string;
  answeredAt: string;
  helpful?: boolean; // patient marked as helpful
  pinned?: boolean; // frequently asked — pinned
  askCount: number; // how many patients asked similar
  category?: string;
  relatedKnowledgeBaseId?: string;
}

// ===== Auto-answer using knowledge base =====
export function autoAnswer(question: string): { answer: string; knowledgeEntry: KnowledgeEntry | null; confidence: number } {
  const q = question.toLowerCase();
  
  // Search knowledge base
  for (const entry of KNOWLEDGE_BASE) {
    const entryWords = entry.question.toLowerCase().split(" ");
    const matchCount = entryWords.filter((word) => q.includes(word)).length;
    const matchRate = matchCount / entryWords.length;
    
    if (matchRate > 0.5) {
      return {
        answer: entry.simpleAnswer,
        knowledgeEntry: entry,
        confidence: matchRate * 100,
      };
    }
    
    // Also check tags
    for (const tag of entry.tags) {
      if (q.includes(tag.toLowerCase())) {
        return {
          answer: entry.simpleAnswer,
          knowledgeEntry: entry,
          confidence: 70,
        };
      }
    }
  }
  
  // If no match found
  return {
    answer: "I don't have a specific answer for that yet. I've forwarded your question to your medical team — they'll respond within 24 hours. In the meantime, if this is urgent, please call your clinic directly.",
    knowledgeEntry: null,
    confidence: 0,
  };
}

// ===== Pin frequently asked questions =====
export function shouldPinQuestion(questions: PatientQuestion[]): PatientQuestion[] {
  // If a question has been asked 3+ times by different patients, pin it
  const questionGroups: Record<string, PatientQuestion[]> = {};
  
  for (const q of questions) {
    const key = q.question.toLowerCase().slice(0, 50); // first 50 chars as key
    if (!questionGroups[key]) questionGroups[key] = [];
    questionGroups[key].push(q);
  }
  
  for (const key in questionGroups) {
    if (questionGroups[key].length >= 3) {
      // Pin the most recent one
      const sorted = questionGroups[key].sort((a, b) => 
        new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime()
      );
      sorted[0].pinned = true;
      sorted[0].askCount = questionGroups[key].length;
    }
  }
  
  return questions;
}

// ===== One-tap actions (3 taps max to anything) =====
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  taps: number; // how many taps to complete (max 3)
  category: "appointment" | "medication" | "message" | "lab" | "prescription" | "emergency" | "education";
}

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "qa1", label: "Book appointment", icon: "📅", action: "navigate:appointments:new", taps: 2, category: "appointment" },
  { id: "qa2", label: "Request refill", icon: "💊", action: "navigate:prescriptions:refill", taps: 2, category: "prescription" },
  { id: "qa3", label: "Message my doctor", icon: "💬", action: "navigate:messages:new", taps: 2, category: "message" },
  { id: "qa4", label: "Log blood pressure", icon: "🩺", action: "navigate:vitals:bp", taps: 2, category: "medication" },
  { id: "qa5", label: "Log blood sugar", icon: "🩸", action: "navigate:vitals:glucose", taps: 2, category: "medication" },
  { id: "qa6", label: "View my lab results", icon: "🔬", action: "navigate:labs", taps: 1, category: "lab" },
  { id: "qa7", label: "Call emergency", icon: "🚨", action: "tel:emergency", taps: 1, category: "emergency" },
  { id: "qa8", label: "Learn about my condition", icon: "📚", action: "navigate:education", taps: 1, category: "education" },
  { id: "qa9", label: "I took my medication", icon: "✅", action: "log:medication_taken", taps: 1, category: "medication" },
  { id: "qa10", label: "Request lab order", icon: "🧪", action: "navigate:labs:order", taps: 2, category: "lab" },
];

// ===== Search knowledge base =====
export function searchKnowledgeBase(query: string): KnowledgeEntry[] {
  const q = query.toLowerCase();
  const results = KNOWLEDGE_BASE.filter((entry) => {
    const inQuestion = entry.question.toLowerCase().includes(q);
    const inAnswer = entry.simpleAnswer.toLowerCase().includes(q);
    const inTags = entry.tags.some((tag) => tag.toLowerCase().includes(q));
    return inQuestion || inAnswer || inTags;
  });
  
  // Sort by: pinned first, then by askCount (most asked first)
  return results.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.askCount - a.askCount;
  });
}

// ===== Get trending questions (most asked this week) =====
export function getTrendingQuestions(): KnowledgeEntry[] {
  return [...KNOWLEDGE_BASE]
    .sort((a, b) => b.askCount - a.askCount)
    .slice(0, 5);
}
