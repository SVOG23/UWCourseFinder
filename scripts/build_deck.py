#!/usr/bin/env python3
"""Generate the UW Course Finder showcase slide deck as a .pptx.

Mirrors slides/index.html (problem / solution / impact) with UW branding, for
submission to the UW-IT Student Innovation Lab Community Project Showcase.

    pip install python-pptx
    python3 scripts/build_deck.py   # -> slides/UW-Course-Finder.pptx
"""
from __future__ import annotations

import os

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

# UW palette
PURPLE = RGBColor(0x4B, 0x2E, 0x83)
PURPLE_D = RGBColor(0x39, 0x23, 0x6A)
PURPLE_L = RGBColor(0x6A, 0x4B, 0xB0)
GOLD = RGBColor(0xB7, 0xA5, 0x7A)
GOLD_D = RGBColor(0x85, 0x75, 0x4D)
INK = RGBColor(0x21, 0x1B, 0x33)
MUTED = RGBColor(0x6B, 0x64, 0x78)
LINE = RGBColor(0xE7, 0xE2, 0xF0)
GREEN = RGBColor(0x1F, 0x7A, 0x4D)
GREEN_BG = RGBColor(0xE6, 0xF4, 0xEC)
LOCKED = RGBColor(0x9B, 0x95, 0xA8)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
CARD = RGBColor(0xFF, 0xFF, 0xFF)
LAVENDER = RGBColor(0xD8, 0xCC, 0xF2)
LIGHT = RGBColor(0xF5, 0xF3, 0xFB)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "slides", "UW-Course-Finder.pptx")

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
EMU = Inches(1)


def slide(bg=WHITE):
    s = prs.slides.add_slide(BLANK)
    r = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    r.fill.solid()
    r.fill.fore_color.rgb = bg
    r.line.fill.background()
    r.shadow.inherit = False
    return s


def text(s, l, t, w, h, runs, size=18, color=INK, bold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, spacing=1.08, font="Calibri"):
    """runs: a string, or list of paragraphs where each paragraph is a list of
    (text, {overrides}) run tuples."""
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    if isinstance(runs, str):
        runs = [[(runs, {})]]
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = spacing
        p.space_after = Pt(6)
        for txt, o in para:
            run = p.add_run()
            run.text = txt
            f = run.font
            f.size = Pt(o.get("size", size))
            f.bold = o.get("bold", bold)
            f.italic = o.get("italic", False)
            f.color.rgb = o.get("color", color)
            f.name = o.get("font", font)
    return tb


def card(s, l, t, w, h, fill=CARD, line=LINE, radius=0.06, accent=None):
    shp = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    shp.fill.solid()
    shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(1)
    try:
        shp.adjustments[0] = radius
    except Exception:
        pass
    shp.shadow.inherit = False
    if accent:
        bar = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l + 0.25), Inches(t + 0.28), Inches(0.55), Inches(0.12))
        bar.fill.solid()
        bar.fill.fore_color.rgb = accent
        bar.line.fill.background()
        bar.shadow.inherit = False
    return shp


def kicker(s, label, color=GOLD_D):
    text(s, 0.92, 0.62, 11.5, 0.5, label.upper(), size=13, color=color, bold=True)


def heading(s, title, color=INK):
    text(s, 0.9, 1.05, 11.6, 1.3, title, size=34, color=color, bold=True, spacing=1.0)


def bullets(s, l, t, w, h, items, size=18, gap=10):
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.line_spacing = 1.12
        p.space_after = Pt(gap)
        r = p.add_run()
        r.text = "▸  "
        r.font.size = Pt(size)
        r.font.bold = True
        r.font.color.rgb = PURPLE_L
        r.font.name = "Calibri"
        for txt, o in (item if isinstance(item, list) else [(item, {})]):
            run = p.add_run()
            run.text = txt
            run.font.size = Pt(o.get("size", size))
            run.font.bold = o.get("bold", False)
            run.font.italic = o.get("italic", False)
            run.font.color.rgb = o.get("color", INK)
            run.font.name = "Calibri"


def small_box(s, l, t, w, h, label, fill, border, txt_color):
    b = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    b.fill.solid()
    b.fill.fore_color.rgb = fill
    b.line.color.rgb = border
    b.line.width = Pt(1.5)
    b.shadow.inherit = False
    try:
        b.adjustments[0] = 0.18
    except Exception:
        pass
    tf = b.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = label
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = txt_color
    r.font.name = "Consolas"


def footer(s, num, light=False):
    c = LAVENDER if light else MUTED
    text(s, 0.92, 6.95, 6, 0.4, "UW Course Finder", size=11, color=c, bold=True)
    text(s, 11.0, 6.95, 1.5, 0.4, f"{num} / 8", size=11, color=c, align=PP_ALIGN.RIGHT)


# ---- Slide 1: Title -------------------------------------------------------
s = slide(PURPLE)
kicker(s, "UW-IT Student Innovation Lab · Community Project Showcase", color=GOLD)
text(s, 0.9, 1.7, 11.6, 1.8, "UW Course Finder", size=66, color=WHITE, bold=True)
text(s, 0.92, 3.5, 11, 0.8, "Visualize a quarter-by-quarter path to your UW degree.",
     size=24, color=LAVENDER)
text(s, 0.92, 4.7, 11, 1.0, [
    [("Suraj Vaghela  ·  surajv23@uw.edu", {"size": 18, "color": WHITE})],
], size=18, color=WHITE)
badge = card(s, 0.92, 5.5, 4.0, 0.55, fill=PURPLE_D, line=PURPLE_L, radius=0.5)
btf = badge.text_frame
btf.vertical_anchor = MSO_ANCHOR.MIDDLE
bp = btf.paragraphs[0]
bp.alignment = PP_ALIGN.CENTER
br = bp.add_run()
br.text = "Built on 14,171 real UW courses"
br.font.size = Pt(14)
br.font.bold = True
br.font.color.rgb = WHITE
br.font.name = "Calibri"
text(s, 0.92, 6.95, 6, 0.4, "University of Washington", size=11, color=LAVENDER, bold=True)
text(s, 11.0, 6.95, 1.5, 0.4, "1 / 8", size=11, color=LAVENDER, align=PP_ALIGN.RIGHT)

# ---- Slide 2: Problem -----------------------------------------------------
s = slide()
kicker(s, "The problem")
heading(s, "UW has the data. Students still plan by hand.")
text(s, 0.92, 2.15, 11.4, 1.1,
     "MyPlan, DARS, and a 14,000-course catalog all exist — but nothing turns "
     "“what are my requirements and prerequisites?” into “what do I take, and when?”",
     size=20, color=MUTED, spacing=1.25)
bullets(s, 0.92, 3.65, 11.4, 3.0, [
    "Prerequisite chains are a maze — one wrong order can delay graduation a full year.",
    "Degree requirements live in dense department PDFs.",
    "Sequencing 12+ quarters around prereqs and course offerings is manual guesswork.",
    "Transfer and returning students feel it most.",
], size=19, gap=12)
footer(s, 2)

# ---- Slide 3: Solution ----------------------------------------------------
s = slide()
kicker(s, "The solution")
heading(s, "Your major + your courses → a clear plan.")
text(s, 0.92, 2.1, 11.4, 0.9,
     "Enter your major and the courses you’ve completed (or paste a DARS audit). "
     "UW Course Finder does the rest.", size=20, color=MUTED, spacing=1.2)
pill = [
    ("Personalize", "Adapts to the courses you’ve already taken and your specialization."),
    ("Sequence", "A prerequisite-aware scheduler plans every quarter to graduation."),
    ("Explore", "Click any course to see exactly what it unlocks next."),
]
pw, gap = 3.62, 0.27
for i, (t_, d_) in enumerate(pill):
    x = 0.92 + i * (pw + gap)
    card(s, x, 3.4, pw, 2.7, accent=GOLD)
    text(s, x + 0.25, 3.95, pw - 0.5, 0.6, t_, size=21, color=PURPLE, bold=True)
    text(s, x + 0.25, 4.55, pw - 0.5, 1.4, d_, size=15, color=MUTED, spacing=1.2)
footer(s, 3)

# ---- Slide 4: Two views ---------------------------------------------------
s = slide()
kicker(s, "How it works")
heading(s, "Two views, one personalized plan.")
# Left panel — Quarter Plan
card(s, 0.92, 2.25, 5.7, 4.3, accent=None)
text(s, 1.2, 2.45, 5.2, 0.5, "Quarter Plan", size=21, color=PURPLE, bold=True)
text(s, 1.2, 3.0, 5.2, 0.9, "A prereq-aware schedule to UW’s 180-credit minimum, "
     "with an estimated graduation term.", size=13.5, color=MUTED, spacing=1.15)
qcols = [("Autumn", ["CSE 143", "MATH 126"]), ("Winter", ["CSE 311", "CSE 351"]),
         ("Spring", ["CSE 332", "VLPA"])]
cw = 1.62
for i, (q, courses) in enumerate(qcols):
    x = 1.2 + i * (cw + 0.13)
    head = card(s, x, 4.05, cw, 0.45, fill=LIGHT, line=LINE, radius=0.12)
    ht = head.text_frame
    ht.vertical_anchor = MSO_ANCHOR.MIDDLE
    hp = ht.paragraphs[0]
    hp.alignment = PP_ALIGN.CENTER
    hr = hp.add_run()
    hr.text = q
    hr.font.size = Pt(12)
    hr.font.bold = True
    hr.font.color.rgb = PURPLE
    hr.font.name = "Calibri"
    for j, c in enumerate(courses):
        flex = c == "VLPA"
        small_box(s, x, 4.62 + j * 0.62, cw, 0.5, c,
                  fill=WHITE, border=(GOLD if flex else PURPLE),
                  txt_color=(GOLD_D if flex else INK))
# Right panel — Prerequisite Map
card(s, 6.85, 2.25, 5.6, 4.3, accent=None)
text(s, 7.13, 2.45, 5.1, 0.5, "Prerequisite Map", size=21, color=PURPLE, bold=True)
text(s, 7.13, 3.0, 5.1, 0.9, "An interactive graph — click a course to expand what "
     "it unlocks; check it off to update the plan.", size=13.5, color=MUTED, spacing=1.15)
small_box(s, 7.13, 4.15, 1.45, 0.6, "CSE 143", GREEN_BG, GREEN, GREEN)
text(s, 8.62, 4.18, 0.4, 0.55, "→", size=20, color=PURPLE_L, bold=True, anchor=MSO_ANCHOR.MIDDLE)
small_box(s, 9.05, 4.15, 1.45, 0.6, "CSE 311", WHITE, PURPLE, INK)
text(s, 10.54, 4.18, 0.4, 0.55, "→", size=20, color=PURPLE_L, bold=True, anchor=MSO_ANCHOR.MIDDLE)
small_box(s, 10.97, 4.15, 1.3, 0.6, "CSE 332", WHITE, LOCKED, LOCKED)
text(s, 7.13, 5.25, 5.1, 1.0, [
    [("■ ", {"color": GREEN}), ("Completed    ", {"color": MUTED, "size": 12}),
     ("■ ", {"color": PURPLE}), ("Available now    ", {"color": MUTED, "size": 12}),
     ("■ ", {"color": LOCKED}), ("Prereqs needed", {"color": MUTED, "size": 12})],
], size=12)
footer(s, 4)

# ---- Slide 5: Real data ---------------------------------------------------
s = slide()
kicker(s, "Under the hood")
heading(s, "Grounded in real UW data.")
stats = [("14,171", "real UW Seattle courses"), ("4", "majors + specializations"),
         ("180", "credit plans, prereq-valid"), ("100%", "in-browser & private")]
sw = 2.72
for i, (big, lbl) in enumerate(stats):
    x = 0.92 + i * (sw + 0.18)
    card(s, x, 2.2, sw, 1.7)
    text(s, x + 0.2, 2.4, sw - 0.4, 0.8, big, size=34, color=PURPLE, bold=True)
    text(s, x + 0.2, 3.25, sw - 0.4, 0.55, lbl, size=13, color=MUTED, spacing=1.05)
bullets(s, 0.92, 4.35, 11.5, 2.3, [
    "Course catalog from the official UW Course Descriptions; CSE, Informatics, Math & ACMS requirements encoded.",
    "Paste a DARS audit or transcript — it auto-detects your completed courses, all client-side.",
    "React + TypeScript + React Flow; deploys free as a static site.",
], size=18, gap=12)
footer(s, 5)

# ---- Slide 6: Impact ------------------------------------------------------
s = slide()
kicker(s, "The impact")
heading(s, "Clearer planning, on-time graduation.")
bullets(s, 0.92, 2.2, 11.5, 2.6, [
    [("For students: ", {"bold": True, "color": PURPLE}),
     ("better course decisions, fewer wasted credits, less adviser back-and-forth.", {})],
    [("Extensible by design: ", {"bold": True, "color": PURPLE}),
     ("every major is pure data — a new program is one file, no code.", {})],
    [("A genuine gap: ", {"bold": True, "color": PURPLE}),
     ("UW-IT’s own prereq-map (archived 2022) only ", {}),
     ("visualized", {"italic": True}),
     (" prerequisites; this ", {}), ("plans", {"italic": True}),
     (" a personalized degree.", {})],
], size=19, gap=16)
co = card(s, 0.92, 4.9, 11.5, 1.4, fill=RGBColor(0xFC, 0xFB, 0xF7), line=GOLD, radius=0.04)
text(s, 1.25, 5.05, 10.9, 1.1,
     "A natural input to MyPlan and advising — turning static requirements into a "
     "living, personal roadmap for every Husky.", size=18, color=INK, spacing=1.25,
     anchor=MSO_ANCHOR.MIDDLE)
footer(s, 6)

# ---- Slide 7: Roadmap -----------------------------------------------------
s = slide()
kicker(s, "What’s next")
heading(s, "Roadmap.")
bullets(s, 0.92, 2.3, 11.5, 3.5, [
    "Expand to more majors and minors across all three campuses.",
    "Model UW’s full “one-of / all-of” prerequisite logic for exact accuracy.",
    "Live course & offerings data via a MyPlan partnership.",
    "Save, compare, and share plans; mobile-first layout.",
], size=20, gap=16)
footer(s, 7)

# ---- Slide 8: Closing -----------------------------------------------------
s = slide(PURPLE)
kicker(s, "Try it", color=GOLD)
text(s, 0.9, 1.6, 11.6, 1.5, "Plan your path.", size=58, color=WHITE, bold=True)
text(s, 0.92, 3.4, 11.5, 2.2, [
    [("Live demo:  ", {"bold": True, "color": WHITE}),
     ("svog23.github.io/uwcoursefinder", {"color": LAVENDER})],
    [("Code:  ", {"bold": True, "color": WHITE}),
     ("github.com/SVOG23/UWCourseFinder", {"color": LAVENDER})],
    [("Contact:  ", {"bold": True, "color": WHITE}),
     ("Suraj Vaghela · surajv23@uw.edu", {"color": LAVENDER})],
], size=20, spacing=1.6)
text(s, 0.92, 6.1, 11.5, 0.6,
     "An unofficial, student-built planning aid — not affiliated with or endorsed by UW.",
     size=13, color=LAVENDER)
text(s, 0.92, 6.95, 6, 0.4, "University of Washington", size=11, color=LAVENDER, bold=True)
text(s, 11.0, 6.95, 1.5, 0.4, "8 / 8", size=11, color=LAVENDER, align=PP_ALIGN.RIGHT)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
prs.save(OUT)
print(f"Wrote {OUT} ({os.path.getsize(OUT) // 1024} KB, {len(prs.slides._sldIdLst)} slides)")
