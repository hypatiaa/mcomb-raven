"""Side-by-side: original | v0.4.2 | v0.5, full picture and four close-ups. Usage: python -I compose_compare.py SRC V042 V05 OUTDIR"""
import sys
from PIL import Image, ImageDraw
src, a, b, out = sys.argv[1:5]
ims = [Image.open(p).convert("RGB") for p in (src, a, b)]
W, H = ims[0].size
labels = ["original", "v0.4.2 (Opus)", "v0.5 (Gemini)"]
def sheet(box, scale, name, title):
    x0, y0, x1, y1 = box; w, h = int((x1 - x0) * scale), int((y1 - y0) * scale)
    S = Image.new("RGB", (3 * w + 40, h + 70), "white"); d = ImageDraw.Draw(S)
    d.text((10, 8), title, fill="black", font_size=26)
    for i, im in enumerate(ims):
        S.paste(im.crop(box).resize((w, h), Image.LANCZOS), (10 + i * (w + 10), 60))
        d.text((14 + i * (w + 10), 36), labels[i], fill="black", font_size=20)
    S.save(f"{out}/{name}.png"); print(name, S.size)
sheet((0, 0, W, H), 0.5, "full", "Full drawing")
sheet((700, 60, 1100, 330), 1.5, "head", "Head and beak (1.5x)")
sheet((300, 350, 700, 700), 1.4, "wing", "Wing (1.4x)")
sheet((560, 860, 1000, 1150), 1.3, "feet", "Feet and talons (1.3x)")
sheet((640, 700, 1145, 1374), 0.95, "branch", "Branch")
