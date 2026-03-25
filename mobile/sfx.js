document.addEventListener("DOMContentLoaded", () => {
  const videoContainers = document.querySelectorAll('.video-container');

  videoContainers.forEach(container => {
    const video = container.querySelector('.portfolio-video');
    const playPauseButton = container.querySelector('.center-button');
    const icon = playPauseButton.querySelector('i');
    const progressBarContainer = container.querySelector('.progress-bar-container');
    const progressBar = container.querySelector('.progress-bar');
    const videoControls = container.querySelector('.video-controls');

    if (!video.src) {
      video.src = video.getAttribute('data-src');
    }

    function pauseOtherVideos() {
      videoContainers.forEach(other => {
        const v = other.querySelector('.portfolio-video');
        const i = other.querySelector('.center-button i');
        if (v !== video && !v.paused) {
          v.pause();
          i.classList.remove('fa-pause');
          i.classList.add('fa-play');
        }
      });
    }

    let hideControlsTimeout;

    function showControls() {
      videoControls.classList.remove('hidden');
      playPauseButton.classList.remove('hidden');
      scheduleHide();
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

    video.addEventListener('play', scheduleHide);
    video.addEventListener('pause', showControls);

    // =========================
    // TAP / DOUBLE TAP / SCROLL
    // =========================

    let tapTimeout = null;
    let lastTap = 0;
    let startX = 0;
    let startY = 0;
    let wasDragging = false;

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    container.addEventListener('touchend', (e) => {

      // ❗ если был drag — игнорируем всё
      if (wasDragging) {
        wasDragging = false;
        return;
      }

      // ❗ игнор прогресс бара
      if (e.target.closest('.progress-bar-container')) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const moveX = Math.abs(endX - startX);
      const moveY = Math.abs(endY - startY);

      // ❗ игнор скролла
      if (moveX > 10 || moveY > 10) return;

      const controlsHidden = videoControls.classList.contains('hidden');

      const now = Date.now();
      const tapLength = now - lastTap;

      // ===== DOUBLE TAP =====
      if (tapLength < 300 && tapLength > 0) {
        clearTimeout(tapTimeout);

        const rect = container.getBoundingClientRect();
        const tapX = e.changedTouches[0].clientX - rect.left;
        const isLeft = tapX < rect.width / 2;

        if (video.duration) {
          video.currentTime += isLeft ? -10 : 10;
        }

      } else {
        // ===== SINGLE TAP =====
        tapTimeout = setTimeout(() => {

          if (controlsHidden) {
            showControls();
            return;
          }

          if (video.paused) {
            pauseOtherVideos();
            video.play();
            icon.classList.replace('fa-play', 'fa-pause');
          } else {
            video.pause();
            icon.classList.replace('fa-pause', 'fa-play');
          }

        }, 250);
      }

      lastTap = now;
    });

    // =========================
    // BUTTON FIX
    // =========================

    playPauseButton.addEventListener('touchend', (e) => {
      e.stopPropagation();
    });

    playPauseButton.addEventListener('click', (e) => {
      if (video.paused) {
        pauseOtherVideos();
        video.play();
        icon.classList.replace('fa-play', 'fa-pause');
      } else {
        video.pause();
        icon.classList.replace('fa-pause', 'fa-play');
      }
      e.stopPropagation();
    });

    // =========================
    // PROGRESS BAR CLICK
    // =========================

    progressBarContainer.addEventListener('click', (e) => {
      const rect = progressBarContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;

      if (video.duration) {
        video.currentTime = ratio * video.duration;
      }
    });

    // =========================
    // DRAG SEEK (ФИКС!)
    // =========================

    let isDragging = false;

    progressBarContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      wasDragging = true;
      updateSeek(e.touches[0]);
    });

    progressBarContainer.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSeek(e.touches[0]);
    });

    progressBarContainer.addEventListener('touchend', () => {
      isDragging = false;
    });

    function updateSeek(touch) {
      const rect = progressBarContainer.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));

      if (video.duration) {
        video.currentTime = ratio * video.duration;
        progressBar.style.width = (ratio * 100) + '%';
      }
    }

    // =========================
    // PROGRESS UPDATE
    // =========================

    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = percent + '%';
      }
    });

    video.addEventListener('ended', () => {
      icon.classList.replace('fa-pause', 'fa-play');
      showControls();
    });
  });
});