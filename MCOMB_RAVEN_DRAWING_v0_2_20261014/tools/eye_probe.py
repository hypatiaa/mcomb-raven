import sys, numpy as np
from PIL import Image, ImageFilter
img = Image.open(sys.argv[1]).convert("L")
g = np.asarray(img.filter(ImageFilter.GaussianBlur(1)), dtype=float)
box = g[90:180, 740:860]
y, x = np.unravel_index(np.argmin(box), box.shape)
print("darkest in box at", x + 740, y + 90, "gray", box.min())
# highlight: brightest pixel within 15 px of darkest
yy, xx = np.mgrid[0:box.shape[0], 0:box.shape[1]]
near = (yy - y) ** 2 + (xx - x) ** 2 < 15 ** 2
b = np.where(near, box, -1); y2, x2 = np.unravel_index(np.argmax(b), b.shape)
print("highlight at", x2 + 740, y2 + 90, "gray", b.max())
Image.fromarray(np.asarray(img)[90:180, 740:860]).resize((480, 360), Image.NEAREST).save(sys.argv[2])
