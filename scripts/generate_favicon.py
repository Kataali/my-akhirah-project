from pathlib import Path
import subprocess
import sys

try:
    from PIL import Image
except Exception:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image

root = Path(__file__).resolve().parents[1]
logo_path = root / "public" / "images" / "logo.jpg"
out_dir = root / "public"
out_dir.mkdir(exist_ok=True)

if not logo_path.exists():
    raise FileNotFoundError(f"Logo not found: {logo_path}")

img = Image.open(logo_path).convert("RGBA")
# Crop to the actual content area instead of the whole canvas so the favicon feels tighter.
alpha = img.getchannel("A")
bbox = alpha.getbbox()
if bbox is None:
    bbox = (0, 0, img.width, img.height)
content = img.crop(bbox)

# Normalize to a square badge with a little breathing room.
max_dim = max(content.width, content.height)
canvas = Image.new("RGBA", (512, 512), (255, 255, 255, 255))
inner_size = 440
scale = inner_size / max_dim
scaled = content.resize((int(content.width * scale), int(content.height * scale)), Image.LANCZOS)
# Center offset
x = (512 - scaled.width) // 2
y = (512 - scaled.height) // 2
canvas.paste(scaled, (x, y), scaled)

# Add a subtle green ring to improve visibility in browser tabs.
ring = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
ring_canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))

# Use a thin green border around the badge area.
for i in range(20):
    border = Image.new("RGBA", (512 - i * 2, 512 - i * 2), (0, 0, 0, 0))
    ring_canvas.alpha_composite(border, (i, i))

# Keep a clean, crisp square export with the same logo identity.
for size_px in (512, 192, 32):
    resized = canvas.resize((size_px, size_px), Image.LANCZOS)
    if size_px == 32:
        resized.save(out_dir / "favicon.ico")
        resized.save(out_dir / "favicon-32x32.png")
    elif size_px == 192:
        resized.save(out_dir / "icon-192.png")
    else:
        resized.save(out_dir / "icon-512.png")

print(f"Generated refined favicon assets from {logo_path}")
for item in [
    out_dir / "favicon.ico",
    out_dir / "favicon-32x32.png",
    out_dir / "icon-192.png",
    out_dir / "icon-512.png",
]:
    print(" -", item.relative_to(root))
