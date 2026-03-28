from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIR / "bridge_protocol_app_summary.pdf"


def build_styles():
    styles = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=6,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10.5,
            textColor=colors.HexColor("#475569"),
            spaceAfter=10,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=12.5,
            textColor=colors.HexColor("#1d4ed8"),
            spaceBefore=2,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10.5,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=2,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8.3,
            leading=10.0,
            leftIndent=10,
            firstLineIndent=-6,
            bulletIndent=0,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=1,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=7.6,
            leading=9.2,
            textColor=colors.HexColor("#334155"),
            spaceAfter=1,
        ),
    }


def bullets(items: list[str], style: ParagraphStyle) -> list[Paragraph]:
    return [Paragraph(item, style, bulletText="-") for item in items]


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    styles = build_styles()

    what_it_is = (
        "Bridge Protocol is a Next.js App Router prototype for civic issue discussion. The current app "
        "presents a consensus-ranked issue feed, a dedicated post composer, an issue detail view, a profile "
        "page, and a browser-local authentication flow. Core interactions run from client state and "
        "localStorage, with Supabase helpers and schema files included for a future backend migration."
    )

    who_its_for = (
        "<b>Primary user/persona:</b> not explicitly documented in the repo.<br/>"
        "<b>Best repo-backed inference:</b> people posting public-interest questions, tracking cross-cluster "
        "consensus, and reviewing counter-perspectives inside a mobile-first civic discussion product."
    )

    features = [
        "Home feed ranks issue threads by consensus score and opposing-view support, with a prominent Bridge Meter card and issue summary metrics.",
        "Each issue card highlights category, state, urgency, vote totals, cluster mix, and a counter-perspective summary meant to surface disagreement constructively.",
        "Dedicated submit flow lets signed-in users publish new issue threads with category, state, title, and body fields.",
        "Auth modal supports local email/password demo accounts plus optional Google Identity sign-in when <font face='Courier'>NEXT_PUBLIC_GOOGLE_CLIENT_ID</font> is configured.",
        "Issue detail page expands the main thread into a richer discussion view with comments and consensus context.",
        "Sidebar UI exposes a lightweight Bridge Status concept with reputation, reliability, and social-cluster labeling directly inside the feed.",
        "Issue and auth updates are persisted in browser storage so feed changes survive refresh without a server roundtrip.",
    ]

    architecture = [
        "<b>Framework:</b> Next.js App Router with React and TypeScript; Tailwind CSS powers styling and the repo includes shadcn-style UI primitives under <font face='Courier'>src/components/ui</font>.",
        "<b>Entry points:</b> <font face='Courier'>src/app/page.tsx</font> for the consensus feed, <font face='Courier'>src/app/submit/page.tsx</font> for thread creation, and <font face='Courier'>src/app/issues/[id]/page.tsx</font> for per-issue detail.",
        "<b>Auth flow:</b> <font face='Courier'>src/lib/auth.ts</font> stores accounts and the active session in localStorage and emits browser events consumed by <font face='Courier'>src/components/auth/AuthModal.tsx</font>.",
        "<b>Issue flow:</b> <font face='Courier'>src/lib/issues.ts</font> seeds initial issue threads, persists mutations in localStorage, and emits <font face='Courier'>ISSUES_EVENT</font> so the feed updates reactively.",
        "<b>Data model:</b> <font face='Courier'>IssuePost</font>, <font face='Courier'>IssueComment</font>, social clusters, and counter-perspectives live in <font face='Courier'>src/types/issue.ts</font>.",
        "<b>Storage model:</b> the current product is intentionally browser-local; no active backend integration is required for the app to run.",
    ]

    getting_started = [
        "Run <font face='Courier'>npm install</font>.",
        "Start development with <font face='Courier'>npm run dev</font>.",
        "Open <font face='Courier'>http://localhost:3000</font>.",
        "Use the home feed to browse consensus-ranked issues and <font face='Courier'>/submit</font> to create a new thread after signing in.",
        "Optional production check: <font face='Courier'>npx next build --webpack</font> or <font face='Courier'>npm run build</font>, then <font face='Courier'>npm start</font>.",
    ]

    story = [
        Paragraph("Bridge Protocol App Summary", styles["title"]),
        Paragraph(
            "One-page repo-backed overview generated from the current codebase and README. Missing details are marked explicitly.",
            styles["subtitle"],
        ),
    ]

    left_column = [
        Paragraph("What It Is", styles["section"]),
        Paragraph(what_it_is, styles["body"]),
        Spacer(1, 4),
        Paragraph("Who It's For", styles["section"]),
        Paragraph(who_its_for, styles["body"]),
        Spacer(1, 4),
        Paragraph("What It Does", styles["section"]),
        *bullets(features, styles["bullet"]),
    ]

    right_column = [
        Paragraph("How It Works", styles["section"]),
        *bullets(architecture, styles["small"]),
        Spacer(1, 4),
        Paragraph("How To Run", styles["section"]),
        *bullets(getting_started, styles["bullet"]),
    ]

    table = Table(
        [[left_column, right_column]],
        colWidths=[3.45 * inch, 3.45 * inch],
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#cbd5e1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#e2e8f0")),
            ]
        )
    )

    story.append(table)

    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=letter,
        leftMargin=0.55 * inch,
        rightMargin=0.55 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.45 * inch,
        title="Bridge Protocol App Summary",
        author="Codex",
    )
    doc.build(story)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
