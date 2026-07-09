#!/usr/bin/env python3
"""
Build the Veltra Engineering Constitution PDF.
Output: /home/z/my-project/download/Veltra-Engineering-Constitution.pdf
"""

import os
import sys
import hashlib
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm, cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, Flowable, ListFlowable, ListItem
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfgen import canvas

# ===== Font Registration =====
FONT_DIR = "/usr/share/fonts/truetype"

# Liberation Sans = Inter substitute
pdfmetrics.registerFont(TTFont("Inter", f"{FONT_DIR}/liberation/LiberationSans-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Inter-Bold", f"{FONT_DIR}/liberation/LiberationSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Inter-Italic", f"{FONT_DIR}/liberation/LiberationSans-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Inter-BoldItalic", f"{FONT_DIR}/liberation/LiberationSans-BoldItalic.ttf"))

# Liberation Serif = Instrument Serif Italic substitute
pdfmetrics.registerFont(TTFont("Serif-Italic", f"{FONT_DIR}/liberation/LiberationSerif-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Serif", f"{FONT_DIR}/liberation/LiberationSerif-Regular.ttf"))

# Liberation Mono = JetBrains Mono substitute
pdfmetrics.registerFont(TTFont("Mono", f"{FONT_DIR}/liberation/LiberationMono-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Mono-Bold", f"{FONT_DIR}/liberation/LiberationMono-Bold.ttf"))

# DejaVu for fallback (covers unicode symbols like ✓, →, ⌘)
pdfmetrics.registerFont(TTFont("DejaVu", f"{FONT_DIR}/dejavu/DejaVuSans.ttf"))

# ===== Veltra Brand Colors =====
VELTRA_EMERALD = colors.HexColor("#39CFA2")
VELTRA_EMERALD_DARK = colors.HexColor("#1FA17F")
VELTRA_MIDNIGHT = colors.HexColor("#071323")
VELTRA_WARM_WHITE = colors.HexColor("#FAF8F5")
VELTRA_OFFWHITE = colors.HexColor("#EDE9E0")
VELTRA_INK = colors.HexColor("#1A2238")
VELTRA_MUTED = colors.HexColor("#6B7280")
VELTRA_BORDER = colors.HexColor("#E5E7EB")
VELTRA_AMBER = colors.HexColor("#F59E0B")
VELTRA_RED = colors.HexColor("#EF4444")
VELTRA_VIOLET = colors.HexColor("#8B5CF6")

# ===== Page Setup =====
PAGE_W, PAGE_H = A4
MARGIN_L = 22 * mm
MARGIN_R = 22 * mm
MARGIN_T = 22 * mm
MARGIN_B = 22 * mm
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

# ===== Styles =====
styles = getSampleStyleSheet()

H1 = ParagraphStyle(
    name="H1", parent=styles["Heading1"],
    fontName="Inter-Bold", fontSize=24, leading=30,
    textColor=VELTRA_INK, spaceBefore=24, spaceAfter=14,
    keepWithNext=True,
)

H2 = ParagraphStyle(
    name="H2", parent=styles["Heading2"],
    fontName="Inter-Bold", fontSize=16, leading=22,
    textColor=VELTRA_INK, spaceBefore=18, spaceAfter=10,
    keepWithNext=True,
)

H3 = ParagraphStyle(
    name="H3", parent=styles["Heading3"],
    fontName="Inter-Bold", fontSize=12, leading=16,
    textColor=VELTRA_EMERALD_DARK, spaceBefore=14, spaceAfter=6,
    keepWithNext=True,
)

BODY = ParagraphStyle(
    name="Body", parent=styles["BodyText"],
    fontName="Inter", fontSize=10.5, leading=15.5,
    textColor=VELTRA_INK, spaceBefore=0, spaceAfter=8,
    alignment=TA_LEFT,
)

BODY_ITALIC = ParagraphStyle(
    name="BodyItalic", parent=BODY,
    fontName="Serif-Italic", fontSize=11, leading=16,
    textColor=VELTRA_MUTED,
)

QUOTE = ParagraphStyle(
    name="Quote", parent=BODY,
    fontName="Serif-Italic", fontSize=12, leading=18,
    textColor=VELTRA_EMERALD_DARK,
    leftIndent=16, rightIndent=16,
    spaceBefore=8, spaceAfter=12,
)

BULLET = ParagraphStyle(
    name="Bullet", parent=BODY,
    fontSize=10, leading=14,
    leftIndent=18, bulletIndent=4,
    spaceBefore=2, spaceAfter=4,
)

CODE = ParagraphStyle(
    name="Code", parent=BODY,
    fontName="Mono", fontSize=8.5, leading=12,
    textColor=VELTRA_INK,
    backColor=colors.HexColor("#F5F5F0"),
    borderPadding=6, leftIndent=8, rightIndent=8,
    spaceBefore=6, spaceAfter=8,
)

MICRO = ParagraphStyle(
    name="Micro", parent=BODY,
    fontName="Inter-Bold", fontSize=8, leading=11,
    textColor=VELTRA_EMERALD_DARK,
    spaceBefore=4, spaceAfter=2,
)

TOC_LEVEL_0 = ParagraphStyle(
    name="TOC0", fontName="Inter-Bold", fontSize=11, leading=18,
    textColor=VELTRA_INK, leftIndent=0, spaceBefore=4,
)
TOC_LEVEL_1 = ParagraphStyle(
    name="TOC1", fontName="Inter", fontSize=10, leading=15,
    textColor=VELTRA_MUTED, leftIndent=14, spaceBefore=2,
)


# ===== Custom Flowables =====

class HorizontalLine(Flowable):
    def __init__(self, width, thickness=0.5, color=VELTRA_BORDER):
        Flowable.__init__(self)
        self.width = width
        self.thickness = thickness
        self.color = color

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 0, self.width, 0)


class SectionDivider(Flowable):
    """A small emerald dot — used between major sections."""
    def __init__(self):
        Flowable.__init__(self)
        self.width = CONTENT_W
        self.height = 24

    def draw(self):
        self.canv.setFillColor(VELTRA_EMERALD)
        self.canv.circle(self.width / 2, 12, 2, fill=1, stroke=0)


# ===== TOC Doc Template =====

class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, "bookmark_name"):
            level = getattr(flowable, "bookmark_level", 0)
            text = getattr(flowable, "bookmark_text", "")
            key = getattr(flowable, "bookmark_key", "")
            self.notify("TOCEntry", (level, text, self.page, key))


def add_heading(text, style, level=0):
    key = f"h_{hashlib.md5(text.encode()).hexdigest()[:8]}"
    p = Paragraph(f'<a name="{key}"/>{text}', style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p


# ===== Page Decorations =====

def cover_page(canvas, doc):
    """Custom cover page — dark midnight with emerald accent."""
    canvas.saveState()
    # Full midnight background
    canvas.setFillColor(VELTRA_MIDNIGHT)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    
    # Subtle emerald glow at top-left
    canvas.setFillColor(VELTRA_EMERALD)
    canvas.setFillAlpha(0.08)
    canvas.circle(80, PAGE_H - 100, 180, fill=1, stroke=0)
    canvas.setFillAlpha(1.0)
    
    # V Logo mark (top-left)
    canvas.setFillColor(VELTRA_EMERALD)
    canvas.roundRect(40, PAGE_H - 60, 28, 28, 6, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Inter-Bold", 14)
    canvas.drawCentredString(54, PAGE_H - 51, "V")
    
    # "VELTRA" wordmark
    canvas.setFillColor(colors.white)
    canvas.setFont("Inter-Bold", 11)
    canvas.drawString(78, PAGE_H - 50, "VELTRA")
    
    # "Engineering Constitution" eyebrow
    canvas.setFillColor(VELTRA_EMERALD)
    canvas.setFont("Inter-Bold", 9)
    canvas.drawString(40, PAGE_H / 2 + 60, "VELTRA ENGINEERING CONSTITUTION")
    
    # Version
    canvas.setFillColor(VELTRA_OFFWHITE)
    canvas.setFont("Inter", 9)
    canvas.drawString(40, PAGE_H / 2 + 44, "Version 1.0  ·  The Operating System of Healthcare")
    
    # Main title
    canvas.setFillColor(colors.white)
    canvas.setFont("Inter-Bold", 38)
    canvas.drawString(40, PAGE_H / 2 - 10, "The Constitution.")
    
    # Italic subtitle
    canvas.setFillColor(VELTRA_OFFWHITE)
    canvas.setFont("Serif-Italic", 18)
    canvas.drawString(40, PAGE_H / 2 - 50, "Technology disappears. Care remains.")
    
    # Description
    canvas.setFillColor(VELTRA_OFFWHITE)
    canvas.setFont("Inter", 10)
    desc_lines = [
        "The single source of truth for every decision made inside Veltra —",
        "code, design, copy, data, security, and direction. This is the contract",
        "that every AI, engineer, designer, and product manager must obey",
        "before writing a single line of code.",
    ]
    y = PAGE_H / 2 - 90
    for line in desc_lines:
        canvas.drawString(40, y, line)
        y -= 14
    
    # Bottom signature
    canvas.setFillColor(VELTRA_EMERALD)
    canvas.setFont("Inter-Bold", 8)
    canvas.drawString(40, 60, "VELTRA  ·  2026")
    
    canvas.setFillColor(VELTRA_OFFWHITE)
    canvas.setFont("Inter", 8)
    canvas.drawRightString(PAGE_W - 40, 60, "Constitution v1.0")
    
    # Thin emerald line at bottom
    canvas.setStrokeColor(VELTRA_EMERALD)
    canvas.setLineWidth(1)
    canvas.line(40, 50, PAGE_W - 40, 50)
    
    canvas.restoreState()


def body_page(canvas, doc):
    """Body page header/footer."""
    canvas.saveState()
    
    # Header — small Veltra mark + section anchor
    canvas.setFillColor(VELTRA_EMERALD)
    canvas.roundRect(MARGIN_L, PAGE_H - 14 * mm, 14, 14, 3, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Inter-Bold", 7)
    canvas.drawCentredString(MARGIN_L + 7, PAGE_H - 14 * mm + 4, "V")
    
    canvas.setFillColor(VELTRA_MUTED)
    canvas.setFont("Inter", 8)
    canvas.drawString(MARGIN_L + 20, PAGE_H - 14 * mm + 4, "VELTRA ENGINEERING CONSTITUTION  ·  v1.0")
    
    # Top border
    canvas.setStrokeColor(VELTRA_BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN_L, PAGE_H - 16 * mm, PAGE_W - MARGIN_R, PAGE_H - 16 * mm)
    
    # Footer — page number + tagline
    canvas.setStrokeColor(VELTRA_BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN_L, 14 * mm, PAGE_W - MARGIN_R, 14 * mm)
    
    canvas.setFillColor(VELTRA_MUTED)
    canvas.setFont("Inter", 8)
    canvas.drawString(MARGIN_L, 10 * mm, "Technology disappears. Care remains.")
    canvas.drawRightString(PAGE_W - MARGIN_R, 10 * mm, f"Page {doc.page - 1}")
    
    canvas.restoreState()


# ===== Content Builders =====

def build_toc():
    toc = TableOfContents()
    toc.levelStyles = [TOC_LEVEL_0, TOC_LEVEL_1]
    return toc


def bullet_list(items, style=BULLET):
    """Build a bulleted list from a list of strings."""
    return ListFlowable(
        [ListItem(Paragraph(item, style), leftIndent=14, value="•") for item in items],
        bulletType="bullet", bulletColor=VELTRA_EMERALD, bulletFontSize=10,
        leftIndent=14, spaceBefore=2, spaceAfter=6,
    )


def check_list(items):
    """Build a checklist with green check marks."""
    flowables = []
    for item in items:
        p = Paragraph(
            f'<font color="#1FA17F"><b>✓</b></font>  {item}',
            ParagraphStyle(name="Check", parent=BODY, leftIndent=14, spaceBefore=2, spaceAfter=4)
        )
        flowables.append(p)
    return flowables


def quote_block(text):
    """A serif italic quote with left emerald bar."""
    p = Paragraph(text, QUOTE)
    tbl = Table([[p]], colWidths=[CONTENT_W])
    tbl.setStyle(TableStyle([
        ("LINEBEFORE", (0, 0), (0, 0), 2, VELTRA_EMERALD),
        ("LEFTPADDING", (0, 0), (0, 0), 14),
        ("RIGHTPADDING", (0, 0), (0, 0), 8),
        ("TOPPADDING", (0, 0), (0, 0), 6),
        ("BOTTOMPADDING", (0, 0), (0, 0), 6),
    ]))
    return tbl


def styled_table(rows, col_widths=None, header_row=True):
    """Build a clean table with Veltra styling."""
    if col_widths is None:
        col_widths = [CONTENT_W / len(rows[0])] * len(rows[0])
    
    # Wrap each cell in a Paragraph for proper text wrapping
    cell_style = ParagraphStyle(
        name="Cell", fontName="Inter", fontSize=9, leading=12,
        textColor=VELTRA_INK,
    )
    header_style = ParagraphStyle(
        name="CellH", fontName="Inter-Bold", fontSize=9, leading=12,
        textColor=VELTRA_EMERALD_DARK,
    )
    
    data = []
    for i, row in enumerate(rows):
        if header_row and i == 0:
            data.append([Paragraph(str(c), header_style) for c in row])
        else:
            data.append([Paragraph(str(c), cell_style) for c in row])
    
    tbl = Table(data, colWidths=col_widths, repeatRows=1 if header_row else 0)
    style_cmds = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, VELTRA_BORDER),
    ]
    if header_row:
        style_cmds += [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F5F5F0")),
            ("LINEBELOW", (0, 0), (-1, 0), 1, VELTRA_EMERALD),
        ]
    tbl.setStyle(TableStyle(style_cmds))
    return tbl


# ===== Build the Story =====

def build_story():
    story = []
    
    # ===== Cover (handled by cover_page function, but we need a placeholder PageBreak) =====
    story.append(Spacer(1, PAGE_H - MARGIN_T - MARGIN_B - 100))
    story.append(PageBreak())
    
    # ===== Table of Contents =====
    story.append(Paragraph("Table of Contents", H1))
    story.append(Spacer(1, 8))
    story.append(quote_block("The constitution. Every AI, engineer, designer, and product manager must read and obey this before writing a single line of code."))
    story.append(Spacer(1, 12))
    story.append(build_toc())
    story.append(PageBreak())
    
    # ===== 0. PREAMBLE =====
    story.append(add_heading("0. Preamble", H1, level=0))
    story.append(Paragraph(
        "Veltra is not a project. Veltra is a <b>product</b>, a <b>company</b>, and a <b>philosophy</b>.",
        BODY
    ))
    story.append(Paragraph(
        "This document is the <b>single source of truth</b> for every decision made inside Veltra — code, design, copy, data, security, and direction. It exists so that when the project reaches 200,000 lines of code, when the team grows from 3 to 30, when the AI assistants multiply, the <b>soul of the product is preserved</b> without anyone needing to re-explain it.",
        BODY
    ))
    story.append(Paragraph("This is not a suggestion. This is a <b>contract</b>.", BODY))
    story.append(Paragraph(
        "Any code, design, copy, or product decision that violates this constitution must be fixed immediately — or rejected before it ships.",
        BODY
    ))
    story.append(Spacer(1, 8))
    
    # ===== 1. WHAT VELTRA IS — AND IS NOT =====
    story.append(add_heading("1. What Veltra Is — and Is Not", H1, level=0))
    
    story.append(add_heading("1.1 Veltra IS", H3, level=1))
    story.append(bullet_list([
        "A <b>Clinic Operating System</b> — the layer that runs the entire clinic, from the first call to the final follow-up.",
        "A <b>Clinical Memory Layer</b> — every interaction becomes context for the next decision. Nothing important is forgotten.",
        "A <b>Workflow Engine</b> — appointments, billing, labs, prescriptions, insurance, inventory — all flowing through one nervous system.",
        "A <b>Chief of Staff</b> — a calm intelligence that briefs the doctor every morning, surfaces what matters, and silences what does not.",
        "A <b>Healthcare Operations Platform</b> — global by design, multi-specialty by default, multi-location by architecture.",
    ]))
    
    story.append(add_heading("1.2 Veltra is NOT", H3, level=1))
    story.append(bullet_list([
        "An Electronic Medical Record only.",
        "A scheduling app.",
        "A CRM.",
        "A billing software.",
        "A generic ERP.",
        "A chatbot bolted onto a clinic tool.",
        "An AI product masquerading as a clinic tool.",
    ]))
    
    story.append(add_heading("1.3 The North Star", H3, level=1))
    story.append(quote_block("Every decision must move Veltra closer to becoming <b>the operating system of healthcare</b>."))
    story.append(Paragraph(
        "If a proposed feature does not move Veltra closer to that, it does not ship.",
        BODY
    ))
    
    # ===== 2. DECISION PRIORITY =====
    story.append(add_heading("2. Decision Priority", H1, level=0))
    story.append(Paragraph(
        "When there is a trade-off — and there is always a trade-off — prioritize in this exact order:",
        BODY
    ))
    
    priority_rows = [
        ["#", "Priority", "Example"],
        ["1", "Patient Safety", "A medication interaction warning must surface before a billing shortcut."],
        ["2", "Clinical Workflow", "A doctor's flow through a patient visit is sacred. Don't interrupt it."],
        ["3", "Simplicity", "Fewer screens. Fewer fields. Fewer clicks. Fewer concepts."],
        ["4", "Reliability", "The system must work the same way at 2 AM as at 2 PM."],
        ["5", "Performance", "Fast is a feature, but never at the cost of safety or correctness."],
        ["6", "Developer Experience", "Code must be readable by the next engineer who touches it."],
        ["7", "Visual Design", "Beauty matters, but it serves the experience — never the other way around."],
    ]
    story.append(styled_table(priority_rows, col_widths=[10 * mm, 38 * mm, CONTENT_W - 48 * mm]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Never sacrifice a higher priority for a lower one.</b>", BODY))
    story.append(bullet_list([
        "A beautiful animation that delays a clinical decision is rejected.",
        "A clever abstraction that hides patient risk is rejected.",
        "A fast shortcut that bypasses audit is rejected.",
    ]))
    
    # ===== 3. DEFINITION OF DONE =====
    story.append(add_heading("3. Definition of Done", H1, level=0))
    story.append(Paragraph(
        "A feature is <b>only</b> complete when <b>all</b> of the following are true:",
        BODY
    ))
    story.extend(check_list([
        "Works on Desktop (1440px+)",
        "Works on Laptop (1024–1440px)",
        "Works on Tablet (768–1024px)",
        "Works on Mobile (320–768px)",
        "Accessible (WCAG AA, keyboard-navigable, screen-reader tested)",
        "Responsive (no horizontal scroll, no overflow, no broken layouts)",
        "Production Ready (no console.log, no TODO, no any without comment)",
        "Secure (server-side validation, role-checked, audit-logged)",
        "Fast (meets Performance Targets in §4)",
        "Tested (at least one happy-path test, one edge-case test)",
        "Uses reusable components (no copy-pasted UI blocks)",
        "Documented (component props, API contract, or schema documented inline)",
        "Empty state designed (not \"No data\")",
        "Error state designed (not a red screen of death)",
        "Loading state designed (not a bare spinner)",
        "Reviewed against this Constitution",
    ]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "If any of these are false, the feature is <b>not done</b>. It is \"in progress.\"",
        BODY
    ))
    
    # ===== 4. PERFORMANCE TARGETS =====
    story.append(add_heading("4. Performance Targets", H1, level=0))
    
    story.append(add_heading("4.1 Landing Page", H3, level=1))
    perf_landing = [
        ["Metric", "Target"],
        ["Lighthouse (overall)", "≥ 95"],
        ["Lighthouse (Performance)", "≥ 90"],
        ["CLS (Cumulative Layout Shift)", "< 0.1"],
        ["LCP (Largest Contentful Paint)", "< 2.0s"],
        ["FID (First Input Delay)", "< 100ms"],
        ["TBT (Total Blocking Time)", "< 200ms"],
        ["Bundle size (initial)", "< 250 KB gzipped"],
    ]
    story.append(styled_table(perf_landing, col_widths=[CONTENT_W * 0.6, CONTENT_W * 0.4]))
    
    story.append(add_heading("4.2 Workspace (authenticated app)", H3, level=1))
    perf_workspace = [
        ["Metric", "Target"],
        ["First load (TTI)", "< 2.0s"],
        ["Route transition", "< 300ms"],
        ["Search results (debounced)", "< 150ms"],
        ["List render (100 items)", "< 100ms"],
        ["Form submit response", "< 500ms (perceived)"],
    ]
    story.append(styled_table(perf_workspace, col_widths=[CONTENT_W * 0.6, CONTENT_W * 0.4]))
    
    story.append(add_heading("4.3 Real-time", H3, level=1))
    story.append(bullet_list([
        "WebSocket messages: < 100ms latency to UI update.",
        "Optimistic UI for every mutation that the user initiated.",
        "Rollback within 400ms if the server rejects.",
    ]))
    
    story.append(add_heading("4.4 Forbidden", H3, level=1))
    story.append(bullet_list([
        "No blocking the main thread for > 50ms.",
        "No synchronous calls to external services on the request path.",
        "No unbounded queries (always paginate or limit).",
        "No client-side loops over > 1000 items without virtualization.",
    ]))
    
    # ===== 5. SECURITY & COMPLIANCE =====
    story.append(add_heading("5. Security & Compliance", H1, level=0))
    
    story.append(add_heading("5.1 The Default", H3, level=1))
    story.append(quote_block("Always assume healthcare data is sensitive. Always."))
    story.append(Paragraph(
        "Every patient name, every lab value, every medication, every voice note is <b>Protected Health Information (PHI)</b> until proven otherwise.",
        BODY
    ))
    
    story.append(add_heading("5.2 Compliance Frameworks", H3, level=1))
    story.append(Paragraph(
        "Veltra must be designed to satisfy — and be auditable against — the following:",
        BODY
    ))
    story.append(bullet_list([
        "<b>HIPAA</b> (United States) — Privacy Rule, Security Rule, Breach Notification.",
        "<b>GDPR</b> (European Union) — Lawful basis, right to erasure, data portability, DPA.",
        "<b>NPHIES</b> (Saudi Arabia) — National e-Health Information Exchange integration readiness.",
        "<b>PDPL</b> (Saudi Personal Data Protection Law) — consent, retention, cross-border transfer.",
        "<b>DHA / DOH</b> (Dubai Health Authority / Abu Dhabi DOH) — local data residency options.",
    ]))
    
    story.append(add_heading("5.3 The Twelve Security Rules", H3, level=1))
    security_rules = [
        ("Least privilege", "Every user, every service, every token gets the minimum access required."),
        ("Server-side validation", "Never trust the client. Every mutation is validated on the server."),
        ("Audit logging", "Every PHI access, every mutation, every login is logged with userId, action, target, timestamp, before, after."),
        ("Role-based permissions", "Enforced server-side, not just hidden in the UI."),
        ("Encryption at rest", "AES-256 for databases, object storage, backups."),
        ("Encryption in transit", "TLS 1.3 everywhere. No HTTP except localhost."),
        ("No secrets in client bundles", "Env vars are server-only. NEXT_PUBLIC_* is forbidden for anything sensitive."),
        ("No client-side trust", "UI hiding a button does not remove the user's permission. The API still checks."),
        ("Token rotation", "Access tokens expire in 15 minutes. Refresh tokens rotate on use."),
        ("PHI minimization in logs", "Never log a full patient name, full phone, or full medical record. Mask in logs."),
        ("Breach readiness", "Every breach path has an alert. Every alert has an on-call owner."),
        ("Right to erasure", "Any patient can request deletion. The system must support hard-delete with audit trail of the deletion itself."),
    ]
    for i, (name, desc) in enumerate(security_rules, 1):
        story.append(Paragraph(
            f'<font color="#1FA17F"><b>{i}.</b></font>  <b>{name}</b> — {desc}',
            ParagraphStyle(name="SecRule", parent=BODY, leftIndent=14, spaceBefore=3, spaceAfter=4)
        ))
    
    story.append(add_heading("5.4 Authentication", H3, level=1))
    story.append(bullet_list([
        "Every user logs in with email + password (or SSO at the Network tier).",
        "No \"guest\" mode. No \"demo without login\" outside of investor demos (clearly labeled).",
        "2FA optional at Solo, encouraged at Group, mandatory at Network.",
        "Session timeout: 8 hours of inactivity, 30 days maximum.",
    ]))
    
    story.append(add_heading("5.5 Data Residency", H3, level=1))
    story.append(bullet_list([
        "Default region: EU (Frankfurt) for GDPR.",
        "Saudi deployment: Riyadh region for NPHIES compliance.",
        "Dubai deployment: UAE region for DHA compliance.",
        "Cross-region replication: only with explicit patient consent or legal requirement.",
    ]))
    
    # ===== 6. DATA PHILOSOPHY =====
    story.append(add_heading("6. Data Philosophy", H1, level=0))
    story.append(quote_block(
        "Every action must create memory.<br/>"
        "Every memory must be searchable.<br/>"
        "Every patient interaction must become context for future decisions.<br/>"
        "Nothing important should ever be forgotten."
    ))
    
    story.append(add_heading("6.1 The Four Laws of Veltra Memory", H3, level=1))
    laws = [
        ("Everything is an event.", "A booking, a call, a prescription, a payment, a voice note — all are events on a patient's timeline."),
        ("Events are immutable.", "You can add a correction event. You cannot delete history."),
        ("Memory compounds.", "A single lab result is data. Six months of lab results is insight. Two years is pattern recognition."),
        ("Memory is private to the clinic.", "Patient data does not leave the clinic's tenant — except for Network Memory, which is anonymized and aggregated."),
    ]
    for i, (name, desc) in enumerate(laws, 1):
        story.append(Paragraph(
            f'<b>{i}. {name}</b> {desc}',
            ParagraphStyle(name="Law", parent=BODY, leftIndent=14, spaceBefore=3, spaceAfter=4)
        ))
    
    story.append(add_heading("6.2 What \"Memory\" Means in Practice", H3, level=1))
    story.append(bullet_list([
        "A doctor opening a patient chart sees the <b>last 5 visits</b> by default, the <b>last 3 lab trends</b> as sparklines, the <b>last voice note</b> as a transcript, and the <b>next planned action</b> as a highlighted card.",
        "A doctor opening the morning brief sees <b>what changed overnight</b>: new labs, no-show patterns, overdue follow-ups, recovered revenue.",
        "A doctor searching for \"all diabetic patients overdue for HbA1c\" gets the answer in < 200ms.",
    ]))
    
    story.append(add_heading("6.3 What Must Never Be Forgotten", H3, level=1))
    story.append(bullet_list([
        "A patient's allergy.",
        "A patient's medication interaction warning.",
        "A missed appointment and the reason given.",
        "A doctor's verbal instruction recorded as a voice note.",
        "A billing correction.",
        "A patient's preferred channel and language.",
        "A patient's consent (or withdrawal of consent).",
    ]))
    
    story.append(add_heading("6.4 What May Be Forgotten", H3, level=1))
    story.append(bullet_list([
        "Drafts that were never saved.",
        "Transient UI state (filter selections, scroll positions).",
        "Deleted documents (after a 30-day grace period).",
    ]))
    
    # ===== 7. DATABASE RULES =====
    story.append(add_heading("7. Database Rules", H1, level=0))
    
    story.append(add_heading("7.1 Stack", H3, level=1))
    story.append(bullet_list([
        "<b>Prisma</b> as the ORM (typed, schema-first, migration-friendly).",
        "<b>PostgreSQL</b> as the primary database (ACID, JSONB, full-text search).",
        "<b>Redis</b> for sessions, rate-limiting, and ephemeral state.",
        "<b>Object storage (S3-compatible)</b> for documents, images, voice notes — never the database.",
    ]))
    
    story.append(add_heading("7.2 Schema Principles", H3, level=1))
    story.append(bullet_list([
        "Every table has id (UUID v4), createdAt, updatedAt, tenantId (for multi-tenancy).",
        "Every PHI field is annotated in the Prisma schema with /// PHI for audit-tooling.",
        "Every foreign key has onDelete: Restrict by default — only Cascade for owned children.",
        "No raw SQL in app code without a code review.",
        "No SELECT * — always explicit columns.",
    ]))
    
    story.append(add_heading("7.3 Migration Discipline", H3, level=1))
    story.append(bullet_list([
        "Every schema change is a Prisma migration with a clear name.",
        "Migrations are <b>forward-only</b>. Down migrations are forbidden in production.",
        "Destructive migrations require a 30-day deprecation window with a feature flag.",
    ]))
    
    story.append(add_heading("7.4 Multi-Tenancy", H3, level=1))
    story.append(bullet_list([
        "Row-Level Security (RLS) on every tenant-scoped table.",
        "Every query is automatically scoped by tenantId via a Prisma extension.",
        "Cross-tenant queries require explicit bypassRLS and an admin role.",
    ]))
    
    story.append(add_heading("7.5 Indexing", H3, level=1))
    story.append(bullet_list([
        "Every foreign key is indexed.",
        "Every column used in WHERE, ORDER BY, or JOIN is indexed.",
        "Composite indexes only when a single-column index cannot serve the query.",
        "EXPLAIN ANALYZE every slow query (> 100ms).",
    ]))
    
    story.append(add_heading("7.6 Backups", H3, level=1))
    story.append(bullet_list([
        "Full backup nightly. Incremental every 15 minutes.",
        "30-day retention minimum. 7-year retention for audit (read-only, cold storage).",
        "Quarterly restore drill — backups that have never been restored are not backups.",
    ]))
    
    # ===== 8. API RULES =====
    story.append(add_heading("8. API Rules", H1, level=0))
    
    story.append(add_heading("8.1 Architecture", H3, level=1))
    story.append(bullet_list([
        "<b>Next.js Route Handlers</b> (App Router) for all API endpoints.",
        "<b>tRPC or REST</b> for typed client-server contracts. No untyped fetch.",
        "<b>Zod</b> for input validation on every endpoint. No exceptions.",
        "<b>WebSockets</b> for real-time (patient check-ins, live activity feed, voice note transcription status).",
    ]))
    
    story.append(add_heading("8.2 Versioning", H3, level=1))
    story.append(bullet_list([
        "URL versioning: /api/v1/.... No breaking changes inside a version.",
        "Deprecation: 6-month window, Deprecation header, sunset notice in changelog.",
    ]))
    
    story.append(add_heading("8.3 Response Shape", H3, level=1))
    story.append(Paragraph(
        '<font face="Mono" size="8" color="#1A2238">'
        '// Success<br/>'
        '{ "data": T, "meta"?: { "cursor"?: string, "total"?: number } }<br/><br/>'
        '// Error<br/>'
        '{ "error": { "code": string, "message": string, "fields"?: Record&lt;string, string&gt; } }'
        '</font>',
        CODE
    ))
    story.append(bullet_list([
        "HTTP status codes follow REST conventions strictly.",
        "200 for success, 201 for created, 204 for no content.",
        "400 for validation, 401 for unauthenticated, 403 for unauthorized, 404 for missing, 409 for conflict, 429 for rate-limited, 500 for server error.",
    ]))
    
    story.append(add_heading("8.4 Rate Limiting", H3, level=1))
    story.append(bullet_list([
        "100 requests/minute per authenticated user.",
        "20 requests/minute per IP for unauthenticated endpoints.",
        "429 response includes Retry-After header.",
    ]))
    
    story.append(add_heading("8.5 Idempotency", H3, level=1))
    story.append(bullet_list([
        "Every mutating endpoint accepts an optional Idempotency-Key header.",
        "The same key returns the same response within 24 hours.",
    ]))
    
    story.append(add_heading("8.6 Pagination", H3, level=1))
    story.append(bullet_list([
        "Cursor-based, never offset-based (offset breaks under concurrent writes).",
        "Default page size: 20. Maximum: 100.",
    ]))
    
    story.append(add_heading("8.7 Forbidden", H3, level=1))
    story.append(bullet_list([
        "No GET requests that mutate state.",
        "No POST requests without input validation.",
        "No endpoints that bypass authentication.",
        "No endpoints that bypass tenant scoping.",
    ]))
    
    # ===== 9. UX RULES =====
    story.append(add_heading("9. UX Rules", H1, level=0))
    
    story.append(add_heading("9.1 The Single Focus", H3, level=1))
    story.append(quote_block("Every screen has one focal point. The user's eye must know where to land within 200ms."))
    story.append(bullet_list([
        "Brief → the revenue hero number.",
        "Patients → the grid of patient cards.",
        "Timeline → the patient name + context box.",
        "Appointments → the time column.",
        "Labs → the most recent abnormal result.",
    ]))
    
    story.append(add_heading("9.2 The Three-Click Rule", H3, level=1))
    story.append(Paragraph(
        "Any primary action must be reachable in <b>3 clicks or fewer</b> from any screen in the workspace.",
        BODY
    ))
    story.append(bullet_list([
        "Book appointment: Cmd+K → \"Book\" → confirm.",
        "View patient: Cmd+K → type name → Enter.",
        "Record payment: open patient → \"Record payment\" → confirm.",
    ]))
    
    story.append(add_heading("9.3 The No-Surprise Rule", H3, level=1))
    story.append(bullet_list([
        "Every destructive action (delete, cancel, void) requires confirmation.",
        "Every irreversible action shows the consequence in plain language: \"This will permanently remove Sarah Chen and 14 timeline events.\"",
        "Every async action shows progress: spinner, toast, or live status.",
    ]))
    
    story.append(add_heading("9.4 The Calm Rule", H3, level=1))
    story.append(bullet_list([
        "No infinite animations except the LIVE pulse.",
        "No autoplay carousels.",
        "No modal stacking (one modal at a time, ever).",
        "No toast stacking more than 3.",
        "No notification badge above 99 — show \"99+\".",
    ]))
    
    story.append(add_heading("9.5 The Honest Empty State", H3, level=1))
    story.append(bullet_list([
        "Every empty state is <b>designed</b>, not defaulted.",
        "It says one true sentence (editorial italic) + one helpful CTA.",
        "\"No one here. Try a different search.\" + clear filter button.",
        "\"Nothing needs you. Enjoy the quiet.\" + dismiss.",
        "Never \"No data found.\" Never \"Error.\"",
    ]))
    
    story.append(add_heading("9.6 The Three Loading Tiers", H3, level=1))
    loading_rows = [
        ["Tier", "When", "What"],
        ["1. Skeleton", "< 200ms expected", "Bone-white placeholder of the final layout"],
        ["2. Spinner", "200ms – 2s", "Loader2 with verb: \"Saving...\" \"Loading...\""],
        ["3. Progress", "> 2s", "Progress bar with stage labels"],
    ]
    story.append(styled_table(loading_rows, col_widths=[28 * mm, 38 * mm, CONTENT_W - 66 * mm]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Every spinner has an 8-second timeout that surfaces a retry CTA.", BODY))
    
    story.append(add_heading("9.7 The Mobile-First Mirror", H3, level=1))
    story.append(bullet_list([
        "Every screen is designed mobile-first, then expanded.",
        "Touch targets: minimum 44×44px.",
        "No hover-dependent interactions on mobile.",
        "The sidebar collapses to a hamburger drawer under 768px.",
    ]))
    
    # ===== 10. BRAND VOICE & COPYWRITING =====
    story.append(add_heading("10. Brand Voice & Copywriting", H1, level=0))
    
    story.append(add_heading("10.1 The Voice", H3, level=1))
    story.append(Paragraph("Veltra speaks <b>calmly</b>.", BODY))
    story.append(bullet_list(["Reliable.", "Quiet.", "Confident.", "Human.", "Professional."]))
    
    story.append(add_heading("10.2 The Forbidden Vocabulary", H3, level=1))
    story.append(Paragraph(
        "These words are <b>banned</b> from every surface — UI, marketing, docs, emails:",
        BODY
    ))
    story.append(bullet_list([
        "AI, smart, intelligent, seamless, leverage, automagically",
        "next-gen, revolutionary, game-changing, cutting-edge",
        "innovative, disruptive, synergy",
        "world's best, number one, leading, premier",
        "revolutionary, paradigm shift, holy grail",
    ]))
    story.append(Paragraph(
        "If a feature is good, <b>show it working</b>. Do not tell the user it is \"revolutionary.\"",
        BODY
    ))
    
    story.append(add_heading("10.3 The Pronoun Rule", H3, level=1))
    story.append(bullet_list([
        "Veltra never says \"I\" or \"we.\"",
        "Veltra states what happened, in the third person, past tense.",
        "\"Appointment booked.\" — not \"We booked your appointment.\"",
        "\"Reminder sent.\" — not \"I sent a reminder.\"",
        "\"Lab result received.\" — not \"We've got your results!\"",
    ]))
    
    story.append(add_heading("10.4 The Editorial Moment Rule", H3, level=1))
    story.append(Paragraph(
        "Serif italic (Instrument Serif Italic) is reserved for <b>emotional</b> moments — never for UI labels or instructions:",
        BODY
    ))
    story.append(bullet_list([
        'Greetings: "Good morning,"',
        'Empty states: "Nothing needs you. Enjoy the quiet."',
        'Signatures: "Technology disappears. Care remains."',
        'Transitions: "Preparing today\'s brief..."',
    ]))
    
    story.append(add_heading("10.5 The Copywriting Rules", H3, level=1))
    story.append(bullet_list([
        "<b>Short.</b> One idea per sentence.",
        "<b>Clear.</b> Plain English at a 9th-grade reading level.",
        "<b>Precise.</b> \"14 patients\" not \"many patients.\" \"$3,280\" not \"thousands of dollars.\"",
        "<b>Active.</b> \"Dr. Sarah prescribed Metformin\" not \"Metformin was prescribed.\"",
        "<b>Honest.</b> Never overpromise. \"Recovered revenue\" not \"guaranteed revenue.\"",
    ]))
    
    story.append(add_heading("10.6 The Number Rule", H3, level=1))
    story.append(bullet_list([
        "Always use tabular-nums for any number.",
        "Always localize currency ($, SAR, AED, €, £).",
        "Always include units: \"8.4 %\" not \"8.4\".",
        "Spell out one through nine in prose, use numerals for 10+.",
    ]))
    
    story.append(add_heading("10.7 The \"We Remember\" Rule", H3, level=1))
    story.append(quote_block(
        'Prefer: <b>"We remember."</b><br/>'
        'Instead of: "We leverage advanced technology to intelligently remember."'
    ))
    story.append(Paragraph("Three words. Subject, verb. Done.", BODY))
    
    # ===== 11. DEMO DATA STANDARDS =====
    story.append(add_heading("11. Demo Data Standards", H1, level=0))
    
    story.append(add_heading("11.1 The Demo Conviction Rule", H3, level=1))
    story.append(quote_block("Demo data must never feel fake."))
    story.append(Paragraph(
        "The demo is the <b>first impression</b> for an investor, a doctor, a clinic owner. If they sense fake data, they lose trust in the product. The demo must convince them that Veltra is <b>already live</b> at a real clinic.",
        BODY
    ))
    
    story.append(add_heading("11.2 Realistic Names", H3, level=1))
    story.append(bullet_list([
        "Mix of <b>Arabic names</b> (Ahmed Hassan, Fatima Al-Zahra, Khalid Al-Otaibi) and <b>international names</b> (Sarah Chen, James Wilson, Christina Yang).",
        "Names appropriate to the specialty: pediatric patients have child names (Emma, Liam); geriatric patients have older names (Margaret, Arthur).",
        "Phone numbers in real country formats: +966 50 123 4567, +971 50 123 4567, +1 555 0123.",
    ]))
    
    story.append(add_heading("11.3 Realistic Clinical Data", H3, level=1))
    story.append(bullet_list([
        "Lab values in real units with real reference ranges (HbA1c: 4.0–5.6 % normal, 5.7–6.4 % prediabetic, ≥ 6.5 % diabetic).",
        "Vital signs in real ranges (BP 110/70 to 160/100 across the demo).",
        "Medication names with real dosages (Metformin 1000mg twice daily, Atorvastatin 20mg at bedtime).",
        "Conditions appropriate to the specialty (Cardiology: hypertension, arrhythmia; Pediatrics: fever, asthma, vaccination due).",
    ]))
    
    story.append(add_heading("11.4 Realistic Operations", H3, level=1))
    story.append(bullet_list([
        "Insurance providers by region: Bupa Arabia, Tawuniya, MedGulf (Saudi); Daman, Nextcare, Oman Insurance (UAE); Cigna, Bupa Global (international).",
        "Invoice amounts that match the specialty's price list.",
        "Appointments at realistic times (9 AM–5 PM, 30-minute slots).",
        "Voice notes that sound like a real doctor dictating (transcript, not bullet points).",
    ]))
    
    story.append(add_heading("11.5 Realistic Activity", H3, level=1))
    story.append(bullet_list([
        "The activity feed shows what would actually happen in a busy clinic: bookings, check-ins, lab results arriving, prescriptions sent, payments collected, reminders fired.",
        "Timestamps are recent (today, yesterday, 2 days ago) — never \"3 weeks ago\" in a demo.",
        "Notifications are clinically meaningful, not filler.",
    ]))
    
    story.append(add_heading("11.6 The Specialty Vocabulary Rule", H3, level=1))
    story.append(Paragraph(
        "Each specialty demo must use <b>that specialty's vocabulary</b> — not generic placeholders:",
        BODY
    ))
    story.append(bullet_list([
        "Dental: \"Crown follow-up,\" \"Root canal,\" \"CBCT scan,\" \"Implant placement.\"",
        "Cardiology: \"ECG review,\" \"Troponin result,\" \"Echo scheduled,\" \"Holter monitor.\"",
        "Dermatology: \"Botox follow-up,\" \"Mole biopsy,\" \"Laser session,\" \"Wood's lamp exam.\"",
        "Pediatrics: \"Vaccination due,\" \"Well-child visit,\" \"Growth chart,\" \"School medical.\"",
    ]))
    story.append(Paragraph("A dental clinic demo that shows \"ECG reviews\" is broken. Fix it.", BODY))
    
    story.append(add_heading("11.7 The Demo Reset Rule", H3, level=1))
    story.append(bullet_list([
        "\"Reset Demo\" returns the data to its seeded state.",
        "The reset is <b>fast</b> (< 500ms perceived) and confirms with a toast.",
        "The reset is logged in the audit trail.",
    ]))
    
    # ===== 12. TYPOGRAPHY =====
    story.append(add_heading("12. Typography", H1, level=0))
    
    story.append(add_heading("12.1 Font Families", H3, level=1))
    story.append(bullet_list([
        "<b>Inter</b> — body text, UI, numbers. Default for everything.",
        "<b>Instrument Serif (Italic)</b> — editorial moments only: greetings, empty states, signatures. Never for UI labels.",
        "<b>JetBrains Mono</b> — numbers requiring tabular alignment, code, keyboard hints.",
    ]))
    
    story.append(add_heading("12.2 Type Scale (fixed, no improvisation)", H3, level=1))
    type_rows = [
        ["Role", "Size", "Weight", "Line-height", "Letter-spacing"],
        ["Display (h1)", "2.5rem (40px)", "600", "1.05", "-0.03em"],
        ["Title (h2)", "1.25rem (20px)", "600", "1.25", "-0.02em"],
        ["Heading (h3)", "1rem (16px)", "600", "1.3", "-0.015em"],
        ["Body", "0.9375rem (15px)", "400", "1.5", "-0.01em"],
        ["Caption", "0.8125rem (13px)", "400", "1.45", "-0.005em"],
        ["Micro", "0.6875rem (11px)", "600", "1.4", "0.08em uppercase"],
    ]
    story.append(styled_table(type_rows))
    
    story.append(add_heading("12.3 Forbidden", H3, level=1))
    story.append(bullet_list([
        "No font-size below 11px.",
        "No font-weight below 400 for body text.",
        "No pure white text in dark mode — use warm off-white (#EDE9E0).",
        "No pure black text in light mode — use deep navy (#1A2238).",
        "No pure white background in light mode — use warm off-white (#FAF8F4).",
        "No pure black background in dark mode — use warmer midnight.",
        "All numbers use tabular-nums for alignment.",
    ]))
    
    # ===== 13. COLOR =====
    story.append(add_heading("13. Color", H1, level=0))
    
    story.append(add_heading("13.1 Brand", H3, level=1))
    story.append(bullet_list([
        "<b>Veltra Emerald</b> (#39CFA2) — brand accent only: logo, primary CTAs, success states.",
        "Dark mode: desaturated variant (oklch 0.72 0.13 165) to reduce chromatic aberration.",
        "Light mode: darker variant (oklch 0.62 0.13 165) for contrast.",
    ]))
    
    story.append(add_heading("13.2 Semantic Colors", H3, level=1))
    color_rows = [
        ["Color", "Meaning", "Examples"],
        ["Emerald", "success", "confirmed, paid, completed"],
        ["Amber", "warning", "pending, due, reminder"],
        ["Red", "danger", "no-show, overdue, destructive"],
        ["Violet", "neutral-warm", "waiting, checked-in"],
        ["Blue / Cyan", "info", "calls, lab results"],
    ]
    story.append(styled_table(color_rows, col_widths=[28 * mm, 30 * mm, CONTENT_W - 58 * mm]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Emerald is for success only.</b> Never use emerald for informational states.", BODY))
    
    story.append(add_heading("13.3 Opacity Pattern", H3, level=1))
    story.append(bullet_list([
        "Badges: bg-{color}-500/10 text-{color}-300 border-{color}-500/20",
        "Forbidden in dark mode: bg-{color}-50 (renders too dark).",
    ]))
    
    story.append(add_heading("13.4 The Three Brand Anchors", H3, level=1))
    brand_rows = [
        ["Name", "Hex", "Role"],
        ["Midnight", "#071323", "Dark mode background"],
        ["Veltra Emerald", "#39CFA2", "Accent, success, brand"],
        ["Warm White", "#FAF8F5", "Light mode background"],
    ]
    story.append(styled_table(brand_rows, col_widths=[40 * mm, 30 * mm, CONTENT_W - 70 * mm]))
    
    # ===== 14. SPACING & LAYOUT =====
    story.append(add_heading("14. Spacing & Layout", H1, level=0))
    
    story.append(add_heading("14.1 Scale (8px base)", H3, level=1))
    spacing_rows = [
        ["Token", "Value", "Use"],
        ["1", "4px", "Micro adjustments"],
        ["2", "8px", "Tight gaps"],
        ["3", "12px", "Default small"],
        ["4", "16px", "Default"],
        ["5", "20px", "Section padding"],
        ["6", "24px", "Section gaps"],
        ["8", "32px", "Section breaks"],
        ["12", "48px", "Hero padding"],
    ]
    story.append(styled_table(spacing_rows, col_widths=[20 * mm, 24 * mm, CONTENT_W - 44 * mm]))
    
    story.append(add_heading("14.2 Cards", H3, level=1))
    story.append(bullet_list([
        "Padding: p-6 (24px) standard, p-8 (32px) for hero/feature cards.",
        "Border: <b>forbidden</b> on cards — use shadow only.",
        "Radius: rounded-2xl (16px) for large cards, rounded-lg (8px) for inline.",
    ]))
    
    story.append(add_heading("14.3 Rows", H3, level=1))
    story.append(bullet_list([
        "List rows: px-6 py-4 (24px / 16px).",
        "Dividers between rows: border-b border-border/40 — never divide-y.",
        "The last row has no border.",
    ]))
    
    story.append(add_heading("14.4 Section Rhythm", H3, level=1))
    story.append(bullet_list([
        "Section padding: py-12 minimum between major sections.",
        "Card padding: p-6 minimum.",
        "Never stack more than 4 cards in a column without a visual break.",
    ]))
    
    # ===== 15. MOTION =====
    story.append(add_heading("15. Motion", H1, level=0))
    
    story.append(add_heading("15.1 The Single Easing", H3, level=1))
    story.append(bullet_list([
        "All motion uses <b>one</b> easing curve: cubic-bezier(0.16, 1, 0.3, 1) — the \"Veltra Ease.\"",
        "Durations: 0.2s for micro-interactions, 0.3s for page transitions, 0.5s for entrances.",
    ]))
    
    story.append(add_heading("15.2 Entrances", H3, level=1))
    story.append(bullet_list([
        "Stagger: 0.05–0.08s between items.",
        "Initial: opacity: 0, y: 8–12px.",
        "Hover lift: y: -2 to -4px with spring (stiffness 400, damping 25).",
    ]))
    
    story.append(add_heading("15.3 Forbidden", H3, level=1))
    story.append(bullet_list([
        "No infinite animations except the LIVE pulse.",
        "No autoplay carousels.",
        "No spinners without an 8-second timeout fallback.",
        "No bounce easing. No elastic easing. No back-easing.",
        "No motion that triggers vestibular discomfort (respect prefers-reduced-motion).",
    ]))
    
    # ===== 16. AUTH & PERMISSIONS =====
    story.append(add_heading("16. Auth & Permissions", H1, level=0))
    
    story.append(add_heading("16.1 Login", H3, level=1))
    story.append(bullet_list([
        "Every user logs in with email + password.",
        "No \"guest\" mode. No \"demo without login\" outside labeled investor demos.",
        "Demo mode: demo users appear in a one-click dropdown for investors.",
    ]))
    
    story.append(add_heading("16.2 Roles (4 roles)", H3, level=1))
    role_rows = [
        ["Role", "Can View", "Can Edit"],
        ["Admin", "Everything", "Everything"],
        ["Doctor", "patients, appointments, timeline, brief", "appointments (confirm/complete), patient notes, prescriptions"],
        ["Receptionist", "appointments, patients (basic)", "appointments (book/check-in/cancel), patient contact info"],
        ["Nurse", "patients, timeline, vitals", "vitals, check-in, notes"],
    ]
    story.append(styled_table(role_rows, col_widths=[28 * mm, 60 * mm, CONTENT_W - 88 * mm]))
    
    story.append(add_heading("16.3 Permission Guards", H3, level=1))
    story.append(bullet_list([
        "Every screen checks canAccess(role, screen).",
        "Every action button checks canDo(role, action).",
        "If the user lacks permission, the button <b>does not render</b> — it is not disabled.",
    ]))
    
    story.append(add_heading("16.4 Audit Log", H3, level=1))
    story.append(bullet_list([
        "Every action is logged: userId, action, target, timestamp, before, after.",
        "The Admin can view the complete audit log.",
        "The audit log is <b>immutable</b> — append-only.",
    ]))
    
    story.append(add_heading("16.5 Session", H3, level=1))
    story.append(bullet_list([
        "8-hour idle timeout.",
        "30-day maximum session.",
        "2FA: optional at Solo, encouraged at Group, mandatory at Network.",
    ]))
    
    # ===== 17. SEARCH =====
    story.append(add_heading("17. Search", H1, level=0))
    
    story.append(add_heading("17.1 Command Palette (Cmd+K)", H3, level=1))
    story.append(bullet_list([
        "Available on every screen.",
        "Searches: screens, patients, appointments, actions, demo controls.",
        "Fuzzy match, recent searches, keyboard navigation (arrows + Enter).",
    ]))
    
    story.append(add_heading("17.2 Patient Search", H3, level=1))
    story.append(bullet_list([
        "Searches by: name, condition, doctor, phone, balance status, specialty, city, tags.",
        "Results appear within 200ms (debounced).",
        'Empty state: "No one here. Try a different search."',
    ]))
    
    story.append(add_heading("17.3 Global Search", H3, level=1))
    story.append(bullet_list([
        "Cmd+K opens the command palette from anywhere.",
        "Recent searches persist across sessions.",
        "Keyboard-only navigation is fully supported.",
    ]))
    
    # ===== 18. POLISH & STATES =====
    story.append(add_heading("18. Polish & States", H1, level=0))
    
    story.append(add_heading("18.1 Visual Hierarchy", H3, level=1))
    story.append(quote_block("One focal point per screen. The eye knows where to land within 200ms."))
    
    story.append(add_heading("18.2 Empty States", H3, level=1))
    story.append(bullet_list([
        "Every empty state has: editorial italic message + CTA button.",
        "Forbidden: \"No data\" alone.",
    ]))
    
    story.append(add_heading("18.3 Loading States", H3, level=1))
    story.append(bullet_list([
        "Every async action has: spinner (Loader2) + disabled state + 8s timeout → error toast with retry.",
    ]))
    
    story.append(add_heading("18.4 Error States", H3, level=1))
    story.append(bullet_list([
        "Every error toast has: title + description + optional action button.",
        "Forbidden: red screen of death. Always graceful fallback.",
    ]))
    
    story.append(add_heading("18.5 Optimistic UI", H3, level=1))
    story.append(bullet_list([
        "Every user-initiated mutation updates the UI immediately.",
        "If the server rejects, rollback within 400ms with an explanatory toast.",
    ]))
    
    # ===== 19. DEMO MODE =====
    story.append(add_heading("19. Demo Mode", H1, level=0))
    
    story.append(add_heading("19.1 Banner", H3, level=1))
    story.append(bullet_list([
        "The demo banner is sticky at the top, emerald-tinted glass.",
        'It shows: "Demo Clinic" + "Switch to Live" + "Reset."',
    ]))
    
    story.append(add_heading("19.2 Reset", H3, level=1))
    story.append(bullet_list([
        "Reset returns all data to its seeded state.",
        'Toast: "Demo reset — All data restored."',
    ]))
    
    story.append(add_heading("19.3 Live Mode", H3, level=1))
    story.append(bullet_list([
        'Same data, but the banner reads "Live Mode."',
        "No data change — it is psychological (the user \"owns\" the data for this session).",
    ]))
    
    story.append(add_heading("19.4 Specialty Switching", H3, level=1))
    story.append(bullet_list([
        "The sidebar contains a Specialty Switcher that regenerates the entire dataset for the selected specialty.",
        "Switching is logged in the audit trail.",
        "Switching never loses the user's session.",
    ]))
    
    story.append(add_heading("19.5 Tier Switching", H3, level=1))
    story.append(bullet_list([
        "The sidebar contains a Tier Badge that switches the active subscription tier (Solo / Group / Network).",
        "Switching tiers updates the visible feature set.",
    ]))
    
    # ===== 20. MOBILE =====
    story.append(add_heading("20. Mobile", H1, level=0))
    
    story.append(add_heading("20.1 Layout", H3, level=1))
    story.append(bullet_list([
        "Sidebar collapses to a hamburger drawer.",
        "Stat grids: 4 cols → 2 cols.",
        "Card grids: 3 cols → 1 col.",
        "Touch targets: minimum 44×44px.",
    ]))
    
    story.append(add_heading("20.2 Top Bar", H3, level=1))
    story.append(bullet_list([
        "Hamburger + screen title + (theme toggle + notifications bell).",
    ]))
    
    story.append(add_heading("20.3 Forbidden on Mobile", H3, level=1))
    story.append(bullet_list([
        "Hover-dependent interactions.",
        "Modals wider than the viewport.",
        "Tables wider than the viewport (use cards instead).",
        "Fixed elements that overlap the system status bar.",
    ]))
    
    # ===== 21. ACCESSIBILITY =====
    story.append(add_heading("21. Accessibility", H1, level=0))
    
    story.append(add_heading("21.1 Contrast", H3, level=1))
    story.append(bullet_list([
        "All text meets WCAG AA (4.5:1 for body, 3:1 for large text).",
        "No text below 11px.",
    ]))
    
    story.append(add_heading("21.2 Keyboard", H3, level=1))
    story.append(bullet_list([
        "Every interactive element is reachable via Tab.",
        "Focus ring is always visible (outline-ring).",
        "Shortcuts: 1–6 for primary screens, Cmd+K for palette, Cmd+/ for shortcuts help, Cmd+Z for undo, Cmd+D for theme toggle.",
    ]))
    
    story.append(add_heading("21.3 Screen Readers", H3, level=1))
    story.append(bullet_list([
        "Every icon button has an aria-label.",
        "Every dialog has DialogTitle + DialogDescription (sr-only acceptable).",
        "Every form input has an associated Label.",
        'Every status update (toast, notification) uses aria-live="polite".',
    ]))
    
    story.append(add_heading("21.4 Reduced Motion", H3, level=1))
    story.append(bullet_list([
        "prefers-reduced-motion: reduce disables all non-essential animations.",
        "The LIVE pulse remains (it carries information).",
        "Page transitions become crossfades only.",
    ]))
    
    # ===== 22. SERVER STABILITY =====
    story.append(add_heading("22. Server Stability", H1, level=0))
    
    story.append(add_heading("22.1 No Crashes", H3, level=1))
    story.append(bullet_list([
        "Any runtime error displays a fallback — never a white screen.",
        "An error boundary catches every client error.",
        'A global error boundary catches fatal errors and offers "Reload" or "Go Home."',
    ]))
    
    story.append(add_heading("22.2 No 404s", H3, level=1))
    story.append(bullet_list([
        "Every route, every asset, every icon must exist.",
        "apple-touch-icon, favicon, og-image — all present.",
        "A custom 404 page that is on-brand and offers next steps.",
    ]))
    
    story.append(add_heading("22.3 No Console Errors", H3, level=1))
    story.append(bullet_list([
        "No hydration mismatches.",
        "No missing dependencies in useEffect.",
        "No a11y warnings in the console.",
        "No console.log in production builds.",
    ]))
    
    story.append(add_heading("22.4 Health Checks", H3, level=1))
    story.append(bullet_list([
        'GET /api/health returns { "status": "ok", "version": "x.y.z", "time": "ISO" }.',
        "The endpoint does not require authentication.",
        "It is monitored by the deployment platform.",
    ]))
    
    # ===== 23. FUTURE EXPANSION =====
    story.append(add_heading("23. Future Expansion", H1, level=0))
    
    story.append(add_heading("23.1 The Scale Rule", H3, level=1))
    story.append(quote_block(
        "The architecture must support 10 clinics, 100 clinics, 1,000 clinics, 100,000 clinics — without redesigning the core system."
    ))
    
    story.append(add_heading("23.2 Design for Global", H3, level=1))
    story.append(bullet_list([
        "Multi-currency from day one.",
        "Multi-language from day one (English, Arabic, with RTL support).",
        "Multi-timezone from day one.",
        "Multi-region data residency from day one.",
    ]))
    
    story.append(add_heading("23.3 Design for the Network", H3, level=1))
    story.append(bullet_list([
        "Every clinic is a tenant.",
        "Every tenant can join a network (with consent).",
        "Network Memory is anonymized and aggregated — never raw PHI.",
        "Cross-clinic analytics require explicit, audited opt-in.",
    ]))
    
    story.append(add_heading("23.4 Design for the Long Now", H3, level=1))
    story.append(bullet_list([
        "Every database migration is forward-only.",
        "Every API version is supported for at least 24 months.",
        "Every feature flag has a documented sunset date.",
        "The system must be operable for 20 years without a full rewrite.",
    ]))
    
    story.append(add_heading("23.5 Design for the Ecosystem", H3, level=1))
    story.append(bullet_list([
        "Veltra will eventually expose APIs to third-party developers.",
        "Every endpoint is designed as if it will be public one day.",
        "Webhooks are versioned and signed.",
    ]))
    
    # ===== 24. FINAL PRINCIPLE =====
    story.append(add_heading("24. Final Principle", H1, level=0))
    story.append(quote_block(
        "If a proposed feature makes the product more complicated than valuable, <b>reject it</b>."
    ))
    story.append(Paragraph(
        "Veltra is not a feature factory. Veltra is a <b>clinic operating system</b> that earns its place by disappearing.",
        BODY
    ))
    story.append(Paragraph(
        "Every line of code is a liability. Every feature is a maintenance burden. Every abstraction is a tax on the next engineer.",
        BODY
    ))
    story.append(Paragraph(
        "The best feature is the one we <b>did not build</b> — because the existing system already solved the problem.",
        BODY
    ))
    story.append(Spacer(1, 12))
    story.append(quote_block("Technology disappears.<br/>Care remains."))
    
    # ===== APPENDIX A =====
    story.append(PageBreak())
    story.append(add_heading("Appendix A: The Veltra Product Process", H1, level=0))
    story.append(Paragraph(
        "This constitution assumes the following product process, inspired by Apple:",
        BODY
    ))
    process_steps = [
        ("1. Vision", "What problem? Why must this exist?"),
        ("2. Product Principles", "What will we not do? What feeling must the user have?"),
        ("3. User Flows", "How does the doctor use Veltra from the first minute to the end of the day?"),
        ("4. Information Architecture", "What are the screens? Their relationships? Their states?"),
        ("5. Wireframes", "Boxes only. No color. No UI polish."),
        ("6. Prototype", "Full flow. Transitions. Edge cases."),
        ("7. High Fidelity Design (Figma)", "Colors, fonts, spacing, finalized here."),
        ("8. Design System", "Buttons, cards, inputs, typography, icons, tokens, components."),
        ("9. Engineering", "Implementation begins."),
    ]
    for name, desc in process_steps:
        story.append(Paragraph(
            f'<b>{name}</b> — {desc}',
            ParagraphStyle(name="Proc", parent=BODY, leftIndent=14, spaceBefore=3, spaceAfter=4)
        ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "<b>The engineer implements, not decides.</b> UX decisions happen in Figma, not in code. If the Figma is wrong, fix the Figma — do not improvise in code.",
        BODY
    ))
    story.append(Paragraph(
        "Figma is the <b>Single Source of Truth</b>. Every Next.js screen is a faithful copy of the Figma, never the reverse.",
        BODY
    ))
    
    # ===== APPENDIX B =====
    story.append(add_heading("Appendix B: The Veltra Stack", H1, level=0))
    stack_rows = [
        ["Layer", "Technology"],
        ["Framework", "Next.js 16 (App Router)"],
        ["Language", "TypeScript (strict)"],
        ["Styling", "Tailwind CSS v4"],
        ["Components", "shadcn/ui"],
        ["State", "Zustand (client) + TanStack Query (server)"],
        ["Database", "PostgreSQL + Prisma"],
        ["Cache", "Redis"],
        ["Real-time", "WebSockets (Socket.IO)"],
        ["Voice", "Web Speech API + Whisper (server)"],
        ["Storage", "S3-compatible (MinIO in dev)"],
        ["Auth", "NextAuth.js + JWT + 2FA TOTP"],
        ["Monitoring", "Sentry (errors) + Vercel Analytics (product)"],
        ["Deployment", "Vercel (web) + Railway (backend) + Fly.io (region-specific)"],
    ]
    story.append(styled_table(stack_rows, col_widths=[40 * mm, CONTENT_W - 40 * mm]))
    
    # ===== APPENDIX C =====
    story.append(add_heading("Appendix C: The Veltra File Structure", H1, level=0))
    story.append(Paragraph(
        '<font face="Mono" size="8.5" color="#1A2238">'
        'src/<br/>'
        '├── app/                    # Next.js App Router<br/>'
        '│   ├── (auth)/             # Login, signup, 2FA<br/>'
        '│   ├── (workspace)/        # Authenticated workspace<br/>'
        '│   ├── api/                # API route handlers<br/>'
        '│   └── globals.css         # Global styles + design tokens<br/>'
        '├── components/<br/>'
        '│   ├── ui/                 # shadcn/ui primitives<br/>'
        '│   └── veltra/             # Veltra-specific components<br/>'
        '├── lib/<br/>'
        '│   ├── veltra-store.ts     # Zustand store<br/>'
        '│   ├── specialties.ts      # Specialty configurations<br/>'
        '│   ├── subscription-tiers.ts # Tier configurations<br/>'
        '│   ├── db.ts               # Prisma client<br/>'
        '│   └── utils.ts            # Shared utilities<br/>'
        '├── hooks/                  # Custom React hooks<br/>'
        '└── types/                  # Shared TypeScript types'
        '</font>',
        CODE
    ))
    
    # ===== SIGNATURE =====
    story.append(Spacer(1, 18))
    story.append(HorizontalLine(CONTENT_W, 1, VELTRA_EMERALD))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        "This is <b>Veltra Engineering Constitution v1.0</b>.",
        BODY
    ))
    story.append(Paragraph(
        "It is the constitution that any AI, engineer, designer, or product manager must obey before writing a single line of code.",
        BODY
    ))
    story.append(Paragraph(
        "It will be versioned. It will evolve. But its <b>soul</b> will not change:",
        BODY
    ))
    story.append(Spacer(1, 8))
    story.append(quote_block("Technology disappears.<br/>Care remains."))
    story.append(Spacer(1, 16))
    story.append(Paragraph(
        '<font color="#1FA17F">— Veltra, 2026</font>',
        ParagraphStyle(name="Sig", parent=BODY, alignment=TA_RIGHT, fontName="Inter-Bold")
    ))
    
    return story


# ===== Main =====

def main():
    output_path = "/home/z/my-project/download/Veltra-Engineering-Constitution.pdf"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    doc = TocDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=MARGIN_L, rightMargin=MARGIN_R,
        topMargin=MARGIN_T + 6 * mm, bottomMargin=MARGIN_B + 6 * mm,
        title="Veltra Engineering Constitution v1.0",
        author="Veltra",
        subject="The Operating System of Healthcare — Engineering Constitution",
        creator="Veltra",
    )
    
    story = build_story()
    
    # Use onFirstPage for cover, onLaterPages for body
    doc.multiBuild(story, onFirstPage=cover_page, onLaterPages=body_page)
    
    size = os.path.getsize(output_path)
    print(f"✓ PDF generated: {output_path}")
    print(f"  Size: {size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
