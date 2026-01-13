#!/usr/bin/env python3
"""
Скрипт для создания мобильной версии HTML файла sfx.html
Видео сортируются по числовому значению в именах файлов
"""

import os
import re

# Параметры каталогов и файлов
VIDEO_DIR = '../sfx'  # Путь относительно папки mobile
PRVW_DIR = os.path.join(VIDEO_DIR, 'prvw')
OUTPUT_HTML = 'sfx.html'

# Допустимые расширения для видео и превью
VIDEO_EXTS = ('.mp4', '.webm')
PRVW_EXTS = ('.jpg', '.webp')


def extract_number(filename):
    """Извлекает число из имени файла для сортировки."""
    match = re.search(r'\d+', filename)
    return int(match.group()) if match else 0


def get_sorted_video_files():
    """Получает и сортирует видеофайлы по числу в имени."""
    video_files = []
    if not os.path.exists(VIDEO_DIR):
        print(f"Папка {VIDEO_DIR} не существует.")
        return video_files

    for item in os.listdir(VIDEO_DIR):
        path = os.path.join(VIDEO_DIR, item)
        if os.path.isfile(path) and item.lower().endswith(VIDEO_EXTS):
            video_files.append(item)
    
    return sorted(video_files, key=extract_number)


def find_preview(video_filename):
    """Находит соответствующее превью для видеофайла."""
    base, _ = os.path.splitext(video_filename)
    for ext in PRVW_EXTS:
        preview_name = base + ext
        preview_path = os.path.join(PRVW_DIR, preview_name)
        if os.path.exists(preview_path):
            return preview_name
    return None


def generate_video_item(video_file):
    """Генерирует HTML-блок для одного видео."""
    preview_file = find_preview(video_file)
    if not preview_file:
        print(f'Превью для видео {video_file} не найдено. Пропускаем.')
        return None

    return f'''        <div class="portfolio-item">
          <div class="video-container">
            <video class="portfolio-video" data-src="{VIDEO_DIR}/{video_file}" playsinline poster="{PRVW_DIR}/{preview_file}" preload="metadata">
              Ваш браузер не поддерживает тег video.
            </video>
            <div class="video-controls">
              <div class="progress-bar-container">
                <div class="progress-bar"></div>
              </div>
              <div class="controls"></div>
            </div>
            <button class="control-button play-pause-button center-button">
              <i class="fas fa-play"></i>
            </button>
          </div>
          <p class="photo-caption"><!-- Подпись (если нужна) --></p>
        </div>
'''


def create_html(video_items):
    """Создает полный HTML-документ."""
    return f'''<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0, viewport-fit: cover" name="viewport"/>
  <title>ontn.art</title>
  <link href="sfx.css" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
  <link href="https://fonts.googleapis.com/css2?family=Courier+New:wght@400;700&amp;display=swap" rel="stylesheet"/>
  <link crossorigin="anonymous" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==" referrerpolicy="no-referrer" rel="stylesheet"/>
</head>
<body>
  <a class="pics-link" href="index.html">Pics</a>
  <a href="vids.html" class="vids-link">Vids</a>
  <a class="home-link" href="index.html">Home</a>
  <button class="contacts-link" id="open-contacts">Contacts</button>

  <main class="portfolio-container">
    <div class="portfolio-list">
{video_items}
    </div>
  </main>

  <div class="modal" id="contacts-modal">
    <div class="modal-content">
      <span class="close-button">×</span>
      <div class="contact-info">
        <p>Tg: @onton_b</p>
        <p>Ig: @ontn_b</p>
        <p>Email: ontn_b@bk.ru</p>
      </div>
    </div>
  </div>

  <script src="sfx.js"></script>
</body>
</html>
'''


def main():
    video_files = get_sorted_video_files()
    if not video_files:
        print('Нет видеофайлов для обработки.')
        return

    video_items = []
    for video_file in video_files:
        item_html = generate_video_item(video_file)
        if item_html:
            video_items.append(item_html)
            print(f'Добавлено видео: {video_file}')

    with open(OUTPUT_HTML, 'w', encoding='utf-8') as f:
        f.write(create_html('\n'.join(video_items)))
    print(f'Мобильная версия "{OUTPUT_HTML}" создана с {len(video_items)} видео.')


if __name__ == '__main__':
    main()