from PIL import Image, ImageDraw

def generate_icon(size, filename):
    # Tokyo Night colors
    bg_color = (26, 27, 38) # #1a1b26
    blue_color = (122, 162, 247) # #7aa2f7
    fg_color = (192, 202, 245) # #c0caf5
    red_color = (247, 118, 142) # #f7768e

    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Scale factors
    s = size / 512

    # Draw Ghost shape (rounded top, wavy bottom)
    # Body
    ghost_top = 100 * s
    ghost_bottom = 400 * s
    ghost_left = 100 * s
    ghost_right = 412 * s

    # Rounded head
    draw.pieslice([ghost_left, ghost_top, ghost_right, ghost_top + 312*s], 180, 0, fill=fg_color)
    # Body rectangle
    draw.rectangle([ghost_left, ghost_top + 156*s, ghost_right, ghost_bottom], fill=fg_color)

    # Wavy bottom (3 circles)
    wave_w = (ghost_right - ghost_left) / 3
    for i in range(3):
        x = ghost_left + i * wave_w
        draw.ellipse([x, ghost_bottom - wave_w/2, x + wave_w, ghost_bottom + wave_w/2], fill=fg_color)

    # Eyes (Tokyo Night Blue)
    eye_size = 40 * s
    draw.ellipse([180*s, 200*s, 180*s + eye_size, 200*s + eye_size], fill=bg_color)
    draw.ellipse([290*s, 200*s, 290*s + eye_size, 200*s + eye_size], fill=bg_color)

    # Gmail Envelope "M" on the chest (Tokyo Night Red)
    m_top = 280 * s
    m_bottom = 360 * s
    m_left = 180 * s
    m_right = 332 * s

    draw.line([m_left, m_top, m_left + (m_right-m_left)/2, m_top + 30*s, m_right, m_top], fill=red_color, width=int(8*s))
    draw.line([m_left, m_top, m_left, m_bottom], fill=red_color, width=int(8*s))
    draw.line([m_right, m_top, m_right, m_bottom], fill=red_color, width=int(8*s))
    draw.line([m_left, m_bottom, m_right, m_bottom], fill=red_color, width=int(8*s))

    img.save(filename)

# Generate icons
import os
os.makedirs('src-tauri/icons', exist_ok=True)
os.makedirs('static', exist_ok=True)

generate_icon(512, 'src-tauri/icons/icon.png')
generate_icon(32, 'static/favicon.png')
print("Icons generated successfully")
