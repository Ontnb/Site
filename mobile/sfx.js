document.addEventListener("DOMContentLoaded", () => {
  const videoContainers = document.querySelectorAll('.video-container');

  videoContainers.forEach(container => {
    const video = container.querySelector('.portfolio-video');
    const playPauseButton = container.querySelector('.center-button');
    const icon = playPauseButton.querySelector('i');
    const progressBarContainer = container.querySelector('.progress-bar-container');
    const progressBar = container.querySelector('.progress-bar');
    const videoControls = container.querySelector('.video-controls');

    // ===== SEEK OVERLAY =====
    const seekOverlay = document.createElement('div');
    seekOverlay.style.position = 'absolute';
    seekOverlay.style.top = '50%';
    seekOverlay.style.transform = 'translateY(-50%)';
    seekOverlay.style.fontSize = '18px';
    seekOverlay.style.color = '#808080';
    seekOverlay.style.background = 'rgba(0,0,0,0.5)';
    seekOverlay.style.padding = '8px 12px';
    seekOverlay.style.borderRadius = '10px';
    seekOverlay.style.opacity = '0';
    seekOverlay.style.transition = 'opacity 0.25s ease';
    seekOverlay.style.pointerEvents = 'none';
    seekOverlay.style.zIndex = '20';
    seekOverlay.style.display = 'flex';
    seekOverlay.style.alignItems = 'center';
    seekOverlay.style.gap = '6px';
    container.appendChild(seekOverlay);

    function showSeekOverlay(html, isLeft) {
      seekOverlay.innerHTML = html;

      if (isLeft) {
        seekOverlay.style.left = '20%';
        seekOverlay.style.right = 'auto';
      } else {
        seekOverlay.style.right = '20%';
        seekOverlay.style.left = 'auto';
      }

      seekOverlay.style.opacity = '1';

      setTimeout(() => {
        seekOverlay.style.opacity = '0';
      }, 500);
    }

    if (!video.src) {
      video.src = video.getAttribute('data-src');
    }

    function pauseOtherVideos() {
      videoContainers.forEach(other => {
        const v = other.querySelector('.portfolio-video');
        const i = other.querySelector('.center-button i');
        if (v !== video && !v.paused) {
          v.pause();
          i.classList.replace('fa-pause', 'fa-play');
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
    // TAP SYSTEM
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

      if (wasDragging) {
        wasDragging = false;
        return;
      }

      if (e.target.closest('.progress-bar-container')) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      if (Math.abs(endX - startX) > 10 || Math.abs(endY - startY) > 10) return;

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
          if (isLeft) {
            video.currentTime = Math.max(0, video.currentTime - 10);
            showSeekOverlay('<i class="fas fa-rotate-left"></i> 10s', true);
          } else {
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
            showSeekOverlay('10s <i class="fas fa-rotate-right"></i>', false);
          }
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
    // BUTTON
    // =========================

    playPauseButton.addEventListener('touchend', (e) => e.stopPropagation());

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
    // SEEK CLICK
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
    // DRAG SEEK
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
        progressBar.style.width =
          (video.currentTime / video.duration) * 100 + '%';
      }
    });

    video.addEventListener('ended', () => {
      icon.classList.replace('fa-pause', 'fa-play');
      showControls();
    });
  });
});