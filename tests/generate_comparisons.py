from PIL import Image, ImageDraw
import os

board_path = r'C:\Users\wdccr\.gemini\antigravity\brain\473f193e-4d1f-4134-9424-d22b19dd230e\.user_uploaded\media_1791812142708_f29726ea.jpg'
evidencias_dir = r'C:\Users\wdccr\Documents\ChatGPT\fabby\vem-da-escola-site\docs\evidencias'

def create_all_comparisons():
    board = Image.open(board_path)
    w_board, h_board = board.size
    
    # 1. Desktop Lado a Lado (1440px vs Prancha)
    header_h = 50
    target_w = 960
    target_h = int((target_w / w_board) * h_board)
    board_resized = board.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    capture_1440 = Image.open(os.path.join(evidencias_dir, '01_home_desktop_1440.png'))
    capture_crop = capture_1440.crop((0, 0, capture_1440.width, int(capture_1440.width * (h_board / w_board))))
    capture_resized = capture_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    canvas_w = target_w * 2 + 40
    canvas_h = target_h + header_h + 30
    canvas_desktop = Image.new('RGB', (canvas_w, canvas_h), (250, 248, 245))
    draw_d = ImageDraw.Draw(canvas_desktop)
    
    draw_d.text((20, 18), "A. PRANCHA ORIGINAL APROVADA", fill=(21, 46, 68))
    draw_d.text((target_w + 30, 18), "C. IMPLEMENTACAO CORRIGIDA (NAVEGADOR REAL 1440px)", fill=(221, 80, 36))
    
    canvas_desktop.paste(board_resized, (20, header_h))
    canvas_desktop.paste(capture_resized, (target_w + 30, header_h))
    canvas_desktop.save(os.path.join(evidencias_dir, 'comparacao_lado_a_lado_desktop.png'), quality=95)
    print("Desktop comparison salvo.")

    # 2. Painel de Responsividade (1440, 1280, 768, 390, 360)
    res_list = [
        ('1440px Desktop', '01_home_desktop_1440.png', 320),
        ('1280px Laptop', '02_home_laptop_1280.png', 300),
        ('768px Tablet', '03_home_tablet_768.png', 240),
        ('390px Mobile iPhone', '04_home_mobile_390.png', 160),
        ('360px Mobile Android', '05_home_mobile_360.png', 150)
    ]
    
    total_w = sum(w for _, _, w in res_list) + 60
    panel_h = 750
    panel = Image.new('RGB', (total_w, panel_h), (245, 243, 240))
    draw_p = ImageDraw.Draw(panel)
    
    draw_p.text((20, 15), "PAINEL RESPONSIVO HOMOLOGADO (1440px, 1280px, 768px, 390px, 360px)", fill=(21, 46, 68))
    
    curr_x = 20
    for label, filename, width in res_list:
        img_p = os.path.join(evidencias_dir, filename)
        if os.path.exists(img_p):
            im = Image.open(img_p)
            aspect = im.height / im.width
            target_thumb_h = min(int(width * aspect), 640)
            im_thumb = im.resize((width, target_thumb_h), Image.Resampling.LANCZOS)
            draw_p.text((curr_x, 45), label, fill=(100, 115, 130))
            panel.paste(im_thumb, (curr_x, 68))
            curr_x += width + 10
            
    panel.save(os.path.join(evidencias_dir, 'comparacao_responsividade_multi_resolucao.png'), quality=95)
    print("Multi-resolution panel salvo.")

if __name__ == '__main__':
    create_all_comparisons()
