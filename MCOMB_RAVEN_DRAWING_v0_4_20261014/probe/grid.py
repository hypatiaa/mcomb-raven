import sys
from PIL import Image, ImageDraw
im = Image.open('data/raven_source.png').convert('RGB')
x0, y0, x1, y1, step, out = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6]
c = im.crop((x0, y0, x1, y1)); d = ImageDraw.Draw(c)
for x in range((x0 // step + 1) * step, x1, step):
    d.line([(x - x0, 0), (x - x0, y1 - y0)], fill=(255, 0, 0), width=1); d.text((x - x0 + 2, 2), str(x), fill=(255, 0, 0))
for y in range((y0 // step + 1) * step, y1, step):
    d.line([(0, y - y0), (x1 - x0, y - y0)], fill=(0, 0, 255), width=1); d.text((2, y - y0 + 2), str(y), fill=(0, 0, 255))
c.save(out)
