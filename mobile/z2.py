import os
from pathlib import Path

def generate_html_for_folder(folder_number):
    # Укажите имя папки с медиафайлами
    media_folder_name = str(folder_number)

    # Получаем текущую директорию, где находится скрипт (папка "mobile")
    current_directory = Path(__file__).parent

    # Путь к корневой папке (на один уровень выше папки "mobile")
    root_directory = current_directory.parent

    # Относительный путь к папке с медиафайлами
    media_folder_path = root_directory / media_folder_name

    # Проверяем, существует ли папка с медиафайлами
    if not media_folder_path.exists():
        print(f"Папка с медиафайлами '{media_folder_path}' не найдена, пропускаем...")
        return

    # Имя выходного HTML-файла (соответствует имени папки с медиафайлами)
    output_html_filename = f"{media_folder_name}.html"

    # Относительный путь к выходному HTML-файлу (в папке "mobile")
    output_html_path = current_directory / output_html_filename

    # Шаблон HTML-файла
    html_template = """
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>ontn.art</title>
    <link rel="stylesheet" href="2.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Courier+New:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body>

    <!-- Кнопки навигации -->
    <a href="vids.html" class="vids-link">Vids</a>
    <a href="sfx.html" class="sfx-link">SFX</a>
    <a href="index.html" class="home-link">Home</a>
    <button class="contacts-link" id="open-contacts">Contacts</button>

    <main class="portfolio-container">
       <div class="portfolio-scroll-wrapper">
        <div class="portfolio-scroll">
"""

    # Функция для создания HTML-кода для видео
    def create_video_html(video_filename, poster_filename):
        return f"""
            <div class="portfolio-item">
                <div class="video-container">
                    <video class="portfolio-video" preload="metadata" src="../{media_folder_name}/{video_filename}" poster="../{media_folder_name}/{poster_filename}" playsinline webkit-playsinline>
                        Ваш браузер не поддерживает тег video.
                    </video>
                    <div class="video-controls">
                        <div class="progress-bar-container">
                            <div class="progress-bar"></div>
                        </div>
                        <div class="controls">
                            <button class="control-button play-pause-button"><i class="fas fa-play"></i></button>
                        </div>
                    </div>
                </div>
            </div>
    """

    # Функция для создания HTML-кода для фото
    def create_photo_html(photo_filename):
        return f"""
            <div class="portfolio-item">
                <img src="../{media_folder_name}/{photo_filename}" alt="{photo_filename}">
                <p class="photo-caption"><!-- Подпись --></p>
            </div>
    """

    # Сканируем папку с медиафайлами
    media_files = os.listdir(media_folder_path)

    # Сортируем файлы по имени
    media_files.sort()

    # Множество для хранения имен файлов, которые уже использовались как превью для видео
    used_posters = set()

    # Обрабатываем каждый файл
    for filename in media_files:
        if filename.endswith((".mp4", ".webm")):
            # Если это видео, создаем HTML-код для видео и используем соответствующее фото как превью
            poster_filename = os.path.splitext(filename)[0] + ".webp"
            if poster_filename in media_files:
                html_template += create_video_html(filename, poster_filename)
                # Добавляем имя фото в множество использованных превью
                used_posters.add(poster_filename)
        elif filename.endswith((".jpg", ".webp")):
            # Если это фото, добавляем его только если оно не использовалось как превью для видео
            if filename not in used_posters:
                html_template += create_photo_html(filename)

    # Завершаем HTML-шаблон
    html_template += """
        </div>
       </div>
    </main>

    <!-- Модальное окно контактов -->
    <div id="contacts-modal" class="modal">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <div class="contact-info">
                <p>Tg: @onton_b</p>
                <p>Ig: @ontn_b</p>
                <p>Email: ontn_b@bk.ru</p>
            </div>
        </div>
    </div>

    <script src="2.js"></script>
</body>
</html>
"""

    # Сохраняем HTML-файл
    with open(output_html_path, "w", encoding="utf-8") as file:
        file.write(html_template)

    print(f"HTML-файл успешно создан: {output_html_path}")

# Выполняем генерацию для папок от 2 до 40, пропуская 21
for i in range(2, 41):
    if i == 21:
        continue
    generate_html_for_folder(i)