// Veltra Homepage Rewrite — DOCX generator
// Run: NODE_PATH=$(npm root -g) node /home/z/my-project/scripts/homepage-rewrite.js

const {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  AlignmentType, HeadingLevel, PageNumber, PageBreak,
  BorderStyle, ShadingType, Table, TableRow, TableCell,
  WidthType, LevelFormat, NumberFormat
} = require("docx");
const fs = require("fs");

// ===== PALETTE =====
const P = {
  primary: "0A0A0A",
  body: "1F1E1B",
  secondary: "5C5750",
  muted: "8A847A",
  accent: "8B6B3D",     // muted amber for accent
  accentLight: "D4A574",
  rule: "C8C2B6",
  surface: "F5F1EA",
};
const c = (hex) => hex.replace("#", "");

// ===== COMPONENT BUILDERS =====
function eyebrow(text) {
  return new Paragraph({
    spacing: { before: 360, after: 120, line: 280 },
    children: [new TextRun({
      text: text.toUpperCase(),
      size: 16,
      bold: true,
      color: c(P.accent),
      font: "Calibri",
      characterSpacing: 60,
    })],
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 120, after: 200, line: 280 },
    children: [new TextRun({
      text: text,
      size: 56,
      bold: false,
      color: c(P.primary),
      font: "Calibri",
    })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 180, line: 300 },
    children: [new TextRun({
      text: text,
      size: 36,
      bold: false,
      color: c(P.primary),
      font: "Calibri",
    })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 280, after: 120, line: 280 },
    children: [new TextRun({
      text: text,
      size: 24,
      bold: true,
      color: c(P.primary),
      font: "Calibri",
    })],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 160, line: 320 },
    children: [new TextRun({
      text: text,
      size: 22,
      color: c(P.body),
      font: "Calibri",
      ...opts,
    })],
  });
}

function bodyLead(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 200, line: 340 },
    children: [new TextRun({
      text: text,
      size: 28,
      color: c(P.primary),
      font: "Calibri",
    })],
  });
}

function meta(text) {
  return new Paragraph({
    spacing: { after: 80, line: 280 },
    children: [new TextRun({
      text: text,
      size: 18,
      color: c(P.muted),
      font: "Calibri",
      italics: true,
    })],
  });
}

function rule() {
  return new Paragraph({
    spacing: { before: 120, after: 240 },
    border: {
      bottom: { color: c(P.rule), style: BorderStyle.SINGLE, size: 6 },
    },
    children: [new TextRun({ text: "" })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 100, line: 300 },
    indent: { left: 720 + (level * 360), hanging: 280 },
    children: [new TextRun({
      text: text,
      size: 22,
      color: c(P.body),
      font: "Calibri",
    })],
  });
}

function quote(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 240, line: 320 },
    indent: { left: 360 },
    border: {
      left: { color: c(P.accent), style: BorderStyle.SINGLE, size: 18 },
    },
    children: [new TextRun({
      text: text,
      size: 26,
      italics: true,
      color: c(P.primary),
      font: "Calibri",
    })],
  });
}

function cta(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 240, line: 300 },
    children: [new TextRun({
      text: "→ " + text,
      size: 24,
      bold: true,
      color: c(P.accent),
      font: "Calibri",
    })],
  });
}

function label(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80, line: 260 },
    children: [new TextRun({
      text: text.toUpperCase(),
      size: 16,
      bold: true,
      color: c(P.muted),
      font: "Calibri",
      characterSpacing: 50,
    })],
  });
}

// ===== COVER PAGE =====
function buildCover() {
  return [
    new Paragraph({
      spacing: { before: 2000, after: 240 },
      children: [new TextRun({
        text: "VELTRA  ·  HOMEPAGE COPY  ·  V1",
        size: 18,
        bold: true,
        color: c(P.muted),
        font: "Calibri",
        characterSpacing: 80,
      })],
    }),
    new Paragraph({
      spacing: { after: 240, line: 240 },
      children: [new TextRun({
        text: "Homepage",
        size: 86,
        bold: false,
        color: c(P.primary),
        font: "Calibri",
      })],
    }),
    new Paragraph({
      spacing: { after: 720, line: 240 },
      children: [new TextRun({
        text: "Rewrite.",
        size: 86,
        italics: true,
        color: c(P.accent),
        font: "Calibri",
      })],
    }),
    new Paragraph({
      spacing: { after: 200, line: 320 },
      children: [new TextRun({
        text: "The clinic that runs itself.",
        size: 30,
        italics: true,
        color: c(P.secondary),
        font: "Calibri",
      })],
    }),
    new Paragraph({
      spacing: { after: 1600, line: 280 },
      children: [new TextRun({
        text: "Full homepage copy, rewritten around five pillars: Chief of Staff, Memory, Automation, Timeline, Trust. Built for 2030. English first. Arabic and French to follow.",
        size: 20,
        color: c(P.muted),
        font: "Calibri",
      })],
    }),
    new Paragraph({
      spacing: { before: 200, after: 120 },
      border: { top: { color: c(P.rule), style: BorderStyle.SINGLE, size: 6 } },
      children: [new TextRun({ text: "" })],
    }),
    new Paragraph({
      spacing: { line: 280 },
      children: [new TextRun({
        text: "For the engineering and design team. Drop-in copy. Do not paraphrase without approval.",
        size: 18,
        color: c(P.muted),
        italics: true,
        font: "Calibri",
      })],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

// ===== PRICING TABLE =====
function buildPricingTable() {
  const cell = (children, opts = {}) =>
    new TableCell({
      children: children,
      margins: { top: 200, bottom: 200, left: 220, right: 220 },
      shading: opts.shade ? { type: ShadingType.CLEAR, fill: c(P.surface) } : undefined,
      width: { size: 3333, type: WidthType.DXA },
    });

  const planTitle = (text) => new Paragraph({
    spacing: { after: 80, line: 280 },
    children: [new TextRun({
      text: text,
      size: 22,
      bold: true,
      color: c(P.primary),
      font: "Calibri",
    })],
  });
  const planPrice = (text) => new Paragraph({
    spacing: { after: 80, line: 280 },
    children: [new TextRun({
      text: text,
      size: 32,
      color: c(P.accent),
      font: "Calibri",
    })],
  });
  const planDesc = (text) => new Paragraph({
    spacing: { after: 60, line: 280 },
    children: [new TextRun({
      text: text,
      size: 18,
      color: c(P.muted),
      italics: true,
      font: "Calibri",
    })],
  });
  const planFeature = (text) => new Paragraph({
    spacing: { after: 60, line: 280 },
    children: [new TextRun({
      text: "·  " + text,
      size: 20,
      color: c(P.body),
      font: "Calibri",
    })],
  });
  const planCTA = (text) => new Paragraph({
    spacing: { before: 120, line: 280 },
    children: [new TextRun({
      text: "→ " + text,
      size: 20,
      bold: true,
      color: c(P.accent),
      font: "Calibri",
    })],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: c(P.primary) },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: c(P.primary) },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: c(P.rule) },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: c(P.rule) },
    },
    rows: [
      // Header row
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          cell([planTitle("CLINIC"), planPrice("$399 / mo"), planDesc("For small clinics.")], { shade: true }),
          cell([planTitle("GROUP"), planPrice("$699 / mo"), planDesc("For growing practices.")], { shade: true }),
          cell([planTitle("NETWORK"), planPrice("Enterprise"), planDesc("For healthcare organizations.")], { shade: true }),
        ],
      }),
      // Body row — features
      new TableRow({
        cantSplit: true,
        children: [
          cell([
            planFeature("Unlimited appointments"),
            planFeature("Patient records"),
            planFeature("WhatsApp integration"),
            planFeature("Automated reminders"),
            planFeature("Memory (single clinic)"),
            planFeature("Email support"),
            planCTA("Start with Veltra"),
          ]),
          cell([
            planFeature("Everything in Clinic"),
            planFeature("Multi-location support"),
            planFeature("Call handling"),
            planFeature("Smart scheduling"),
            planFeature("Recovered Revenue analytics"),
            planFeature("Priority support"),
            planCTA("Start with Veltra"),
          ]),
          cell([
            planFeature("Everything in Group"),
            planFeature("Unlimited locations"),
            planFeature("Custom integrations"),
            planFeature("Network Memory (collective)"),
            planFeature("Dedicated account manager"),
            planFeature("SLA guarantee"),
            planCTA("Let's talk"),
          ]),
        ],
      }),
    ],
  });
}

// ===== BODY CONTENT =====
function buildBody() {
  return [
    // ============ 1. HERO ============
    eyebrow("01  ·  Hero"),
    h1("Run your entire clinic\nfrom one place."),
    bodyLead("Calls, appointments, billing, communication, and follow-up — working together from the first patient to the last."),
    cta("Start with Veltra"),
    meta("Or — see how it works"),
    rule(),

    // Badge row copy
    label("Trust signals (no logos, no marketing language)"),
    bullet("HIPAA-ready"),
    bullet("SOC 2 Type II"),
    bullet("Saudi PDPL compliant"),
    bullet("End-to-end encryption"),
    bullet("No data sold. No data shared. Ever."),

    // ============ 2. CHIEF OF STAFF ============
    eyebrow("02  ·  Chief of Staff"),
    h2("Meet your Chief of Staff."),
    body("A clinic is hundreds of small decisions. Answer the phone. Book the appointment. Prepare the patient. Complete the visit. Collect payment. Follow up. Veltra connects every step — not by adding more software, but by removing the need to operate the software you already have."),
    body("The Chief of Staff is not a feature. It is a role. It does not wait to be opened. It does not wait to be asked. It begins at 6:42 AM, before the clinic opens, before the doctor arrives, before the first call. It works the way a good chief of staff always works: quietly, accurately, and ahead of schedule."),
    quote("Good morning. Two appointments need confirmation. Four lab results require review. Tuesday has open capacity. Recovered revenue today: $5,120. Everything you need to know, before your first coffee."),
    label("Sample morning brief — appears in-product, not on the homepage"),
    meta("Read by the doctor in twelve seconds. Acted on by Veltra in zero."),

    // ============ 3. MEMORY ============
    eyebrow("03  ·  Memory"),
    h2("Veltra doesn't just record. It remembers."),
    body("Every healthcare product made in the last twenty years has promised to save the doctor time. Almost none have. The reason is not technical. The reason is that they were built to record what happened, not to understand what is happening. A record is a mirror. Memory is something else entirely."),
    body("Memory does not wait to be asked. Memory surfaces. Memory appears at 6:42 in the morning and says: three of your Tuesday patients did not show up last week. Two of them have a pattern. One slot is open. I have offered it to the next patient on the waitlist. The doctor did not ask. The doctor did not open anything. The doctor walked into a clinic that had already begun to think."),

    label("Four examples of Memory, unsolicited"),
    bullet("During the last six months, every Tuesday has had three no-shows. The pattern is structural, not random."),
    bullet("Diabetic patients in this clinic return after an average of 87 days. Two are overdue."),
    bullet("Adding one reminder 48 hours before the appointment reduces no-shows by 18%. Suggested."),
    bullet("Mr. Khalid's HbA1c is trending up. His last insulin refill was 92 days ago. Cardiology follow-up recommended."),
    body("This is not analytics. Analytics asks the manager a question. Memory answers a question the manager did not know to ask. The difference is the difference between a tool and a colleague. We are building a colleague."),

    // ============ 4. A DAY WITH VELTRA ============
    eyebrow("04  ·  A Day With Veltra"),
    h2("A Day With Veltra."),
    body("Replaces the dashboard mockup. Nine beats. One Tuesday. From 6:42 AM to 6:00 PM. What the clinic looks like when Memory is doing its job. Full design spec in the accompanying document. Copy below is final."),

    label("Beat 01  ·  06:42 AM  ·  Pattern detected"),
    body("Three Tuesday no-shows, two weeks running. Cross-referenced the last eight Tuesdays. Three patients repeat the absence. Two of them schedule after night shifts. The slot loss is not random. It is structural."),

    label("Beat 02  ·  06:43 AM  ·  Action taken"),
    body("Reschedule messages sent, before the clinic opens. Two WhatsApp messages. Two SMS fallbacks. Tone: warm, short, in the patient's preferred language. No discounts offered. No urgency manufactured. The message assumes the patient wants to come back. They usually do."),

    label("Beat 03  ·  06:44 AM  ·  Waitlist filled"),
    body("Waitlist patient number four reached. Slot filled before the phone rings. The opened slot is offered to the next waitlisted patient whose visit type matches. The receptionist sees the result, not the request."),

    label("Beat 04  ·  07:15 AM  ·  Pre-visit preparation"),
    body("Chart readied before the patient arrives. Mr. Khalid walks in at 9:00. At 7:15, Veltra has already pulled his last three visits, his last two lab results, his outstanding prescription, and the cardiology note from the referral."),

    label("Beat 05  ·  09:00 AM  ·  Patient arrives"),
    body("Check-in is a glance, not a process. Recognized by their appointment, not their paperwork. The wait-time clock starts. The receptionist did not type. The patient did not fill a form."),

    label("Beat 06  ·  12:30 PM  ·  Lab result arrives"),
    body("Veltra links it, before the doctor sees it. The result does not arrive in an inbox. It arrives in context — next to the last result, the last visit, the last prescription. The trend is visible without a click."),

    label("Beat 07  ·  4:15 PM  ·  Follow-ups proposed"),
    body("Four patients, four moments to act. Not because of a rule. Because of Memory. Each patient's follow-up window is set by their own history, not by a default."),

    label("Beat 08  ·  6:00 PM  ·  End of day"),
    body("The clinic is summarized, not just closed. Three appointments converted from no-show. One waitlist fill. One pre-visit chart that saved eleven minutes. One lab trend flagged."),

    label("Beat 09  ·  6:01 PM  ·  Tomorrow prepared"),
    body("Before today is even over. Wednesday's schedule already read. Two charts prepared. One fragile slot flagged. The first coffee of the morning will be the only thing the doctor has to wait for."),

    cta("See the full Timeline spec"),
    meta("Replaces the existing OS mockup section. Full design spec in: Veltra — A Day With Veltra (Spec v1.0)."),

    // ============ 5. PRICING ============
    eyebrow("05  ·  Pricing"),
    h2("Three sizes. One promise."),
    body("Veltra is priced by what the clinic needs, not by what it can be charged. Every plan includes Memory. Every plan includes the Chief of Staff. The difference is scale."),
    body("Annual billing available. Professional onboarding included. One-time setup fees: $5,000 for Clinic, $7,500 for Group, custom for Network."),
    buildPricingTable(),
    body(""),

    // ============ 6. TRUST ============
    eyebrow("06  ·  Trust"),
    h2("Trust, without exaggeration."),
    body("Healthcare software has earned its reputation for overpromising. We do not intend to add to that reputation. Trust is not a list of certifications. Trust is what the system does when no one is watching, and how it explains itself when challenged."),
    body("Veltra is encrypted in transit and at rest. Access is role-based. Every action is logged. Deletion is honored — not as a compliance obligation, but as a design principle. Memory that cannot forget is not memory. It is an archive."),
    body("If Veltra surfaces a recommendation, the doctor can ask why. And Veltra will answer — in plain language, with the chain of observations that produced the conclusion. A memory that cannot be challenged is a rumor. A memory that can be challenged, traced, corrected, and refused is a colleague."),
    quote("Veltra doesn't just record what happened. It understands what is happening, remembers what has happened, and quietly prepares what should happen next."),
    cta("Read the security overview"),
    meta("One page. Plain language. No badges, no marketing claims."),

    // ============ 7. JOIN THE NETWORK ============
    eyebrow("07  ·  Join the Network"),
    h2("Join the clinics shaping Veltra's memory."),
    body("A single clinic's memory is narrow. Twelve clinics' memory is a network. Patterns invisible to one clinic become visible across many. The diabetic patient who returns after 87 days. The Tuesday no-show pattern. The lab result that predicts a hospitalization four weeks later. These patterns live between clinics, not inside one."),
    body("Veltra does not grow by referral bonuses. Veltra grows because every clinic that joins makes every other clinic smarter. This is not a marketing claim. This is a property of the network. The clinic that joins early shapes the memory. The clinic that joins late inherits it."),
    body("If you join today, your clinic's patterns contribute to the collective. If you join in two years, your clinic benefits from two years of patterns it did not have to learn alone. Either way, the network deepens. Either way, the memory grows."),
    cta("Join the first twelve clinics"),
    meta("Pilot program. Three-month commitment. Direct line to the founding team. Pricing locked for two years."),

    // ============ 8. FOOTER ============
    eyebrow("08  ·  Footer"),
    h3("Footer copy"),
    bullet("Technology disappears. Care remains."),
    bullet("Back to Top  ·  Help Center  ·  Contact Us  ·  LinkedIn  ·  X  ·  Instagram"),
    bullet("Platform  ·  Pricing  ·  Security  ·  Compliance  ·  Privacy  ·  Terms"),
    bullet("VELTRA  ©  2026 Veltra Health. All rights reserved."),

    // ============ COPY GUIDELINES ============
    new Paragraph({
      children: [new PageBreak()],
    }),
    eyebrow("Appendix  ·  Copy Guidelines"),
    h2("The voice of the witness."),
    body("The voice is the product. If the voice sounds like marketing, Veltra sounds like marketing. If the voice sounds like a colleague, Veltra sounds like a colleague. The rules below are not stylistic preferences. They are non-negotiable."),

    label("Forbidden vocabulary — do not use anywhere on the site"),
    bullet("AI"),
    bullet("Smart"),
    bullet("Intelligent"),
    bullet("Powered by"),
    bullet("Seamless"),
    bullet("Leverage"),
    bullet("Automagically"),
    bullet("Next-gen"),
    bullet("Revolutionary"),
    bullet("Game-changing"),
    bullet("Cutting-edge"),
    bullet("Innovative"),
    bullet("Disruptive"),
    bullet("Synergy"),

    label("Voice rules"),
    bullet("Veltra does not say 'I'. Veltra does not say 'we'. Veltra says what was observed, and what was done."),
    bullet("Past tense. Third person. The system is the subject, never the speaker."),
    bullet("A Chief of Staff does not announce themselves. A Chief of Staff reports."),
    bullet("Max two sentences of voice per beat. Plus one line of callout."),
    bullet("The voice is the story. The callout is the receipt. The visitor reads the story. The buyer reads the receipt. Both leave satisfied."),
    bullet("No superlatives. No comparatives. Veltra is not 'the best' or 'better than'. Veltra is what it is. The reader decides."),

    label("What we removed from the original homepage"),
    bullet("Testimonials — until we have real ones. Not before."),
    bullet("Logos — until we have real clients. Not before."),
    bullet("Video — until we can show the product, not market it."),
    bullet("Comparison table — we are not competing in an existing category. We are creating one."),
    bullet("Blog — not now. Apple does not have a blog. Stripe started one after years."),
    bullet("FAQ — eight was too many. Four is enough. Move four to /help."),
    bullet("Newsletter popup — there is no newsletter. There is no popup."),
    bullet("Live chat — Veltra is the chat. Not a third-party widget."),
    bullet("Calendly — Veltra is the booking system. Not Calendly."),
  ];
}

// ===== DOCUMENT ASSEMBLY =====
const doc = new Document({
  creator: "Veltra Health",
  title: "Veltra — Homepage Rewrite v1",
  description: "Full homepage copy, rewritten around five pillars: Chief of Staff, Memory, Automation, Timeline, Trust.",
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Calibri", eastAsia: "Calibri" },
          size: 22,
          color: c(P.body),
        },
        paragraph: {
          spacing: { line: 320 },
        },
      },
      heading1: {
        run: { font: { ascii: "Calibri" }, size: 56, color: c(P.primary) },
        paragraph: { spacing: { before: 120, after: 200, line: 280 } },
      },
      heading2: {
        run: { font: { ascii: "Calibri" }, size: 36, color: c(P.primary) },
        paragraph: { spacing: { before: 360, after: 180, line: 300 } },
      },
      heading3: {
        run: { font: { ascii: "Calibri" }, size: 24, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 280, after: 120, line: 280 } },
      },
    },
  },
  sections: [
    // Cover section — no header/footer, no margins
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      children: buildCover(),
    },
    // Body section — with header + footer + page numbers
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({
              text: "VELTRA  ·  HOMEPAGE REWRITE  ·  v1",
              size: 16,
              color: c(P.muted),
              font: "Calibri",
              characterSpacing: 50,
            })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              children: [PageNumber.CURRENT],
              size: 18,
              color: c(P.muted),
              font: "Calibri",
            })],
          })],
        }),
      },
      children: buildBody(),
    },
  ],
});

// ===== EXPORT =====
Packer.toBuffer(doc).then((buf) => {
  const out = "/home/z/my-project/download/Veltra-Homepage-Rewrite.docx";
  fs.writeFileSync(out, buf);
  console.log("✓ DOCX generated:", out);
  console.log("  Size:", (buf.length / 1024).toFixed(1), "KB");
}).catch((err) => {
  console.error("✗ Generation failed:", err);
  process.exit(1);
});
