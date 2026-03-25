document.addEventListener("DOMContentLoaded", () => {
  const openContactsButton = document.getElementById("open-contacts");
  const contactsModal = document.getElementById("contacts-modal");
  const closeButton = document.querySelector(".close-button");

  openContactsButton.addEventListener("click", () => {
    contactsModal.style.display = "flex";
  });

  closeButton.addEventListener("click", () => {
    contactsModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === contactsModal) {
      contactsModal.style.display = "none";
    }
  });

  const videoContainers = document.querySelectorAll('.video-container');

  videoContainers.forEach(container => {
    const video = container.querySelector('.portfolio-video');
    const playPauseButton = container.querySelector('.center-button');
    const icon = playPauseButton.querySelector('i');
    const progressBarContainer = container.querySelector('.progress-bar-container');
    const progressBar = container.querySelector('.progress-bar');
    const videoControls = container.querySelector('.video-controls');

    // ===== INIT VIDEO =====
    if (!video.src) {
      video.src = video.getAttribute('data-src');
    }

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

    // ===== CONTROLS =====
    let hideControlsTimeout;

    function showControls() {
      videoControls.classList.remove('hidden');
      playPauseButton.classList.remove('hidden');

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

    container.addEventListener('mousemove', showControls);
    video.addEventListener('play', scheduleHide);
    video.addEventListener('pause', showControls);

    // ===== YOUTUBE-STYLE SEEK =====
    let isSeeking = false;

    function updateSeek(clientX) {
      const rect = progressBarContainer.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));

      if (video.duration) {
        video.currentTime = ratio * video.duration;
        progressBar.style.width = (ratio * 100) + '%';
      }
    }

    progressBarContainer.addEventListener('pointerdown', (e) => {
      isSeeking = true;
      progressBarContainer.setPointerCapture(e.pointerId);

      updateSeek(e.clientX);
    });

    progressBarContainer.addEventListener('pointermove', (e) => {
      if (!isSeeking) return;
      updateSeek(e.clientX);
    });

    progressBarContainer.addEventListener('pointerup', (e) => {
      isSeeking = false;
      progressBarContainer.releasePointerCapture(e.pointerId);
    });

    progressBarContainer.addEventListener('pointercancel', () => {
      isSeeking = false;
    });

    // ===== TAP (БЕЗ КОНФЛИКТОВ) =====
    let tapTimeout = null;
    let lastTap = 0;
    let wasControlsHiddenOnTouchStart = false;

    container.addEventListener('pointerdown', (e) => {
      // игнорируем если жмут по прогрессу
      if (e.target.closest('.progress-bar-container')) return;

      wasControlsHiddenOnTouchStart = videoControls.classList.contains('hidden');
    });

    container.addEventListener('pointerup', (e) => {
      if (e.target.closest('.progress-bar-container')) return;

      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < 300 && tapLength > 0) {
        clearTimeout(tapTimeout);

        const rect = container.getBoundingClientRect();
        const tapX = e.clientX - rect.left;
        const isLeft = tapX < rect.width / 2;

        if (video.duration) {
          if (isLeft) {
            video.currentTime = Math.max(0, video.currentTime - 10);
          } else {
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
          }
        }

      } else {
        tapTimeout = setTimeout(() => {

          if (wasControlsHiddenOnTouchStart) {
            showControls();
            return;
          }

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

        }, 200);
      }

      lastTap = currentTime;
    });

    // ===== BUTTON =====
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

    // ===== PROGRESS UPDATE =====
    video.addEventListener('timeupdate', () => {
      if (video.duration && !isSeeking) {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = progress + '%';
      }
    });

    video.addEventListener('ended', () => {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
      showControls();
    });
  });
});