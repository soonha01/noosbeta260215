from pathlib import Path
from xml.sax.saxutils import escape


OUT = Path(__file__).resolve().parent


W, H = 1600, 1100


COLORS = {
    "bg": "#f4f1ea",
    "paper": "#fbfaf6",
    "ink": "#262626",
    "muted": "#66645e",
    "line": "#2d2d2a",
    "dim": "#7c776c",
    "shell": "#eee8dc",
    "base": "#2b2d2f",
    "metal": "#c8aa70",
    "diffuser": "#d9f3f0",
    "diffuser_warm": "#f6d9a7",
    "pcb": "#182923",
    "pcb2": "#20413a",
    "copper": "#c78a3a",
    "blue": "#3575b8",
    "green": "#2e9c68",
    "red": "#cf4b3c",
    "orange": "#d08322",
    "purple": "#8756b9",
    "ground": "#1f1f1f",
    "rail": "#b54436",
}


def attrs(**kw):
    out = []
    for k, v in kw.items():
        if v is None:
            continue
        k = k.replace("_", "-")
        out.append(f'{k}="{escape(str(v))}"')
    return " ".join(out)


def tag(name, content="", **kw):
    return f"<{name} {attrs(**kw)}>{content}</{name}>"


def line(x1, y1, x2, y2, stroke=None, sw=1.4, dash=None, marker=None, opacity=None):
    return f'<line {attrs(x1=x1, y1=y1, x2=x2, y2=y2, stroke=stroke or COLORS["line"], stroke_width=sw, stroke_dasharray=dash, marker_end=marker, opacity=opacity)} />'


def rect(x, y, w, h, fill="none", stroke=None, sw=1.4, rx=0, dash=None, opacity=None):
    return f'<rect {attrs(x=x, y=y, width=w, height=h, fill=fill, stroke=stroke, stroke_width=sw, rx=rx, ry=rx, stroke_dasharray=dash, opacity=opacity)} />'


def circle(cx, cy, r, fill="none", stroke=None, sw=1.4, opacity=None):
    return f'<circle {attrs(cx=cx, cy=cy, r=r, fill=fill, stroke=stroke, stroke_width=sw, opacity=opacity)} />'


def ellipse(cx, cy, rx, ry, fill="none", stroke=None, sw=1.4, opacity=None):
    return f'<ellipse {attrs(cx=cx, cy=cy, rx=rx, ry=ry, fill=fill, stroke=stroke, stroke_width=sw, opacity=opacity)} />'


def path(d, fill="none", stroke=None, sw=1.4, dash=None, opacity=None, marker=None):
    return f'<path {attrs(d=d, fill=fill, stroke=stroke or COLORS["line"], stroke_width=sw, stroke_dasharray=dash, opacity=opacity, marker_end=marker, stroke_linecap="round", stroke_linejoin="round")} />'


def text(s, x, y, size=16, weight=400, fill=None, anchor="start", opacity=None):
    return tag(
        "text",
        escape(s),
        x=x,
        y=y,
        fill=fill or COLORS["ink"],
        font_size=size,
        font_weight=weight,
        font_family="Inter, Pretendard, Apple SD Gothic Neo, Arial, sans-serif",
        text_anchor=anchor,
        opacity=opacity,
    )


def small(s, x, y, anchor="start", fill=None):
    return text(s, x, y, 12, 500, fill or COLORS["muted"], anchor)


def label(s, x, y, anchor="start"):
    return text(s, x, y, 14, 650, COLORS["ink"], anchor)


def note(s, x, y, width=480, size=12):
    # Simple manual wrap for Korean/English mixed notes.
    words = s.split(" ")
    lines = []
    cur = ""
    max_chars = max(28, int(width / (size * 0.62)))
    for word in words:
        nxt = (cur + " " + word).strip()
        if len(nxt) > max_chars and cur:
            lines.append(cur)
            cur = word
        else:
            cur = nxt
    if cur:
        lines.append(cur)
    return "".join(text(line_, x, y + i * (size + 4), size, 450, COLORS["muted"]) for i, line_ in enumerate(lines))


def dim_line(x1, y1, x2, y2, label_text, tx=None, ty=None):
    tx = (x1 + x2) / 2 if tx is None else tx
    ty = (y1 + y2) / 2 - 8 if ty is None else ty
    return (
        line(x1, y1, x2, y2, COLORS["dim"], 1.2, marker="url(#arrowBoth)")
        + text(label_text, tx, ty, 12, 650, COLORS["dim"], "middle")
    )


def callout(s, x1, y1, x2, y2, align="start"):
    return line(x1, y1, x2, y2, COLORS["dim"], 1.1, marker="url(#arrow)") + small(s, x2 + (8 if align == "start" else -8), y2 - 5, align)


def grid(step=40):
    g = []
    for x in range(0, W + 1, step):
        g.append(line(x, 0, x, H, "#ded9cf", 0.6, opacity=0.55))
    for y in range(0, H + 1, step):
        g.append(line(0, y, W, y, "#ded9cf", 0.6, opacity=0.55))
    return "".join(g)


DEFS = f"""
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{COLORS['dim']}" />
  </marker>
  <marker id="arrowBoth" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{COLORS['dim']}" />
  </marker>
  <linearGradient id="crescentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="{COLORS['diffuser']}" stop-opacity="0.92"/>
    <stop offset="52%" stop-color="#eef5ef" stop-opacity="0.96"/>
    <stop offset="100%" stop-color="{COLORS['diffuser_warm']}" stop-opacity="0.94"/>
  </linearGradient>
  <filter id="softShadow" x="-20%" y="-20%" width="140%" height="160%">
    <feDropShadow dx="0" dy="9" stdDeviation="10" flood-color="#1b1b1b" flood-opacity="0.13"/>
  </filter>
  <style>
    .dash {{ stroke-dasharray: 7 6; }}
    .port {{ fill: #151515; stroke: #555; stroke-width: 1; }}
  </style>
</defs>
"""


def svg_start(title):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<title>{escape(title)}</title>
{DEFS}
<rect width="{W}" height="{H}" fill="{COLORS['bg']}"/>
{grid()}
<rect x="36" y="34" width="{W-72}" height="{H-68}" rx="22" fill="{COLORS['paper']}" stroke="#ddd5c9" stroke-width="1.2"/>
'''


def svg_end():
    return "</svg>\n"


def screw(x, y):
    return circle(x, y, 7, "#f8f7f2", "#6c6a64", 1.1) + line(x - 4, y, x + 4, y, "#6c6a64", 1.0) + line(x, y - 4, x, y + 4, "#6c6a64", 1.0)


def draw_perforations(x, y, cols, rows, gap=9, r=1.9):
    out = []
    for j in range(rows):
        for i in range(cols):
            out.append(circle(x + i * gap, y + j * gap, r, COLORS["base"], None, opacity=0.78))
    return "".join(out)


def mechanical_blueprint():
    s = [svg_start("NOOS hardware mechanical blueprint v1")]
    s.append(text("NOOS AI MODULE / 기구 설계도 v1", 70, 82, 28, 760))
    s.append(text("Jetson Nano + ESP32 기반 실제 제작 1차 패키징 기준", 70, 108, 14, 520, COLORS["muted"]))
    s.append(text("단위: mm  |  외형 기준: 180 W x 130 D x 55 H  |  Shell 2.5t / Base 3.0t", 1020, 86, 13, 650, COLORS["muted"]))

    # Top view
    x, y, sc = 80, 145, 2.2
    bw, bd = 180 * sc, 130 * sc
    s.append(label("TOP VIEW / 내부 레이아웃", x, y - 18))
    s.append(rect(x, y, bw, bd, fill=COLORS["shell"], stroke="#9c978d", sw=1.6, rx=55, opacity=0.98))
    s.append(path(f"M {x+42} {y+bd-34} C {x+110} {y+bd+2}, {x+bw-118} {y+bd+2}, {x+bw-42} {y+bd-34}",
                  fill="none", stroke="url(#crescentGrad)", sw=22, opacity=0.96))
    s.append(path(f"M {x+54} {y+bd-37} C {x+116} {y+bd-10}, {x+bw-124} {y+bd-10}, {x+bw-54} {y+bd-37}",
                  fill="none", stroke="#9acdc7", sw=1.3, dash="4 4", opacity=0.9))

    # Jetson, ESP32, fan, speaker, power boards in top view
    jet_x, jet_y, jet_w, jet_h = x + 58 * sc, y + 31 * sc, 100 * sc, 80 * sc
    s.append(rect(jet_x, jet_y, jet_w, jet_h, fill=COLORS["pcb"], stroke="#2f765f", sw=1.5, rx=6))
    s.append(text("Jetson Nano", jet_x + jet_w / 2, jet_y + 126, 15, 760, "#f5f2df", "middle"))
    s.append(small("100 x 80 board", jet_x + jet_w / 2, jet_y + 146, "middle", "#c8dfd1"))
    # Ports at rear
    for i, pw in enumerate([30, 32, 22, 22]):
        s.append(rect(jet_x + 18 + i * 44, jet_y + 4, pw, 12, fill="#111", stroke="#778", sw=0.8, rx=2))
    # mounting slots
    for px, py in [(jet_x + 16, jet_y + 16), (jet_x + jet_w - 16, jet_y + 16), (jet_x + 16, jet_y + jet_h - 16), (jet_x + jet_w - 16, jet_y + jet_h - 16)]:
        s.append(rect(px - 10, py - 4, 20, 8, fill="none", stroke="#b7ccb9", sw=1.2, rx=4))

    fan_x, fan_y = jet_x + 76, jet_y + 35
    s.append(rect(fan_x, fan_y, 64, 64, fill="#33383a", stroke="#777", rx=10))
    s.append(circle(fan_x + 32, fan_y + 32, 23, fill="#202326", stroke="#888", sw=1.2))
    s.append(path(f"M {fan_x+32} {fan_y+11} C {fan_x+53} {fan_y+25}, {fan_x+50} {fan_y+48}, {fan_x+31} {fan_y+54}", stroke="#8a8d8e", sw=1.2))
    s.append(path(f"M {fan_x+11} {fan_y+32} C {fan_x+25} {fan_y+11}, {fan_x+48} {fan_y+14}, {fan_x+54} {fan_y+33}", stroke="#8a8d8e", sw=1.2))
    s.append(small("blower + heat sink", fan_x + 32, fan_y - 8, "middle"))

    esp_x, esp_y, esp_w, esp_h = x + 20 * sc, y + 68 * sc, 55 * sc, 28 * sc
    s.append(rect(esp_x, esp_y, esp_w, esp_h, fill=COLORS["pcb2"], stroke="#56a88e", sw=1.4, rx=5))
    s.append(text("ESP32", esp_x + esp_w / 2, esp_y + 30, 14, 760, "#f3f0d8", "middle"))
    s.append(rect(esp_x - 9, esp_y - 16, esp_w + 28, esp_h + 33, fill="none", stroke="#2e9c68", sw=1.2, dash="5 4", rx=9, opacity=0.85))
    s.append(small("antenna keep-out", esp_x + 35, esp_y - 21))

    sp_x, sp_y = x + bw - 48, y + bd / 2 - 34
    s.append(rect(sp_x, sp_y, 24, 68, fill="#17191a", stroke="#6c6c6c", sw=1.0, rx=10))
    s.append(draw_perforations(sp_x + 7, sp_y + 13, 2, 6, 8, 1.6))

    p_x, p_y = x + bw - 104, y + 18
    s.append(rect(p_x, p_y, 73, 32, fill="#222", stroke="#888", sw=1.0, rx=5))
    s.append(small("rear service bay", p_x + 36, p_y - 7, "middle"))

    # Airflow in top view
    s.append(path(f"M {x+bw-15} {y+63} C {x+bw+28} {y+66}, {x+bw+26} {y+114}, {x+bw-12} {y+119}", stroke=COLORS["blue"], sw=2.0, marker="url(#arrow)", opacity=0.9))
    s.append(small("exhaust path", x + bw - 74, y + 96))

    s.append(dim_line(x, y + bd + 42, x + bw, y + bd + 42, "180"))
    s.append(dim_line(x - 28, y, x - 28, y + bd, "130", tx=x - 42, ty=y + bd / 2 + 4))
    s.append(callout("RGBW diffuser", x + 180, y + bd - 32, x + 258, y + bd + 24))
    s.append(callout("RF keep-out", esp_x + 58, esp_y, x + 58, y + 250))

    # Front view
    fx, fy, fsc = 555, 158, 2.35
    fw, fh = 180 * fsc, 55 * fsc
    s.append(label("FRONT VIEW", fx, fy - 20))
    s.append(rect(fx, fy, fw, fh, fill=COLORS["shell"], stroke="#989287", sw=1.4, rx=48))
    s.append(rect(fx + 18, fy + fh - 46, fw - 36, 26, fill="url(#crescentGrad)", stroke="#9cc7bd", sw=1.0, rx=14))
    s.append(rect(fx, fy + fh - 21, fw, 21, fill=COLORS["base"], stroke="#1b1b1b", sw=1.0, rx=20))
    s.append(rect(fx + 18, fy + fh - 8, 42, 6, fill="#181818", rx=3))
    s.append(rect(fx + fw - 60, fy + fh - 8, 42, 6, fill="#181818", rx=3))
    s.append(dim_line(fx, fy + fh + 38, fx + fw, fy + fh + 38, "180"))
    s.append(dim_line(fx - 25, fy, fx - 25, fy + fh, "55", tx=fx - 38, ty=fy + fh / 2 + 4))
    s.append(callout("2.5t upper shell", fx + 78, fy + 14, fx + 190, fy - 22))
    s.append(callout("10-12mm LED mixing gap", fx + 250, fy + fh - 34, fx + 335, fy + fh + 4))

    # Side view
    sx, sy, ssc = 560, 382, 2.35
    sw, sh = 130 * ssc, 55 * ssc
    s.append(label("SIDE VIEW / airflow + speaker", sx, sy - 20))
    s.append(rect(sx, sy, sw, sh, fill=COLORS["shell"], stroke="#989287", sw=1.4, rx=44))
    s.append(rect(sx, sy + sh - 21, sw, 21, fill=COLORS["base"], stroke="#1b1b1b", sw=1.0, rx=18))
    s.append(rect(sx + 182, sy + 41, 62, 48, fill="#111", stroke="#555", sw=1.0, rx=18))
    s.append(draw_perforations(sx + 196, sy + 54, 4, 3, 10, 2))
    for i in range(7):
        s.append(rect(sx + 30 + i * 28, sy + sh - 9, 16, 4, fill="#111", rx=2))
    s.append(path(f"M {sx+38} {sy+sh+26} C {sx+122} {sy+sh+26}, {sx+190} {sy+sh+24}, {sx+256} {sy+sh-6}", stroke=COLORS["blue"], sw=2, marker="url(#arrow)"))
    s.append(callout("underside intake slot", sx + 114, sy + sh - 7, sx + 74, sy + sh + 55))
    s.append(callout("side speaker grille", sx + 216, sy + 64, sx + 322, sy + 45))

    # Rear view
    rx, ry, rsc = 1032, 158, 2.35
    rw, rh = 180 * rsc, 55 * rsc
    s.append(label("REAR VIEW / service bay", rx, ry - 20))
    s.append(rect(rx, ry, rw, rh, fill=COLORS["shell"], stroke="#989287", sw=1.4, rx=44))
    s.append(rect(rx, ry + rh - 21, rw, 21, fill=COLORS["base"], stroke="#1b1b1b", sw=1.0, rx=18))
    s.append(rect(rx + 85, ry + 34, 250, 56, fill="#1a1a1a", stroke="#555", sw=1.0, rx=8))
    s.append(rect(rx + 104, ry + 56, 34, 16, fill="#0c0c0c", stroke="#777", sw=0.8, rx=4))
    s.append(rect(rx + 154, ry + 51, 50, 26, fill="#0c0c0c", stroke="#777", sw=0.8, rx=4))
    s.append(rect(rx + 220, ry + 51, 74, 26, fill="#0c0c0c", stroke="#777", sw=0.8, rx=4))
    s.append(small("USB-C PD", rx + 121, ry + 112, "middle"))
    s.append(small("Jetson ports behind cover", rx + 238, ry + 112, "middle"))
    s.append(rect(rx + rw - 78, ry + 50, 44, 18, fill="none", stroke="#9f8b66", sw=1.0, rx=3))
    s.append(small("NOOS", rx + rw - 56, ry + 46, "middle", "#84785f"))

    # Cross-section
    cx, cy = 1035, 395
    s.append(label("SECTION A-A / thermal stack", cx, cy - 20))
    s.append(rect(cx, cy, 420, 150, fill="none", stroke="#aaa297", sw=1.3, rx=44))
    s.append(path(f"M {cx+12} {cy+72} C {cx+95} {cy+18}, {cx+310} {cy+16}, {cx+408} {cy+72}", fill=COLORS["shell"], stroke="#9a9489", sw=1.1))
    s.append(rect(cx + 20, cy + 111, 380, 28, fill=COLORS["base"], stroke="#1d1d1d", sw=1.0, rx=14))
    s.append(rect(cx + 70, cy + 93, 240, 8, fill=COLORS["pcb"], stroke="#2f765f", sw=1.0, rx=3))
    s.append(rect(cx + 135, cy + 52, 96, 39, fill="#383d3f", stroke="#777", sw=1.0, rx=6))
    s.append(rect(cx + 132, cy + 42, 102, 11, fill="#565b5d", stroke="#888", sw=0.8, rx=3))
    s.append(rect(cx + 252, cy + 64, 54, 28, fill="#222", stroke="#666", sw=1.0, rx=6))
    s.append(path(f"M {cx+291} {cy+82} C {cx+350} {cy+78}, {cx+374} {cy+78}, {cx+400} {cy+61}", stroke=COLORS["blue"], sw=2, marker="url(#arrow)"))
    s.append(path(f"M {cx+78} {cy+136} C {cx+116} {cy+117}, {cx+144} {cy+111}, {cx+170} {cy+99}", stroke=COLORS["blue"], sw=2, marker="url(#arrow)"))
    s.append(small("air intake", cx + 74, cy + 158, "middle"))
    s.append(small("fan duct / exhaust", cx + 390, cy + 57, "middle"))
    s.append(callout("Jetson + heat spreader", cx + 185, cy + 48, cx + 158, cy - 22))
    s.append(callout("speaker chamber", cx + 282, cy + 78, cx + 408, cy + 112))

    # Exploded stack
    ex, ey = 95, 610
    s.append(label("EXPLODED ASSEMBLY / 실제 조립 순서", ex, ey - 24))
    s.append(rect(ex + 15, ey + 4, 435, 55, fill=COLORS["shell"], stroke="#928b80", sw=1.2, rx=35))
    s.append(small("01 upper shell: 2.5t mineral composite / SLA or CNC prototype", ex + 464, ey + 35))
    s.append(rect(ex + 47, ey + 94, 372, 28, fill="url(#crescentGrad)", stroke="#91c8bf", sw=1.0, rx=14))
    s.append(small("02 frosted acrylic crescent diffuser + LED PCB", ex + 464, ey + 114))
    s.append(rect(ex + 34, ey + 158, 398, 48, fill="#2e3032", stroke="#111", sw=1.0, rx=12))
    s.append(small("03 graphite internal chassis tray / heat spreader contact", ex + 464, ey + 186))
    s.append(rect(ex + 95, ey + 247, 245, 126, fill=COLORS["pcb"], stroke="#2f765f", sw=1.2, rx=8))
    s.append(text("Jetson Nano", ex + 218, ey + 318, 16, 760, "#f4f1d7", "middle"))
    s.append(rect(ex + 118, ey + 224, 130, 34, fill="#3b4042", stroke="#777", sw=1.0, rx=7))
    s.append(rect(ex + 252, ey + 224, 58, 58, fill="#222", stroke="#666", sw=1.0, rx=8))
    s.append(rect(ex + 12, ey + 286, 118, 58, fill=COLORS["pcb2"], stroke="#56a88e", sw=1.2, rx=6))
    s.append(small("04 Jetson Nano + blower + ESP32 daughterboard", ex + 464, ey + 306))
    s.append(rect(ex + 38, ey + 415, 392, 52, fill=COLORS["base"], stroke="#111", sw=1.0, rx=20))
    for i in range(7):
        s.append(rect(ex + 90 + i * 40, ey + 446, 22, 6, fill="#111", rx=3))
    s.append(small("05 bottom service tray: hidden screws, rubber feet, intake slots", ex + 464, ey + 448))
    for px, py in [(ex + 70, ey + 438), (ex + 400, ey + 438)]:
        s.append(screw(px, py))

    # Specification table
    tx, ty = 900, 655
    s.append(label("제작 기준 / 체크 항목", tx, ty - 20))
    s.append(rect(tx, ty, 570, 330, fill="#fffdf8", stroke="#ded5c8", sw=1.0, rx=12))
    rows = [
        ("외형", "180 x 130 x 55 mm, R35 이상 곡면, 바닥 고무발 6-8 mm"),
        ("Jetson Nano", "100 x 80 mm 보드 기준, 후면 포트 방향 정렬, 슬롯형 마운트"),
        ("열", "히트싱크+블로워 높이 22 mm 확보, 하부 흡기 / 후면 배기"),
        ("ESP32", "55 x 28 mm DevKitC급, 안테나 주변 금속/PCB ground keep-out"),
        ("전원", "USB-C PD 12V 입력, 5V 6A buck, Jetson/LED/Audio 공통 GND"),
        ("조명", "SK6812 RGBW 또는 동급, 디퓨저와 LED 간 10-12 mm mixing gap"),
        ("오디오", "USB audio DAC + class-D amp + 4Ω 3W oval speaker chamber"),
        ("조립", "하부 서비스 트레이, 숨은 나사 4EA, gasket line, 케이블 채널"),
        ("주의", "실제 보드 리비전/커넥터 높이는 출력 전 실측 반영"),
    ]
    for i, (k, v) in enumerate(rows):
        yy = ty + 35 + i * 31
        s.append(text(k, tx + 18, yy, 13, 760, COLORS["ink"]))
        s.append(text(v, tx + 110, yy, 12, 480, COLORS["muted"]))
        if i < len(rows) - 1:
            s.append(line(tx + 16, yy + 10, tx + 554, yy + 10, "#ebe3d8", 0.8))

    s.append(text("Assumptions: Jetson Nano Developer Kit class board 100x80, ESP32-DevKitC class board 55x28. Verify exact board revision before CNC/print.", 70, 1030, 12, 500, COLORS["muted"]))
    s.append(svg_end())
    return "".join(s)


def wire(x1, y1, x2, y2, color, sw=3.0, label_txt=None, label_pos=0.5, dash=None):
    d = f"M {x1} {y1} C {(x1+x2)/2} {y1}, {(x1+x2)/2} {y2}, {x2} {y2}"
    out = path(d, stroke=color, sw=sw, marker="url(#arrow)", dash=dash)
    if label_txt:
        lx = x1 + (x2 - x1) * label_pos
        ly = y1 + (y2 - y1) * label_pos - 10
        out += text(label_txt, lx, ly, 12, 700, color, "middle")
    return out


def poly(points, color, sw=2.5, label_txt=None, label_xy=None, dash=None, marker=False):
    d = "M " + " L ".join(f"{x} {y}" for x, y in points)
    out = path(d, stroke=color, sw=sw, dash=dash, marker="url(#arrow)" if marker else None)
    if label_txt and label_xy:
        out += text(label_txt, label_xy[0], label_xy[1], 12, 700, color, "middle")
    return out


def block(x, y, w, h, title, subtitle="", fill="#fffdf8", stroke="#8c877d"):
    out = rect(x, y, w, h, fill=fill, stroke=stroke, sw=1.3, rx=14)
    out += text(title, x + w / 2, y + 28, 16, 760, COLORS["ink"], "middle")
    if subtitle:
        out += text(subtitle, x + w / 2, y + 50, 11, 520, COLORS["muted"], "middle")
    return out


def pin_label(s, x, y, color=COLORS["muted"], anchor="start"):
    return text(s, x, y, 11, 650, color, anchor)


def wiring_blueprint():
    s = [svg_start("NOOS hardware wiring blueprint v1")]
    s.append(text("NOOS AI MODULE / 배선도 v1", 70, 82, 28, 760))
    s.append(text("Jetson Nano + ESP32 + RGBW diffuser + audio + cooling 실제 제작 기준", 70, 108, 14, 520, COLORS["muted"]))
    s.append(text("전원선은 굵게, 신호선은 색상별로 표시. 모든 GND는 공통 접지.", 1010, 86, 13, 650, COLORS["muted"]))

    # Power front-end
    s.append(label("POWER TREE", 80, 145))
    s.append(block(80, 170, 170, 82, "USB-C PD IN", "12V 3-5A trigger", "#fff8ef", "#c9a66e"))
    s.append(block(305, 170, 185, 82, "Protection", "fuse + TVS + switch", "#fff8ef", "#c9a66e"))
    s.append(block(545, 170, 185, 82, "5V Buck", "5V / 6A min.", "#fff8ef", "#c9a66e"))
    s.append(block(785, 170, 190, 82, "5V BUS", "star distribution", "#fff8ef", "#c9a66e"))
    s.append(poly([(250, 211), (305, 211)], COLORS["orange"], 4, "12V", (278, 202), marker=True))
    s.append(poly([(490, 211), (545, 211)], COLORS["orange"], 4, "12V", (518, 202), marker=True))
    s.append(poly([(730, 211), (785, 211)], COLORS["rail"], 4, "5V", (758, 202), marker=True))

    # Clean power and ground buses.
    s.append(line(92, 305, 1460, 305, COLORS["rail"], 4))
    s.append(text("REGULATED 5V BUS", 774, 294, 12, 760, COLORS["rail"], "middle"))
    s.append(line(92, 810, 1460, 810, COLORS["ground"], 4))
    s.append(text("COMMON GND BUS", 774, 803, 12, 760, COLORS["ground"], "middle"))
    s.append(poly([(880, 252), (880, 305)], COLORS["rail"], 3.2))

    # Main compute and MCU blocks.
    jx, jy = 95, 375
    s.append(block(jx, jy, 385, 220, "Jetson Nano", "AI runtime / audio playback / backend link", "#f4faf2", "#4d8068"))
    s.append(rect(jx + 50, jy + 76, 270, 98, fill=COLORS["pcb"], stroke="#2f765f", sw=1.2, rx=8))
    s.append(text("100 x 80 board", jx + 185, jy + 132, 13, 700, "#efe9cb", "middle"))
    s.append(pin_label("5V IN: barrel/header 중 1개만", jx + 22, jy + 66, COLORS["rail"]))
    s.append(pin_label("J41 pin 8 TXD", jx + 22, jy + 183, COLORS["blue"]))
    s.append(pin_label("J41 pin 10 RXD", jx + 22, jy + 199, COLORS["blue"]))
    s.append(pin_label("GND", jx + 324, jy + 199, COLORS["ground"]))

    ex, ey = 570, 385
    s.append(block(ex, ey, 315, 190, "ESP32 DevKitC", "BLE/Wi-Fi + LED/control MCU", "#f2fbf8", "#4a9a7e"))
    s.append(rect(ex + 66, ey + 66, 178, 60, fill=COLORS["pcb2"], stroke="#56a88e", sw=1.2, rx=8))
    s.append(text("ESP32", ex + 155, ey + 101, 16, 760, "#efe9cb", "middle"))
    s.append(rect(ex + 45, ey + 48, 225, 102, fill="none", stroke="#2e9c68", sw=1.1, dash="5 4", rx=8))
    s.append(pin_label("VIN 5V", ex + 22, ey + 166, COLORS["rail"]))
    s.append(pin_label("GND", ex + 82, ey + 166, COLORS["ground"]))
    s.append(pin_label("GPIO17 TX2", ex + 153, ey + 166, COLORS["blue"]))
    s.append(pin_label("GPIO16 RX2", ex + 240, ey + 166, COLORS["blue"], "end"))
    s.append(pin_label("GPIO5 DATA", ex + 258, ey + 82, COLORS["green"]))

    # Power drops.
    s.append(poly([(175, 305), (175, 365), (150, 365), (150, jy)], COLORS["rail"], 3.5, "5V high-current", (230, 350), marker=True))
    s.append(poly([(630, 305), (630, ey)], COLORS["rail"], 3.2, "5V VIN", (665, 342), marker=True))
    s.append(poly([(1080, 305), (1080, 350)], COLORS["rail"], 3.2, "5V LED", (1124, 336), marker=True))
    s.append(poly([(1280, 305), (1280, 585)], COLORS["rail"], 3.2, "5V audio", (1327, 512), marker=True))
    s.append(poly([(130, 305), (130, 650)], COLORS["rail"], 3.0, "5V fan", (171, 635), marker=True))

    # Grounds are vertical drops to the shared bottom bus.
    s.append(poly([(440, jy + 220), (440, 810)], COLORS["ground"], 2.4))
    s.append(poly([(725, ey + 190), (725, 810)], COLORS["ground"], 2.4))
    s.append(poly([(1190, 510), (1190, 810)], COLORS["ground"], 2.4))
    s.append(poly([(1370, 672), (1370, 810)], COLORS["ground"], 2.4))
    s.append(poly([(260, 760), (260, 810)], COLORS["ground"], 2.4))

    # UART between Jetson and ESP32.
    s.append(poly([(450, jy + 170), (545, jy + 170), (545, ey + 144), (810, ey + 144)], COLORS["blue"], 2.5, "TX -> RX", (626, 528), marker=True))
    s.append(poly([(810, ey + 162), (545, ey + 162), (545, jy + 190), (450, jy + 190)], COLORS["blue"], 2.5, "RX <- TX", (638, 564), marker=True))
    s.append(text("UART: 3.3V TTL only / TX-RX cross / no 5V logic", 520, 354, 12, 760, COLORS["blue"]))

    # LED diffuser subsystem.
    lx, ly = 1010, 350
    s.append(block(lx, ly, 380, 160, "Crescent RGBW LED", "SK6812/WS2812-class strip behind diffuser", "#f6fffd", "#6ea69e"))
    s.append(rect(lx + 45, ly + 78, 285, 30, fill="url(#crescentGrad)", stroke="#82b7ae", sw=1.0, rx=15))
    for i in range(10):
        s.append(circle(lx + 68 + i * 27, ly + 93, 4, fill="#fff5d5", stroke="#a79c77", sw=0.5))
    s.append(rect(lx - 60, ly + 126, 44, 10, fill="#f2ddac", stroke="#aa8f54", sw=0.8, rx=3))
    s.append(text("330Ω", lx - 38, ly + 121, 11, 760, COLORS["green"], "middle"))
    s.append(poly([(870, ey + 82), (936, ey + 82), (936, ly + 131), (lx - 60, ly + 131)], COLORS["green"], 2.5, "GPIO5 DATA", (927, 452), marker=True))
    s.append(circle(lx + 320, ly + 131, 16, fill="#fff8d7", stroke="#aa8f54", sw=1.1))
    s.append(text("1000uF", lx + 320, ly + 136, 10, 760, "#7b6234", "middle"))
    s.append(small("capacitor near LED input", lx + 210, ly + 147))

    # Audio subsystem.
    ax, ay = 1005, 585
    s.append(block(ax, ay, 180, 92, "USB Audio DAC", "Jetson USB", "#f8f7ff", "#8975ad"))
    s.append(block(ax + 250, ay, 190, 92, "Class-D Amp", "5V, 3W mono/stereo", "#f8f7ff", "#8975ad"))
    s.append(block(ax + 135, ay + 142, 250, 82, "Oval Speaker", "4Ω 3W + sealed chamber", "#f8f7ff", "#8975ad"))
    s.append(poly([(480, jy + 90), (520, jy + 90), (520, 630), (ax, 630)], COLORS["purple"], 2.8, "Jetson USB audio", (745, 620), marker=True))
    s.append(poly([(ax + 180, ay + 46), (ax + 250, ay + 46)], COLORS["purple"], 2.8, "L/R analog", (1220, ay + 37), marker=True))
    s.append(poly([(ax + 345, ay + 92), (ax + 345, 706), (ax + 260, 706), (ax + 260, ay + 142)], COLORS["purple"], 2.8, "speaker pair", (1324, 704), marker=True))

    # Cooling subsystem.
    fx, fy = 95, 650
    s.append(block(fx, fy, 285, 110, "5V PWM Blower", "Jetson fan header preferred", "#eef7ff", "#668db2"))
    s.append(rect(fx + 96, fy + 46, 82, 45, fill="#30373a", stroke="#777", rx=8))
    s.append(circle(fx + 137, fy + 69, 18, fill="#202326", stroke="#888"))
    s.append(poly([(260, jy + 220), (260, fy)], COLORS["blue"], 2.3, "PWM/TACH", (300, 626), marker=True))

    # Optional external lighting / WiZ note.
    wx, wy = 520, 660
    s.append(block(wx, wy, 340, 100, "Network / Lighting Bridge", "Wi-Fi to backend / optional WiZ control", "#fffaf0", "#b6935b"))
    s.append(poly([(730, ey + 55), (730, wy)], COLORS["green"], 2.2, "ESP32 Wi-Fi/BLE", (783, 630), dash="6 5", marker=True))
    s.append(text("ESP32 Wi-Fi/BLE 또는 Jetson network API", wx + 170, wy + 68, 12, 650, COLORS["green"], "middle"))

    # Port/service details.
    px, py = 80, 870
    s.append(label("REAR SERVICE BAY / physical ports", px, py - 18))
    s.append(rect(px, py, 600, 100, fill="#fffdf8", stroke="#ded5c8", sw=1.0, rx=12))
    items = [
        ("USB-C PD input", "12V trigger board -> protection -> 5V buck"),
        ("Jetson port access", "HDMI/USB/Ethernet은 removable rear cover 뒤에 배치"),
        ("Debug", "ESP32 USB는 내부 서비스 포트 또는 pogo/debug header"),
    ]
    for i, (a, b) in enumerate(items):
        yy = py + 28 + i * 25
        s.append(text(a, px + 18, yy, 12, 760, COLORS["ink"]))
        s.append(text(b, px + 170, yy, 12, 480, COLORS["muted"]))

    # Wiring checks.
    tx, ty = 760, 850
    s.append(label("WIRING CHECKLIST", tx, ty - 18))
    s.append(rect(tx, ty, 710, 142, fill="#fffdf8", stroke="#ded5c8", sw=1.0, rx=12))
    checks = [
        "Jetson Nano는 5V 고전류 전원 1개만 사용: barrel/header 중 하나만 선택.",
        "ESP32 UART는 3.3V TTL. TX/RX 교차 연결, GND 공통.",
        "LED 입력부에 330Ω data resistor와 1000uF capacitor를 LED 가까이에 배치.",
        "오디오/LED 전원선은 Jetson UART/ESP32 안테나에서 떨어뜨려 노이즈 최소화.",
        "블로워 흡기/배기 경로는 케이스 벽에 막히지 않게 최소 6mm clearance.",
    ]
    for i, c in enumerate(checks):
        s.append(text(f"{i+1}. {c}", tx + 18, ty + 30 + i * 22, 12, 520, COLORS["muted"]))

    # Legend.
    lx2, ly2 = 1170, 150
    s.append(label("LEGEND", lx2, ly2 - 16))
    legend = [
        (COLORS["orange"], "12V from USB-C PD"),
        (COLORS["rail"], "regulated 5V power"),
        (COLORS["ground"], "GND"),
        (COLORS["blue"], "UART / PWM / control"),
        (COLORS["green"], "LED data / wireless control"),
        (COLORS["purple"], "USB / audio signal"),
    ]
    for i, (c, l) in enumerate(legend):
        yy = ly2 + i * 28
        s.append(line(lx2, yy, lx2 + 42, yy, c, 4))
        s.append(text(l, lx2 + 55, yy + 4, 12, 600, COLORS["muted"]))

    s.append(text("Assumptions: Jetson Nano Dev Kit class board, ESP32-DevKitC class MCU board, 5V RGBW LED strip, USB audio DAC, 5V class-D amp, 5V PWM blower.", 70, 1030, 12, 500, COLORS["muted"]))
    s.append(svg_end())
    return "".join(s)


def main():
    (OUT / "noos-hardware-mechanical-blueprint.svg").write_text(mechanical_blueprint(), encoding="utf-8")
    (OUT / "noos-hardware-wiring-blueprint.svg").write_text(wiring_blueprint(), encoding="utf-8")
    print(OUT / "noos-hardware-mechanical-blueprint.svg")
    print(OUT / "noos-hardware-wiring-blueprint.svg")


if __name__ == "__main__":
    main()
