"""
通过无头 Chrome 双底色差分抠图（White/Black 2-pass difference matting）
把 render_art_sheet.html 中的 12 件手绘插画导出为透明 webp，并与既有的 crown_gold.webp 一起生成审图拼图 art.jpg。

用法（在 site/ 目录下）：python scripts/build_art.py
"""
from pathlib import Path
import argparse
import subprocess
import numpy as np
from PIL import Image, ImageDraw

SITE = Path(__file__).resolve().parents[1]
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
HTML_PATH = SITE / "scripts" / "render_art_sheet.html"
ART_RAW = SITE / ".cache" / "art_raw"
OUT_ART = SITE / "public" / "assets" / "art"
REVIEW = SITE / ".cache" / "review"

NAMES = [
    "number_22",
    "cake_strawberry",
    "hat_blue_stripes",
    "polaroid_camera",
    "hat_pink_dots",
    "glasses_heart",
    "cake_white",
    "beer_glass",
    "film_canister",
    "compass_rose",
    "slot_machine",
    "gift_box",
]


def capture(bg: str, out_png: Path) -> None:
    out_png.parent.mkdir(parents=True, exist_ok=True)
    url = f"{HTML_PATH.as_uri()}?bg={bg}"
    cmd = [
        str(CHROME),
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--window-size=3200,2400",
        f"--screenshot={out_png}",
        url,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if res.returncode != 0 or not out_png.exists():
        raise RuntimeError(f"Chrome capture failed ({bg}): {res.stderr}")


def trim(img: Image.Image, pad: int = 6) -> Image.Image:
    bbox = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    return img.crop((max(0, l - pad), max(0, t - pad), min(img.width, r + pad), min(img.height, b + pad)))


def fit(img: Image.Image, max_side: int = 760) -> Image.Image:
    s = max_side / max(img.size)
    if s >= 1:
        return img
    return img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)


def make_review_sheet() -> None:
    all_names = ["crown_gold", *NAMES]
    cell = 260
    cols = 5
    rows = (len(all_names) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 26)), (182, 150, 122))
    draw = ImageDraw.Draw(sheet)
    for i, name in enumerate(all_names):
        p = OUT_ART / f"{name}.webp"
        if not p.exists():
            continue
        im = Image.open(p).convert("RGBA")
        im.thumbnail((cell - 20, cell - 20), Image.LANCZOS)
        x = (i % cols) * cell
        y = (i // cols) * (cell + 26)
        sheet.paste(im, (x + (cell - im.width) // 2, y + (cell - im.height) // 2), im)
        draw.text((x + 8, y + cell + 4), name, fill=(40, 30, 20))
    REVIEW.mkdir(parents=True, exist_ok=True)
    sheet.save(REVIEW / "art.jpg", quality=90)
    print(f"review -> {REVIEW / 'art.jpg'}")


def main(only: str | None = None) -> None:
    white_png = ART_RAW / "_sheet_white.png"
    black_png = ART_RAW / "_sheet_black.png"
    capture("white", white_png)
    capture("black", black_png)

    w_arr = np.asarray(Image.open(white_png).convert("RGB"), dtype=np.float32)
    b_arr = np.asarray(Image.open(black_png).convert("RGB"), dtype=np.float32)
    OUT_ART.mkdir(parents=True, exist_ok=True)

    for idx, name in enumerate(NAMES):
        if only is not None and name != only:
            continue
        # 若已有 AI 生成原图（.jpg/.jpeg/.webp），保留现有高质感 AI webp 不覆盖
        if only is None and any((ART_RAW / f"{name}{ext}").exists() for ext in (".jpg", ".jpeg", ".webp")):
            print(f"  [skip-ai] art/{name}.webp")
            continue

        col = idx % 4
        row = idx // 4
        y0, y1 = row * 800, (row + 1) * 800
        x0, x1 = col * 800, (col + 1) * 800

        w_tile = w_arr[y0:y1, x0:x1]
        b_tile = b_arr[y0:y1, x0:x1]
        diff = np.mean(w_tile - b_tile, axis=2)
        alpha = np.clip(255.0 - diff, 0.0, 255.0)
        # Clean stray near-zero noise
        alpha = np.where(alpha < 2.0, 0.0, alpha)
        safe_alpha = np.maximum(alpha[..., None], 1.0)
        fg = np.where(alpha[..., None] > 1.0, np.clip(b_tile * 255.0 / safe_alpha, 0.0, 255.0), 0.0)

        rgba = np.dstack([fg, alpha]).astype(np.uint8)
        im = Image.fromarray(rgba, "RGBA")

        trimmed = fit(trim(im, pad=6), 760)
        out_path = OUT_ART / f"{name}.webp"
        trimmed.save(out_path, "WEBP", quality=88, method=6)
        print(f"  art/{out_path.name:<22} {trimmed.size[0]}x{trimmed.size[1]}  {out_path.stat().st_size // 1024}KB")

    if only is None:
        make_review_sheet()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=NAMES, help="重新导出指定插画")
    main(parser.parse_args().only)
