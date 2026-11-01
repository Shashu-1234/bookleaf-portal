"""Render the submission note. Requires reportlab and pypdf (authoring only)."""
from pathlib import Path
from html import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "bookleaf-approach.pdf"
TEXT = (ROOT / "docs" / "approach.md").read_text(encoding="utf-8")
INK = colors.HexColor("#172b36")
BLUE = colors.HexColor("#176786")
body = ParagraphStyle("Body", fontName="Helvetica", fontSize=10.2, leading=14.2,
                      textColor=INK, spaceAfter=8, alignment=TA_LEFT)
heading = ParagraphStyle("Section", parent=body, fontName="Helvetica-Bold",
                         fontSize=11, textColor=BLUE, spaceBefore=5, spaceAfter=5,
                         keepWithNext=True)
title = ParagraphStyle("Title", parent=heading, fontSize=19, leading=23, spaceAfter=7)
subtitle = ParagraphStyle("Subtitle", parent=body, fontSize=9, textColor=BLUE, spaceAfter=15)

def normalized(text):
    return escape(text.replace("—", "-").replace("–", "-").replace("’", "'"))

story = [Paragraph("BookLeaf Portal", title),
         Paragraph("APPROACH, TRADE-OFFS AND PRODUCTION EVOLUTION | SHASHANK", subtitle)]
for block in TEXT.strip().split("\n\n"):
    if block.startswith("# "):
        continue
    if block.startswith("## "):
        story.append(Paragraph(normalized(block[3:]), heading))
    else:
        story.append(Paragraph(normalized(" ".join(block.splitlines())), body))

def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor("#dfe7ea"))
    canvas.line(48, 41, A4[0] - 48, 41)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#687f89"))
    canvas.drawString(48, 28, "BookLeaf Publishing | Full Stack Developer technical assignment")
    canvas.drawRightString(A4[0] - 48, 28, str(doc.page))

doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=48, leftMargin=48,
                        topMargin=40, bottomMargin=53, title="BookLeaf Portal - Approach",
                        author="Shashank")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
reader = PdfReader(OUTPUT)
assert len(reader.pages) == 1, f"Expected one page, got {len(reader.pages)}"
for section in ["Problem and priorities", "Architecture and data", "AI strategy and failure handling", "Trade-offs, validation and production evolution"]:
    assert section in reader.pages[0].extract_text(), f"Missing section: {section}"
print(f"Verified: {OUTPUT} | A4 | 1 page | all four sections present")
