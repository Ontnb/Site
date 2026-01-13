document.addEventListener("DOMContentLoaded", () => {
  // Элементы для управления модальным окном
  const openContactsButton = document.getElementById("open-contacts");
  const contactsModal = document.getElementById("contacts-modal");
  const closeButton = document.querySelector(".close-button");

  // Открытие модального окна
  openContactsButton.addEventListener("click", () => {
    contactsModal.style.display = "flex";
  });

  // Закрытие модального окна
  closeButton.addEventListener("click", () => {
    contactsModal.style.display = "none";
  });

  // Закрытие модального окна при клике вне его
  window.addEventListener("click", (event) => {
    if (event.target === contactsModal) {
      contactsModal.style.display = "none";
    }
  });

  // Инициализация управления видео
  const videoContainers = document.querySelectorAll('.video-container');

  videoContainers.forEach(container => {
    const video = container.querySelector('.portfolio-video');
    const playPauseButton = container.querySelector('.center-button');
    const icon = playPauseButton.querySelector('i');
    const progressBarContainer = container.querySelector('.progress-bar-container');
    const progressBar = container.querySelector('.progress-bar');
    // Получаем элемент буферизации
    const bufferBar = progressBarContainer.querySelector('.buffer-bar');
    const videoControls = container.querySelector('.video-controls');

    // Устанавливаем src из data-src, если он не задан
    if (!video.src) {
      video.src = video.getAttribute('data-src');
    }

    // Заблокировать полноэкранный режим для iPhone/iPad
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      video.addEventListener('webkitbeginfullscreen', function(e) {
        e.preventDefault();
      });
      if (video.requestFullscreen) {
        video.requestFullscreen = () => Promise.reject('Fullscreen disabled on iOS');
      }
    }

    // Функция для остановки всех видеороликов, кроме текущего
    function pauseOtherVideos() {
      videoContainers.forEach(otherContainer => {
        const otherVideo = otherContainer.querySelector('.portfolio-video');
        const otherIcon = otherContainer.querySelector('.center-button i');
        if (otherVideo !== video && !otherVideo.paused) {
          otherVideo.pause();
          otherIcon.classList.remove('fa-pause');
          otherIcon.classList.add('fa-play');
        }
      });
    }

    // Управление видимостью элементов управления
    let hideControlsTimeout;

    function showControls() {
      videoControls.classList.remove('hidden');
      playPauseButton.classList.remove('hidden');
      // Если видео воспроизводится, запускаем таймер на скрытие
      if (!video.paused) {
        scheduleHide();
      } else {
        clearTimeout(hideControlsTimeout);
      }
    }

    function hideControls() {
      videoControls.classList.add('hidden');
      playPauseButton.classList.add('hidden');
    }

    function scheduleHide() {
      clearTimeout(hideControlsTimeout);
      if (!video.paused) {
        hideControlsTimeout = setTimeout(hideControls, 3000);
      }
    }

    // Обработчики взаимодействия – показываем элементы управления
    container.addEventListener('mousemove', showControls);
    container.addEventListener('touchstart', showControls);

    // При старте воспроизведения запускаем таймер скрытия
    video.addEventListener('play', () => {
      scheduleHide();
    });

    // При паузе или остановке отменяем скрытие и делаем элементы видимыми
    video.addEventListener('pause', () => {
      clearTimeout(hideControlsTimeout);
      showControls();
    });

    // Управление воспроизведением и паузой по клику на центральную кнопку
    playPauseButton.addEventListener('click', (e) => {
      showControls();
      if (video.paused) {
        pauseOtherVideos();
        video.play();
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
      } else {
        video.pause();
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
      }
      e.stopPropagation();
    });

    // Обновление прогресс-бара и полосы буферизации в соответствии с текущим временем видео
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const progressPercentage = (video.currentTime / video.duration) * 100;
        progressBar.style.width = progressPercentage + '%';
        // Обновление буферной полосы
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const bufferPercentage = (bufferedEnd / video.duration) * 100;
          bufferBar.style.width = bufferPercentage + '%';
        } else {
          bufferBar.style.width = '0%';
        }
      }
    });

    // Перемотка видео при клике на прогресс-бар
    progressBarContainer.addEventListener('click', (event) => {
      showControls();
      const rect = progressBarContainer.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const ratio = clickX / rect.width;
      if (video.duration) {
        video.currentTime = ratio * video.duration;
      }
    });

    // Если видео закончилось, возвращаем иконку play и отменяем скрытие элементов
    video.addEventListener('ended', () => {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
      clearTimeout(hideControlsTimeout);
      showControls();
    });
  });
});
