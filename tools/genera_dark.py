#!/usr/bin/env python3
"""Genera assets/dark.css dai CSS del Workspace.

Per ogni regola con colori scritti a mano crea la stessa regola sotto
html[data-theme="dark"], con i colori convertiti in versione scura
(chiari <-> scuri, tinta mantenuta, colori accesi schiariti per la leggibilità).

Uso:  python3 tools/genera_dark.py      (richiede: pip install tinycss2)
Da rilanciare quando cambiano i CSS del Workspace.
"""
import colorsys
import re
import sys
from pathlib import Path

import tinycss2

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ['assets/workspace.css', 'assets/archea-update-0142.css', 'assets/archea-update-0143.css',
           'assets/planning-suite.css', 'assets/platform.css']
OUT = ROOT / 'assets/dark.css'
DARK = 'html[data-theme="dark"]'
SKIP_PROPS = {'box-shadow', 'text-shadow', 'filter', 'backdrop-filter', '-webkit-backdrop-filter', 'mask', '-webkit-mask'}
NAMED = {'white': (255, 255, 255), 'black': (0, 0, 0), '#fff': (255, 255, 255), '#000': (0, 0, 0)}
# Parti già scure nel tema chiaro (barra laterale): restano come sono
KEEP_SELECTORS = ('.desk-sidebar', '.desk-side-bottom', '.desk-user', '.desk-nav-highlight', '.desk-settings-button', '.desk-developer-button')
FIXED = {'--desk-dark': '#111311'}
COLOR_RE = re.compile(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b|\bblack\b')


def parse(tok):
    t = tok.lower()
    if t in NAMED:
        return (*NAMED[t], 1.0)
    if t.startswith('#'):
        h = t[1:]
        if len(h) in (3, 4):
            h = ''.join(c * 2 for c in h)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return r, g, b, a
    nums = re.findall(r'[-\d.]+%?', t)
    vals = []
    for i, n in enumerate(nums[:4]):
        if n.endswith('%'):
            v = float(n[:-1]) / 100
            vals.append(v * 255 if i < 3 else v)
        else:
            vals.append(float(n))
    if len(vals) < 3:
        return None
    return vals[0], vals[1], vals[2], (vals[3] if len(vals) > 3 else 1.0)


def to_dark(r, g, b, kind='bg'):
    """kind='text' per colori di testo (color, --ink…), 'bg' per sfondi e bordi."""
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    neutral = s < 0.28 or l > 0.93 or l < 0.06
    if kind == 'text':
        if neutral and l > 0.85:
            l2, s2 = 0.10, min(s, 0.10)                      # testo bianco su fondo scuro -> fondo chiaro, testo scuro
        elif neutral:
            l2, s2 = 0.95 - l * 0.62, min(s, 0.10)          # testo: sempre chiaro e leggibile
        else:
            l2, s2 = max(0.66, min(0.82, 1.05 - l)), min(1, s * 0.85)
    elif neutral:
        if l >= 0.5:
            l2, s2 = 0.085 + (1 - l) * 0.9, min(s, 0.10)    # sfondi chiari -> scuri, bordi ben visibili
        else:
            l2, s2 = 0.93 - l * 0.7, min(s, 0.10)          # pulsanti scuri -> chiari
    elif l > 0.72:                                        # sfondi pastello (badge, avvisi)
        l2, s2 = 0.16 + (1 - l) * 0.45, s * 0.6
    elif l < 0.5:
        l2, s2 = min(0.72, l + 0.30), min(1, s * 0.9)
    else:
        l2, s2 = l, s
    rr, gg, bb = colorsys.hls_to_rgb(h, l2, s2)
    return round(rr * 255), round(gg * 255), round(bb * 255)


def map_value(text, kind='bg'):
    def rep(m):
        c = parse(m.group(0))
        if not c:
            return m.group(0)
        r, g, b, a = c
        r2, g2, b2 = to_dark(r, g, b, kind)
        if a >= 0.999:
            return '#%02x%02x%02x' % (r2, g2, b2)
        return 'rgba(%d, %d, %d, %s)' % (r2, g2, b2, ('%.3f' % a).rstrip('0').rstrip('.'))
    return COLOR_RE.sub(rep, text)


def dark_selector(sel):
    out = []
    for part in sel.split(','):
        p = part.strip()
        if not p:
            continue
        if p.startswith(':root'):
            out.append(DARK + p[5:])
        elif p == 'html' or p.startswith('html.') or p.startswith('html['):
            out.append(DARK + p[4:])
        elif p.startswith('html '):
            out.append(DARK + p[4:])
        else:
            out.append(f'{DARK} {p}')
    return ', '.join(out)


def split_selectors(prelude):
    # virgole fuori dalle parentesi
    depth, cur, parts = 0, '', []
    for ch in prelude:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur)
            cur = ''
        else:
            cur += ch
    parts.append(cur)
    return ','.join(parts)


def rules(nodes, indent=''):
    out = []
    for node in nodes:
        if node.type == 'qualified-rule':
            prelude = tinycss2.serialize(node.prelude).strip()
            if any(k in prelude for k in KEEP_SELECTORS):
                continue
            decls = tinycss2.parse_declaration_list(node.content, skip_whitespace=True, skip_comments=True)
            keep = []
            for d in decls:
                if d.type != 'declaration' or d.lower_name in SKIP_PROPS:
                    continue
                val = tinycss2.serialize(d.value).strip()
                if d.name in FIXED:
                    keep.append(f'{d.name}: {FIXED[d.name]}')
                    continue
                if 'url(' in val or not COLOR_RE.search(val):
                    continue
                name = d.lower_name
                kind = 'text' if (name in ('color', 'fill', '-webkit-text-fill-color', 'caret-color') or
                                  (name.startswith('--') and any(k in name for k in ('ink', 'text', 'muted', 'fg', 'color')))) else 'bg'
                new = map_value(val, kind)
                if new != val:
                    keep.append(f'{d.name}: {new}{" !important" if d.important else ""}')
            if keep:
                out.append(f'{indent}{dark_selector(split_selectors(prelude))} {{ {"; ".join(keep)} }}')
        elif node.type == 'at-rule' and node.lower_at_keyword in ('media', 'supports') and node.content:
            inner = rules(tinycss2.parse_rule_list(node.content, skip_whitespace=True, skip_comments=True), indent + '  ')
            if inner:
                out.append(f'{indent}@{node.at_keyword} {tinycss2.serialize(node.prelude).strip()} {{')
                out.extend(inner)
                out.append(f'{indent}}}')
    return out


def main():
    lines = ['/* GENERATO da tools/genera_dark.py: non modificare a mano. Ritocchi in assets/dark-extra.css */']
    total = 0
    for src in SOURCES:
        css = (ROOT / src).read_text(encoding='utf-8')
        sheet = tinycss2.parse_stylesheet(css, skip_whitespace=True, skip_comments=True)
        r = rules(sheet)
        total += sum(1 for x in r if '{' in x and not x.strip().startswith('@'))
        lines.append(f'\n/* ---- {src} ---- */')
        lines.extend(r)
    OUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'{OUT.relative_to(ROOT)}: {total} regole')




# ---------------------------------------------------------------------------
# Tema chiaro: testi grigi troppo tenui su fondo bianco -> scuriti fino a contrasto 5:1
# Esce in assets/contrast.css (stessa tinta, solo più scuri)
# ---------------------------------------------------------------------------
def _lum(r, g, b):
    def f(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def _darken_for_white(r, g, b, target=5.0):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    if l > 0.9:
        return None  # testo bianco: sta su fondi scuri, non si tocca
    for _ in range(60):
        rr, gg, bb = (round(x * 255) for x in colorsys.hls_to_rgb(h, l, s))
        if (1.05) / (_lum(rr, gg, bb) + 0.05) >= target:
            return rr, gg, bb
        l -= 0.01
    return rr, gg, bb


def _light_value(text):
    def rep(m):
        c = parse(m.group(0))
        if not c:
            return m.group(0)
        r, g, b, a = c
        if a < 0.999:
            return m.group(0)
        if (1.05) / (_lum(r, g, b) + 0.05) >= 5.0:
            return m.group(0)
        d = _darken_for_white(r, g, b)
        return m.group(0) if d is None else '#%02x%02x%02x' % d
    return COLOR_RE.sub(rep, text)


LIGHT = 'html:not([data-theme="dark"])'


def light_rules(nodes, indent=''):
    out = []
    for node in nodes:
        if node.type == 'qualified-rule':
            prelude = tinycss2.serialize(node.prelude).strip()
            if any(k in prelude for k in KEEP_SELECTORS):
                continue
            keep = []
            for d in tinycss2.parse_declaration_list(node.content, skip_whitespace=True, skip_comments=True):
                if d.type != 'declaration':
                    continue
                name = d.lower_name
                is_text = name == 'color' or (name.startswith('--') and any(k in name for k in ('ink', 'muted', 'text')))
                if not is_text:
                    continue
                val = tinycss2.serialize(d.value).strip()
                new = _light_value(val)
                if new != val:
                    keep.append(f'{d.name}: {new}{" !important" if d.important else ""}')
            if keep:
                sel = ', '.join(
                    (LIGHT + p.strip()[5:]) if p.strip().startswith(':root') else f'{LIGHT} {p.strip()}'
                    for p in split_selectors(prelude).split(',') if p.strip())
                out.append(f'{indent}{sel} {{ {"; ".join(keep)} }}')
        elif node.type == 'at-rule' and node.lower_at_keyword in ('media', 'supports') and node.content:
            inner = light_rules(tinycss2.parse_rule_list(node.content, skip_whitespace=True, skip_comments=True), indent + '  ')
            if inner:
                out.append(f'{indent}@{node.at_keyword} {tinycss2.serialize(node.prelude).strip()} {{')
                out.extend(inner)
                out.append(f'{indent}}}')
    return out


def main_light():
    lines = ['/* GENERATO da tools/genera_dark.py: testi del tema chiaro scuriti per il contrasto (min 5:1 su bianco). */']
    for src in SOURCES:
        css = (ROOT / src).read_text(encoding='utf-8')
        lines.extend(light_rules(tinycss2.parse_stylesheet(css, skip_whitespace=True, skip_comments=True)))
    lines.append(f'{LIGHT} .desk-sidebar nav button.on, {LIGHT} .desk-sidebar nav>button.on {{ color: #1d2320 !important; }}')
    (ROOT / 'assets/contrast.css').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print('assets/contrast.css:', len(lines) - 1, 'regole')


if __name__ == '__main__':
    main()
    main_light()
