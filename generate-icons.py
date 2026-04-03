from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs("client/public/icons", exist_ok=True)

def create_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Navy background circle
    margin = int(size * 0.05)
    draw.ellipse([margin, margin, size - margin, size - margin], fill="#1B3A6B")
    
    # Gold ring
    ring_width = max(2, int(size * 0.04))
    draw.ellipse(
        [margin + ring_width, margin + ring_width, size - margin - ring_width, size - margin - ring_width],
        outline="#C9922A",
        width=ring_width
    )
    
    # Text "50+" in white
    try:
        font_size = int(size * 0.32)
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "50+"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (size - text_w) // 2
    y = (size - text_h) // 2 - int(size * 0.03)
    draw.text((x, y), text, fill="white", font=font)
    
    # Small gold dot below
    dot_y = y + text_h + int(size * 0.04)
    dot_r = max(2, int(size * 0.04))
    dot_x = size // 2
    draw.ellipse([dot_x - dot_r, dot_y, dot_x + dot_r, dot_y + dot_r * 2], fill="#C9922A")
    
    return img

for size in [192, 512]:
    icon = create_icon(size)
    icon.save(f"client/public/icons/icon-{size}.png", "PNG")
    print(f"Created icon-{size}.png")

print("Icons generated successfully!")
