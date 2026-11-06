#!/usr/bin/env python3
"""Genera assets/sizes.css: i testi minuscoli del Workspace (7-12 px) diventano leggibili.
Mappa: 7-8 -> 11, 9 -> 11.5, 10 -> 12, 11 -> 12.5, 12 -> 13 (px). Rilanciare se cambiano i CSS."""
import re
from pathlib import Path
import tinycss2

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ['assets/workspace.css', 'assets/archea-update-0142.css', 'assets/archea-update-0143.css', 'assets/planning-suite.css']
PX = re.compile(r'(\d+(?:\.\d+)?)px')


def bump(px):
    if px < 6.5 or px > 12.4:
        return None
    return {7: 11, 8: 11, 9: 11.5, 10: 12, 11: 12.5, 12: 13}.get(round(px), 11)


def fix(val):
    def rep(m):
        n = bump(float(m.group(1)))
        return m.group(0) if n is None else f'{n:g}px'
    return PX.sub(rep, val)


def rules(nodes, indent=''):
    out = []
    for node in nodes:
        if node.type == 'qualified-rule':
            keep = []
            for d in tinycss2.parse_declaration_list(node.content, skip_whitespace=True, skip_comments=True):
                if d.type != 'declaration' or d.lower_name not in ('font-size', 'font'):
                    continue
                val = tinycss2.serialize(d.value).strip()
                if d.lower_name == 'font':  # solo la dimensione dentro "font: 700 9px/1.2 ..."
                    m = re.search(r'(\d+(?:\.\d+)?)px', val)
                    if not m or bump(float(m.group(1))) is None:
                        continue
                    keep.append(f'font-size: {bump(float(m.group(1))):g}px{" !important" if d.important else ""}')
                    continue
                new = fix(val)
                if new != val:
                    keep.append(f'font-size: {new}{" !important" if d.important else ""}')
            if keep:
                sel = tinycss2.serialize(node.prelude).strip()
                parts, depth, cur = [], 0, ''
                for ch in sel:
                    depth += ch in '([' ; depth -= ch in ')]'
                    if ch == ',' and depth == 0:
                        parts.append(cur); cur = ''
                    else:
                        cur += ch
                parts.append(cur)
                sel = ', '.join('html ' + x.strip() for x in parts if x.strip())
                out.append(f'{indent}{sel} {{ {"; ".join(keep)} }}')
        elif node.type == 'at-rule' and node.lower_at_keyword in ('media', 'supports') and node.content:
            inner = rules(tinycss2.parse_rule_list(node.content, skip_whitespace=True, skip_comments=True), indent + '  ')
            if inner:
                out += [f'{indent}@{node.at_keyword} {tinycss2.serialize(node.prelude).strip()} {{', *inner, f'{indent}}}']
    return out


lines = ['/* GENERATO da tools/genera_sizes.py: testi minuscoli resi leggibili (min ~11px). */']
for src in SOURCES:
    lines += rules(tinycss2.parse_stylesheet((ROOT / src).read_text(encoding='utf-8'), skip_whitespace=True, skip_comments=True))
(ROOT / 'assets/sizes.css').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('assets/sizes.css:', len(lines) - 1, 'regole')
