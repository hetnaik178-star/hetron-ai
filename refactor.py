"""
╔══════════════════════════════════════════════════════════════╗
║   HETRON AI — Refactor Script                                ║
║   Splits monolithic index.html into:                         ║
║     • index.html  (clean HTML structure)                     ║
║     • style.css   (all CSS extracted)                        ║
║     • script.js   (all JS extracted)                         ║
╚══════════════════════════════════════════════════════════════╝
"""

import re
import os
import sys
import shutil
from pathlib import Path

# Force UTF-8 output on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = Path(__file__).parent
HTML_FILE  = BASE / "index.html"
CSS_FILE   = BASE / "style.css"
JS_FILE    = BASE / "script.js"
BACKUP_DIR = BASE / "_backup"

# ── 1. Backup originals ────────────────────────────────────────
def backup():
    BACKUP_DIR.mkdir(exist_ok=True)
    for f in [HTML_FILE, CSS_FILE, JS_FILE]:
        if f.exists():
            shutil.copy2(f, BACKUP_DIR / f.name)
    print("✅ Backup created in _backup/")

# ── 2. Read raw HTML ───────────────────────────────────────────
def read_html():
    return HTML_FILE.read_text(encoding="utf-8", errors="replace")

# ── 3. Extract all <style>…</style> blocks ─────────────────────
def extract_styles(html: str):
    blocks = re.findall(r'<style[^>]*>(.*?)</style>', html, re.DOTALL | re.IGNORECASE)
    combined_css = "\n\n".join(b.strip() for b in blocks)
    # Remove all style blocks from html
    clean = re.sub(r'\s*<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
    return clean, combined_css

# ── 4. Extract all <script>…</script> blocks ───────────────────
def extract_scripts(html: str):
    # Only inline scripts (no src attribute)
    blocks = re.findall(r'<script(?![^>]*\bsrc\b)[^>]*>(.*?)</script>', html, re.DOTALL | re.IGNORECASE)
    combined_js = "\n\n".join(b.strip() for b in blocks)
    # Remove inline script blocks only
    clean = re.sub(r'\s*<script(?![^>]*\bsrc\b)[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    return clean, combined_js

# ── 5. Inject link/script tags into <head> ────────────────────
def inject_refs(html: str) -> str:
    link_tag   = '    <link rel="stylesheet" href="style.css" />'
    script_tag = '    <script src="script.js" defer></script>'

    # Insert CSS link after last existing <link> in head, or before </head>
    if link_tag not in html:
        html = html.replace('</head>', f'{link_tag}\n</head>', 1)

    # Insert script before </body>
    if script_tag not in html:
        html = html.replace('</body>', f'{script_tag}\n</body>', 1)

    return html

# ── 6. Clean up duplicate blank lines ─────────────────────────
def clean_blanks(text: str) -> str:
    return re.sub(r'\n{3,}', '\n\n', text)

# ── 7. Write files ────────────────────────────────────────────
def write_files(html: str, css: str, js: str):
    HTML_FILE.write_text(html, encoding="utf-8")
    print(f"✅ index.html  written  ({len(html):,} bytes)")

    CSS_FILE.write_text(css, encoding="utf-8")
    print(f"✅ style.css   written  ({len(css):,} bytes)")

    JS_FILE.write_text(js, encoding="utf-8")
    print(f"✅ script.js   written  ({len(js):,} bytes)")

# ── Main ──────────────────────────────────────────────────────
def main():
    print("\n" + "=" * 55)
    print("  HETRON AI --- Refactor: index.html -> CSS + JS")
    print("=" * 55)

    backup()
    raw = read_html()
    print(f"\n[READ] index.html  ({len(raw):,} bytes, {raw.count(chr(10))+1} lines)")

    html, css = extract_styles(raw)
    print(f"[CSS]  extracted: {len(css):,} chars across {css.count(chr(10))+1} lines")

    html, js = extract_scripts(html)
    print(f"[JS]   extracted: {len(js):,} chars across {js.count(chr(10))+1} lines")

    html = inject_refs(html)
    html = clean_blanks(html)

    write_files(html, css, js)

    print("\n" + "=" * 55)
    print("  DONE -- Project is now cleanly modularized!")
    print("=" * 55 + "\n")

if __name__ == "__main__":
    main()
