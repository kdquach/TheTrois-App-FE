#!/usr/bin/env python3
# save as make_code_index.py and run: python make_code_index.py

import os
from pathlib import Path
import re

ROOT = Path('.')
OUT = ROOT / "CODE_INDEX.md"
EXT_WHITELIST = {'.js', '.ts', '.py', '.java', '.jsp', '.jsx', '.tsx', '.go', '.rb', '.php', '.html', '.css', '.scss'}

def header_snippet(path):
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = []
            for _ in range(30):
                l = f.readline()
                if not l:
                    break
                lines.append(l.rstrip())
            text = "\n".join(lines)
            # Try capture leading block comment or first non-empty lines
            m = re.search(r'(/\*.*?\*/)|(^\s*#.*?$)|(^\s*//.*?$)', text, re.DOTALL | re.MULTILINE)
            if m:
                return m.group(0).strip().replace('\n', ' ')[:400]
            # fallback: first non-empty 2 lines
            nonempty = [ln.strip() for ln in lines if ln.strip()]
            return (" | ".join(nonempty[:3]))[:400]
    except Exception as e:
        return ""

items = []
for p in ROOT.rglob('*'):
    if p.is_file() and p.suffix.lower() in EXT_WHITELIST and 'node_modules' not in p.parts and '.git' not in p.parts:
        snippet = header_snippet(p)
        items.append((str(p.relative_to(ROOT)), snippet))

items.sort()
with open(OUT, 'w', encoding='utf-8') as out:
    out.write("# CODE_INDEX\n\n")
    out.write("Generated index of code files with header snippets. Use this to give AI quick context.\n\n")
    for path, snip in items:
        out.write(f"## {path}\n\n")
        out.write(f"{snip}\n\n")
print(f"Wrote {len(items)} entries to {OUT}")
