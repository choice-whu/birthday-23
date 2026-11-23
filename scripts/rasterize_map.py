"""Render Scene 7's map images from china.svg and map-meta.json."""

import json
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
from xml.etree import ElementTree

from PIL import Image

SITE = Path(__file__).resolve().parents[1]
MAP = SITE / "public" / "assets" / "map"
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")


def rasterize(svg, view_box, size, output):
    width, height = size
    svg.set("viewBox", " ".join(str(value) for value in view_box))
    svg.set("width", str(width))
    svg.set("height", str(height))
    with TemporaryDirectory(prefix="guaiguai-map-") as directory:
        page = Path(directory) / "map.html"
        screenshot = Path(directory) / "map.png"
        page.write_text(
            '<!doctype html><meta charset="utf-8"><style>body{margin:0}svg{display:block}</style>'
            + ElementTree.tostring(svg, encoding="unicode"),
            encoding="utf-8",
        )
        subprocess.run([
            str(CHROME), "--headless=new", "--hide-scrollbars",
            "--force-device-scale-factor=1", f"--window-size={width},{height}",
            f"--screenshot={screenshot}", page.as_uri(),
        ], check=True, capture_output=True)
        with Image.open(screenshot) as image:
            if image.size != size:
                raise RuntimeError(f"Unexpected size: {image.size}")
            image.convert("RGB").save(MAP / output, lossless=True, method=6)


def main():
    ElementTree.register_namespace("", "http://www.w3.org/2000/svg")
    svg = ElementTree.parse(MAP / "china.svg").getroot()
    _, _, svg_width, svg_height = map(float, svg.get("viewBox").split())
    meta = json.loads((SITE / "src" / "map-meta.json").read_text(encoding="utf-8"))
    region = meta["region"]
    scale_x = svg_width / meta["width"]
    scale_y = svg_height / meta["height"]
    rasterize(svg, (0, 0, svg_width, svg_height), (2560, 1440), "china.webp")
    rasterize(svg, (
        region["x"] * scale_x,
        region["y"] * scale_y,
        svg_width / region["zoom"],
        svg_height / region["zoom"],
    ), (1600, 900), "china-region.webp")


if __name__ == "__main__":
    main()
