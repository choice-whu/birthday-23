"""
素材流水线：把工作区根目录的原始照片处理成网站用的 webp。
用法（在 site/ 目录下）：python scripts/process_images.py [portraits|flowers|daily|travel|all]
- 白底抠图：从图片四周向内做容差填充，只去掉与边缘连通的白色
- 贴纸：在抠图外加一圈白色描边（_sticker）
- 日常照片：裁 3:4，输出清晰版 + 极小模糊版（未对焦状态用）
- 旅行照片：扫描 旅游/<城市>/，输出 travel/<拼音>/N.webp 与 src/travel-manifest.json
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import numpy as np
import json
import shutil
import sys

ROOT = Path(__file__).resolve().parents[2]          # 生日网站/
SITE = Path(__file__).resolve().parents[1]
OUT = SITE / "public" / "assets"
REVIEW = SITE / ".cache" / "review"
KIDS = ROOT / "幕2，3，4"

# 花：(文件名, 预裁剪框 None 或 (l,t,r,b) 比例)
FLOWERS = [
    ("第一束表白", None),
    ("第二束“对不齐鸭”", (0, 0, 0.96, 0.672)),   # 裁掉底部牛仔裤腿与黑袖子及右边缘噪点
    ("第三束生日", None),
    ("第四束跨年烟花菊", None),
    ("第五束结束漫长寒假红玫瑰", None),
    ("第六束周年纪念日", None),
    ("第七束白雪公主", None),
    ("第八束结束漫长暑假", None),
    ("第九束", None),
    ("第十束", None),
    ("第十一束比赛顺利", None),
]
DAILY = [
    "第一次牵手手", "表白送花", "第一次一起拍拍立得", "第一次一起跨年",
    "搞怪", "第一次正式约会（海洋馆）", "随手合照", "周年纪念",
]
CITIES = [("宏村", "hongcun"), ("庐山", "lushan"), ("南昌", "nanchang"),
          ("开封", "kaifeng"), ("杭州", "hangzhou"), ("苏州", "suzhou")]


def load(path: Path) -> Image.Image:
    return ImageOps.exif_transpose(Image.open(path)).convert("RGB")


def cutout(img: Image.Image, white_min=232, sat_max=28) -> Image.Image:
    """返回 RGBA：去掉与边缘连通的近白背景。"""
    rgb = img.convert("RGB")
    a = np.asarray(rgb).astype(np.int16)
    mn, mx = a.min(axis=2), a.max(axis=2)
    whiteish = (mn >= white_min) & ((mx - mn) <= sat_max)
    h, w = whiteish.shape
    m = np.zeros((h + 2, w + 2), np.uint8)
    m[1:-1, 1:-1] = np.where(whiteish, 255, 0)
    m[0, :] = m[-1, :] = 255
    m[:, 0] = m[:, -1] = 255
    mask = Image.fromarray(m, "L").copy()   # fromarray 的图是只读共享内存，floodfill 会静默失败
    ImageDraw.floodfill(mask, (0, 0), 128, thresh=0)
    bg = (np.asarray(mask)[1:-1, 1:-1] == 128)
    alpha = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8), "L")
    alpha = alpha.filter(ImageFilter.MedianFilter(5))
    alpha = alpha.filter(ImageFilter.MinFilter(3))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.9))
    out = rgb.copy()
    out.putalpha(alpha)
    return out


def trim(img: Image.Image, pad=0) -> Image.Image:
    bbox = img.getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    return img.crop((max(0, l - pad), max(0, t - pad), min(img.width, r + pad), min(img.height, b + pad)))


def sticker(img: Image.Image, border: int) -> Image.Image:
    """外加白色贴纸描边（模糊+阈值近似圆形膨胀，比反复 MaxFilter 快得多）。"""
    w, h = img.size
    canvas = Image.new("RGBA", (w + border * 2, h + border * 2), (0, 0, 0, 0))
    canvas.paste(img, (border, border), img)
    a = canvas.getchannel("A").point(lambda v: 255 if v > 40 else 0)
    grow = a.filter(ImageFilter.GaussianBlur(border * 0.55))
    grow = grow.point(lambda v: 255 if v > 14 else int(v * 18))
    grow = grow.filter(ImageFilter.GaussianBlur(0.8))
    white = Image.new("RGBA", canvas.size, (255, 255, 255, 255))
    white.putalpha(grow)
    white.alpha_composite(canvas)
    return white


def fit(img: Image.Image, max_side: int) -> Image.Image:
    s = max_side / max(img.size)
    if s >= 1:
        return img
    return img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)


def crop_ratio(img: Image.Image, box):
    if not box:
        return img
    l, t, r, b = box
    return img.crop((round(l * img.width), round(t * img.height), round(r * img.width), round(b * img.height)))


def center_crop(img: Image.Image, ratio_w: int, ratio_h: int, bias_y=0.5) -> Image.Image:
    w, h = img.size
    if h / w >= ratio_h / ratio_w:
        tw, th = w, round(w * ratio_h / ratio_w)
    else:
        tw, th = round(h * ratio_w / ratio_h), h
    left = (w - tw) // 2
    top = round((h - th) * bias_y)
    return img.crop((left, top, left + tw, top + th))


def save_webp(img: Image.Image, path: Path, q=82):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=q, method=6)
    print(f"  {path.relative_to(OUT)}  {img.size[0]}x{img.size[1]}  {path.stat().st_size // 1024}KB")


def review_sheet(items, name: str, cell=260):
    cols = 6
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 24)), (182, 150, 122))
    d = ImageDraw.Draw(sheet)
    for i, (label, im) in enumerate(items):
        x, y = (i % cols) * cell, (i // cols) * (cell + 24)
        t = im.copy()
        t.thumbnail((cell - 16, cell - 16))
        sheet.paste(t, (x + (cell - t.width) // 2, y + (cell - t.height) // 2), t if t.mode == "RGBA" else None)
        d.text((x + 6, y + cell + 4), label, fill=(40, 30, 20))
    REVIEW.mkdir(parents=True, exist_ok=True)
    sheet.save(REVIEW / name, quality=88)
    print("review ->", REVIEW / name)


def do_portraits():
    print("[portraits]")
    review = []
    # 幕2 立牌 + 幕10 右侧碎片
    cake = fit(trim(cutout(load(KIDS / "girlfriend1.jpg"))), 900)
    save_webp(cake, OUT / "photos" / "her_cake_cut.webp")
    st = sticker(cake, 16)
    save_webp(st, OUT / "photos" / "her_cake_sticker.webp")
    review.append(("her_cake", st))
    # 幕3 拍立得：只取头部圆脸（方形）
    raw = load(KIDS / "girlfrend2.jpg")
    head_box = (420, 10, 920, 510)
    head = raw.crop(head_box)
    save_webp(head.resize((640, 640), Image.LANCZOS), OUT / "photos" / "her_face_square.webp")
    head_cut = cutout(head)
    save_webp(head_cut.resize((640, 640), Image.LANCZOS), OUT / "photos" / "her_face_cut.webp")
    review.append(("her_face_square", head))
    review.append(("her_face_cut", head_cut))
    # 幕10 左侧碎片
    boy = trim(cutout(load(KIDS / "boy.jpg")))
    save_webp(boy, OUT / "photos" / "his_child_cut.webp")
    review.append(("his_child", sticker(boy, 10)))
    # 幕10 合照 + 锁屏
    merged = load(KIDS / "merged_childhood.jpg")
    save_webp(fit(merged, 1200), OUT / "photos" / "merged_childhood.webp", q=84)
    review.append(("merged", merged))
    review_sheet(review, "portraits.jpg")


def do_flowers():
    print("[flowers]")
    review = []
    for i, (fname, box) in enumerate(FLOWERS, 1):
        im = crop_ratio(load(ROOT / "花" / f"{fname}.jpg"), box)
        cut = fit(trim(cutout(im)), 760)
        st = sticker(cut, 12)
        save_webp(st, OUT / "flowers" / f"flower_{i:02d}.webp")
        review.append((f"flower_{i:02d}", st))
    review_sheet(review, "flowers.jpg")


def do_daily():
    print("[daily]")
    review = []
    for i, fname in enumerate(DAILY, 1):
        im = center_crop(load(ROOT / "日常" / f"{fname}.jpg"), 3, 4, bias_y=0.4)
        save_webp(fit(im, 900), OUT / "photos" / f"daily_{i}.webp", q=80)
        tiny = im.resize((48, 64), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.2))
        save_webp(tiny, OUT / "photos" / f"daily_{i}_blur.webp", q=70)
        review.append((f"daily_{i}", fit(im, 400).convert("RGBA")))
    review_sheet(review, "daily.jpg")


def trim_dark_bands(img: Image.Image) -> Image.Image:
    """裁掉相机截图上下的大块黑边（行内 95% 以上像素接近纯黑视为黑边，允许少量 UI 文字）。"""
    g = np.asarray(img.convert("L"))
    dark_rows = (g < 24).mean(axis=1) > 0.95
    h = len(dark_rows)
    # 找最长的连续“非黑”行区间
    best, cur_start, best_rng = 0, None, (0, h)
    for i, d in enumerate(list(dark_rows) + [True]):
        if not d and cur_start is None:
            cur_start = i
        elif d and cur_start is not None:
            if i - cur_start > best:
                best, best_rng = i - cur_start, (cur_start, i)
            cur_start = None
    t, b = best_rng
    if b - t < h * 0.97:
        return img.crop((0, t, img.width, b))
    return img


def do_travel():
    print("[travel]")
    manifest = {}
    review = []
    for cn, py in CITIES:
        folder = ROOT / "旅游" / cn
        files = sorted([p for p in folder.glob("*") if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")]) if folder.exists() else []
        out_dir = OUT / "travel" / py
        if out_dir.exists():
            shutil.rmtree(out_dir)
        items = []
        for n, p in enumerate(files, 1):
            im = trim_dark_bands(load(p))
            # 超长竖图（手机截图比例）先裁到 3:4，避免拍立得里太细长
            if im.height / im.width > 1.6:
                im = center_crop(im, 3, 4, bias_y=0.4)
            if im.width / im.height > 1.6:
                im = center_crop(im, 4, 3)
            im = fit(im, 900)
            save_webp(im, out_dir / f"{n}.webp", q=80)
            items.append({"src": f"assets/travel/{py}/{n}.webp", "w": im.width, "h": im.height})
            review.append((f"{py}_{n}", im.convert("RGBA")))
        manifest[cn] = items
        print(f"  {cn}: {len(items)} 张")
    (SITE / "src").mkdir(exist_ok=True)
    (SITE / "src" / "travel-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    review_sheet(review, "travel.jpg")


def do_audio():
    (OUT / "audio").mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / "bgm.mp3", OUT / "audio" / "bgm.mp3")
    print("[audio] bgm.mp3")


def clean_old():
    for f in ["her_cake_sticker", "her_face_sticker", "her_face_full", "his_child_sticker"]:
        p = OUT / "photos" / f"{f}.webp"
        if p.exists() and f != "her_cake_sticker":
            p.unlink()


ART_ITEMS = [
    ("crown_gold", 234, 24),
    ("number_23", 234, 24),
    ("cake_strawberry", 240, 18),
    ("hat_blue_stripes", 240, 18),
    ("polaroid_camera", 234, 24),
    ("hat_pink_dots", 234, 24),
    ("glasses_heart", 234, 24),
    ("cake_white", 240, 18),
    ("beer_glass", 240, 18),
    ("film_canister", 240, 18),
    ("compass_rose", 234, 24),
    ("slot_machine", 240, 18),
    ("gift_box", 234, 24),
]


def clear_interior_white(img: Image.Image, seed_rel=(0.5, 0.64), white_min=246, sat_max=12) -> Image.Image:
    """清除封闭轮廓内（如皇冠圆环内圈）的纯白镂空区域。"""
    rgba = img.convert("RGBA")
    rgb = np.asarray(rgba.convert("RGB")).astype(np.int16)
    alpha = np.asarray(rgba.getchannel("A")).copy()
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    whiteish = (mn >= white_min) & ((mx - mn) <= sat_max) & (alpha > 128)
    h, w = whiteish.shape
    sx, sy = int(w * seed_rel[0]), int(h * seed_rel[1])
    if not whiteish[sy, sx]:
        # 在种子点附近小范围搜一个纯白像素
        found = None
        for dy in range(-24, 25, 4):
            for dx in range(-24, 25, 4):
                ny, nx = sy + dy, sx + dx
                if 0 <= ny < h and 0 <= nx < w and whiteish[ny, nx]:
                    found = (nx, ny)
                    break
            if found:
                break
        if not found:
            return rgba
        sx, sy = found
    m = np.where(whiteish, 255, 0).astype(np.uint8)
    mask = Image.fromarray(m, "L").copy()
    ImageDraw.floodfill(mask, (sx, sy), 128, thresh=0)
    hole = np.asarray(mask) == 128
    hole_alpha = Image.fromarray(np.where(hole, 0, alpha).astype(np.uint8), "L")
    hole_alpha = hole_alpha.filter(ImageFilter.GaussianBlur(0.6))
    # 仅替换透明掉的内部区域及边缘柔化
    new_a = np.minimum(alpha, np.asarray(hole_alpha))
    out = rgba.copy()
    out.putalpha(Image.fromarray(new_a, "L"))
    return out


def do_art():
    print("[art]")
    art_raw = SITE / ".cache" / "art_raw"
    review = []
    exts = (".png", ".jpg", ".jpeg", ".webp")
    for name, w_min, s_max in ART_ITEMS:
        src = None
        for ext in exts:
            cand = art_raw / f"{name}{ext}"
            if cand.exists():
                src = cand
                break
        if src is None:
            print(f"  [missing] {name}")
            continue
        im = load(src)
        cut = cutout(im, white_min=w_min, sat_max=s_max)
        if name == "crown_gold":
            cut = clear_interior_white(cut, seed_rel=(0.5, 0.64), white_min=246, sat_max=12)
        cut = fit(trim(cut, pad=4), 760)
        save_webp(cut, OUT / "art" / f"{name}.webp", q=86)
        review.append((name, cut))
    if review:
        review_sheet(review, "art.jpg")


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what in ("portraits", "all"):
        clean_old()
        do_portraits()
    if what in ("flowers", "all"):
        do_flowers()
    if what in ("daily", "all"):
        do_daily()
    if what in ("travel", "all"):
        do_travel()
    if what in ("art", "all"):
        do_art()
    if what == "all":
        do_audio()
