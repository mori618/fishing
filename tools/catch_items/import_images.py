#!/usr/bin/env python3
"""釣れるものの画像を取り込む。

使い方:
    python3 tools/catch_items/import_images.py <画像フォルダ> [--size 256]

- ファイル名の先頭が画像ID（例: c02_18.png / c00_00_B.png / c02_19b.png）のものを取り込む
- 正方形に収めて縮小し、images/catch/<画像ID>.webp に保存（透過は保つ）
- data/catchImages.js の CATCH_IMAGE_READY を自動で更新
- 白背景の画像は、まわりの白を透明にする（--keep-white で無効）
"""
import argparse
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "images" / "catch"
READY_JS = ROOT / "data" / "catchImages.js"
ID_RE = re.compile(r"^(c\d{2}_\d{2}[b-z]?)(?![a-z0-9])", re.I)


def white_to_alpha(img: Image.Image, thresh: int = 245) -> Image.Image:
    """外周からつながった白だけを透明にする（中の白は残す）。"""
    img = img.convert("RGBA")
    if img.getextrema()[3][0] < 255:  # すでに透過あり
        return img
    w, h = img.size
    px = img.load()
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for x in (0, w - 1) for y in range(h)]
    seen = set()
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        seen.add((x, y))
        r, g, b, a = px[x, y]
        if r >= thresh and g >= thresh and b >= thresh:
            px[x, y] = (r, g, b, 0)
            stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return img


def fit_square(img: Image.Image, size: int) -> Image.Image:
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    side = int(max(img.size) * 1.08)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2), img)
    return canvas.resize((size, size), Image.LANCZOS)


def update_ready(ids):
    text = READY_JS.read_text(encoding="utf-8")
    m = re.search(r"window\.CATCH_IMAGE_READY = \[(.*?)\];", text, re.S)
    current = set(re.findall(r"'([^']+)'", m.group(1))) if m else set()
    merged = sorted(current | set(ids))
    body = "".join(f"    '{i}',\n" for i in merged)
    new = f"window.CATCH_IMAGE_READY = [\n{body}];"
    text = text[: m.start()] + new + text[m.end():] if m else text + "\n" + new + "\n"
    READY_JS.write_text(text, encoding="utf-8")
    return len(merged)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--size", type=int, default=256)
    ap.add_argument("--keep-white", action="store_true")
    a = ap.parse_args()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    done, skipped = [], []
    for p in sorted(Path(a.src).iterdir()):
        if p.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
            continue
        m = ID_RE.match(p.stem)
        if not m:
            skipped.append(p.name)
            continue
        iid = m.group(1).lower()
        img = Image.open(p)
        img = img.convert("RGBA") if a.keep_white else white_to_alpha(img)
        fit_square(img, a.size).save(OUT_DIR / f"{iid}.webp", "WEBP", quality=88, method=6)
        done.append(iid)
    total = update_ready(done)
    print(f"取り込み {len(done)}件 / 画像あり合計 {total}件")
    if skipped:
        print("ID が読めず飛ばしたファイル:", ", ".join(skipped))


if __name__ == "__main__":
    sys.exit(main())
