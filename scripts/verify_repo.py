from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
required = [
    ROOT / "README.md",
    ROOT / "ABOUT.md",
    ROOT / "docs" / "ARCHITECTURE.md",
    ROOT / "index.html",
    ROOT / "css" / "styles.css",
]
missing = [str(p.relative_to(ROOT)) for p in required if not p.exists()]
if missing:
    raise SystemExit("Missing required files: " + ", ".join(missing))

site_text = "\n".join(
    p.read_text(encoding="utf-8", errors="ignore")
    for p in [ROOT / "index.html", ROOT / "css" / "styles.css"]
)
if "LabelFit" not in site_text:
    raise SystemExit("LabelFit identity missing from site shell")
if "Upend" in site_text:
    raise SystemExit("Legacy Upend name found in site shell")

print("LabelFit repository verification: PASS")
