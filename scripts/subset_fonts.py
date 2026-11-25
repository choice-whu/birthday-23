"""
字体子集精简脚本（方案 B）：
- LongCang.ttf         -> public/assets/fonts/longcang.woff2        （手写主字体）
- ZCOOLXiaoWei.ttf     -> public/assets/fonts/xiaowei.woff2         （正文与日期副字体）
- MaShanZheng.ttf      -> public/assets/fonts/mashanzheng-display.woff2（幕 1 封面毛笔大字与装饰大字精简子集）

用法（在 site/ 目录下）：python scripts/subset_fonts.py
"""
import re
from pathlib import Path
from fontTools.subset import Subsetter, Options, load_font, save_font

SITE = Path(__file__).resolve().parents[1]
FONTS_CACHE = SITE / ".cache" / "fonts"
FONTS_OUT = SITE / "public" / "assets" / "fonts"

# 保证任何动态数字、英文、标点、UI 控件提示字符永不缺失
BASE_CHARS = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "，。！？、；：“”‘’（）【】《》—…·～•✅♥☀️↺→←↓↑"
    + "0123456789∞"
    + "正在装订你的22岁生日手账目录选幕静音有声重新播放再拆一次跳过当前测试竖屏横"
    + "佳奇choice生日快乐一二三四五六七八九十零年周月日星期"
)

# 方案 B：MaShanZheng 仅用于幕 1 封面「想送你 1 份礼物」及少数大号毛笔装饰字，保持极小体积
DISPLAY_BRUSH_CHARS = (
    "想送你1份礼物生日快乐干杯全部中奖叮咚佳奇guaiguai22岁"
    "0123456789!！—·∞HBD"
)


def strip_comments(text: str) -> str:
    # 剥离 HTML 注释、块注释与整行/行尾双斜杠注释，避免注释用字撑大字体体积
    text = re.sub(r"<!--[\s\S]*?-->", " ", text)
    text = re.sub(r"/\*[\s\S]*?\*/", " ", text)
    text = re.sub(r"(?m)^\s*//.*$", " ", text)
    text = re.sub(r"(?<!:)\s//.*$", " ", text, flags=re.M)
    return text


def collect_project_chars() -> str:
    chars = set(BASE_CHARS)
    scan_dirs = [SITE / "src", SITE / "index.html"]
    files: list[Path] = []
    for target in scan_dirs:
        if target.is_file():
            files.append(target)
        elif target.is_dir():
            for ext in ("*.ts", "*.vue", "*.json"):
                files.extend(target.rglob(ext))
    for path in files:
        try:
            raw = strip_comments(path.read_text(encoding="utf-8"))
            # 若为 .vue 文件，额外提取 <template> 内的可见正文
            if path.suffix == ".vue":
                tpl = re.search(r"<template>([\s\S]*)</template>", raw)
                if tpl:
                    plain = re.sub(r"<[^>]+>", " ", tpl.group(1))
                    plain = re.sub(r"\{\{[\s\S]*?\}\}", " ", plain)
                    chars.update(ch for ch in plain if ord(ch) >= 0x20 and not ch.isspace())
            # 提取所有单/双/反引号文案字面量
            for m in re.finditer(r"['\"`]([^'\"`\r\n]+)['\"`]", raw):
                chars.update(m.group(1))
        except Exception as err:
            print(f"[warn] skip {path}: {err}")
    return "".join(sorted(chars))


def build_subset(src_ttf: Path, out_woff2: Path, text: str, max_kb: int | None = None) -> None:
    if not src_ttf.exists():
        raise FileNotFoundError(f"Missing font source: {src_ttf}")
    out_woff2.parent.mkdir(parents=True, exist_ok=True)
    options = Options()
    options.flavor = "woff2"
    options.desubroutinize = True
    options.layout_features = ["*"]
    options.hinting = False
    font = load_font(str(src_ttf), options)
    subsetter = Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    save_font(font, str(out_woff2), options)
    size_kb = out_woff2.stat().st_size / 1024
    glyph_count = len(font.getGlyphOrder())
    status = "OK"
    if max_kb is not None and size_kb > max_kb:
        status = f"WARN (>{max_kb}KB)"
    print(f"  {out_woff2.name:<28} {glyph_count:>4} glyphs  {size_kb:>6.1f} KB  [{status}]")


def main() -> None:
    all_chars = collect_project_chars()
    brush_chars = "".join(sorted(set(DISPLAY_BRUSH_CHARS)))
    print(f"[subset_fonts] collected {len(all_chars)} unique characters from src/ + index.html")
    build_subset(FONTS_CACHE / "LongCang.ttf", FONTS_OUT / "longcang.woff2", all_chars, max_kb=300)
    build_subset(FONTS_CACHE / "ZCOOLXiaoWei.ttf", FONTS_OUT / "xiaowei.woff2", all_chars, max_kb=300)
    build_subset(FONTS_CACHE / "MaShanZheng.ttf", FONTS_OUT / "mashanzheng-display.woff2", brush_chars, max_kb=50)


if __name__ == "__main__":
    main()
