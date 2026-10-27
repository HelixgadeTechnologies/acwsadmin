#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFont

def create_pwa_icon(size, output_path, is_maskable=False):
    # Render at high-res 512x512 first, then downscale if smaller
    canvas_size = 512
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Palette
    GOLD = (212, 175, 55, 255)       # #D4AF37
    DARK_GOLD = (181, 142, 41, 255)  # #B58E29
    NAVY = (27, 37, 75, 255)         # #1B254B
    WHITE = (255, 255, 255, 255)

    if is_maskable:
        draw.rectangle([0, 0, canvas_size, canvas_size], fill=NAVY)
    else:
        corner_radius = int(canvas_size * 0.22)
        draw.rounded_rectangle([0, 0, canvas_size, canvas_size], radius=corner_radius, fill=NAVY)

    # Gold circular emblem inside
    pad = int(canvas_size * 0.16) if is_maskable else int(canvas_size * 0.12)
    emblem_box = [pad, pad, canvas_size - pad, canvas_size - pad]
    draw.ellipse(emblem_box, outline=GOLD, width=max(4, int(canvas_size * 0.025)))

    # Inner decorative ring
    inner_pad = pad + int(canvas_size * 0.04)
    draw.ellipse([inner_pad, inner_pad, canvas_size - inner_pad, canvas_size - inner_pad], outline=DARK_GOLD, width=max(2, int(canvas_size * 0.01)))

    # Crown / Summit triangle accent on top of monogram
    crown_top_y = pad + int(canvas_size * 0.12)
    crown_w = int(canvas_size * 0.14)
    cx = canvas_size // 2
    draw.polygon([
        (cx, crown_top_y),
        (cx - crown_w, crown_top_y + int(canvas_size * 0.08)),
        (cx - int(crown_w * 0.5), crown_top_y + int(canvas_size * 0.06)),
        (cx, crown_top_y + int(canvas_size * 0.08)),
        (cx + int(crown_w * 0.5), crown_top_y + int(canvas_size * 0.06)),
        (cx + crown_w, crown_top_y + int(canvas_size * 0.08))
    ], fill=GOLD)

    # Typography: ACWS
    font_size = int(canvas_size * 0.20)
    font = None
    try:
        for font_name in [
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/SFPro.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/Library/Fonts/Arial Bold.ttf"
        ]:
            if os.path.exists(font_name):
                font = ImageFont.truetype(font_name, font_size)
                break
    except Exception:
        pass

    if font is None:
        font = ImageFont.load_default()

    text = "ACWS"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    text_x = (canvas_size - tw) // 2
    text_y = (canvas_size - th) // 2 + int(canvas_size * 0.02)
    draw.text((text_x, text_y), text, fill=WHITE, font=font)

    # Subtitle: ADMIN
    sub_font_size = int(canvas_size * 0.07)
    sub_font = None
    try:
        for font_name in [
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/Supplemental/Arial.ttf"
        ]:
            if os.path.exists(font_name):
                sub_font = ImageFont.truetype(font_name, sub_font_size)
                break
    except Exception:
        pass

    if sub_font is None:
        sub_font = ImageFont.load_default()

    sub_text = "ADMIN"
    sub_bbox = draw.textbbox((0, 0), sub_text, font=sub_font)
    stw = sub_bbox[2] - sub_bbox[0]
    sub_x = (canvas_size - stw) // 2
    sub_y = text_y + th + int(canvas_size * 0.04)
    draw.text((sub_x, sub_y), sub_text, fill=GOLD, font=sub_font)

    if size != canvas_size:
        img = img.resize((size, size), Image.Resampling.LANCZOS)

    img.save(output_path, "PNG", optimize=True)
    print(f"Generated {output_path} ({size}x{size})")

def main():
    icons_dir = "public/icons"
    os.makedirs(icons_dir, exist_ok=True)

    create_pwa_icon(192, os.path.join(icons_dir, "icon-192x192.png"))
    create_pwa_icon(512, os.path.join(icons_dir, "icon-512x512.png"))
    create_pwa_icon(512, os.path.join(icons_dir, "maskable-icon-512x512.png"), is_maskable=True)
    create_pwa_icon(180, os.path.join(icons_dir, "apple-touch-icon.png"))
    create_pwa_icon(32, os.path.join(icons_dir, "favicon-32x32.png"))
    create_pwa_icon(180, "public/apple-touch-icon.png")

if __name__ == "__main__":
    main()
