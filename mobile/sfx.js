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
    const bufferBar = progressBarContainer.querySelector('.buffer-bar');
    const videoControls = container.querySelector('.video-controls');

    // ===== SEEK OVERLAY =====
    const seekOverlay = document.createElement('div');
    Object.assign(seekOverlay.style, {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '18px',
      color: '#808080',
      background: 'rgba(0,0,0,0.5)',
      padding: '8px 12px',
      borderRadius: '10px',
      opacity: '0',
      transition: 'opacity 0.25s ease',
      pointerEvents: 'none',
      zIndex: '20',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    });
    container.appendChild(seekOverlay);

    function showSeekOverlay(html, isLeft) {
      seekOverlay.innerHTML = html;
      seekOverlay.style.left = isLeft ? '20%' : 'auto';
      seekOverlay.style.right = isLeft ? 'auto' : '20%';
      seekOverlay.style.opacity = '1';

      setTimeout(() => {
        seekOverlay.style.opacity = '0';
      }, 500);
    }

    if (!video.src) {
      video.src = video.getAttribute('data-src');
    }

    function pauseOtherVideos() {
      videoContainers.forEach(otherContainer => {
        const otherVideo = otherContainer.querySelector('.portfolio-video');
        const otherIcon = otherContainer.querySelector('.center-button i');
        if (otherVideo !== video && !otherVideo.paused) {
          otherVideo.pause();
          otherIcon.classList.replace('fa-pause', 'fa-play');
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

    // ===== TAP =====
    let tapTimeout = null;
    let lastTap = 0;
    let startX = 0;
    let startY = 0;
    let wasControlsHiddenOnTouchStart = false;

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      wasControlsHiddenOnTouchStart = videoControls.classList.contains('hidden');
    });

    container.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      if (Math.abs(endX - startX) > 10 || Math.abs(endY - startY) > 10) return;
      if (e.target.closest('.progress-bar-container')) return;

      const now = Date.now();
      const delta = now - lastTap;

      if (delta < 300 && delta > 0) {
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
        tapTimeout = setTimeout(() => {
          if (wasControlsHiddenOnTouchStart) {
            showControls();
            return;
          }
          togglePlay();
        }, 250);
      }

      lastTap = now;
    });

    // ===== BUTTON (FINAL FIX) =====
    let ignoreNextClick = false;

    function togglePlay() {
      showControls();

      if (video.paused) {
        pauseOtherVideos();
        video.play();
        icon.classList.replace('fa-play', 'fa-pause');
      } else {
        video.pause();
        icon.classList.replace('fa-pause', 'fa-play');
      }
    }

    playPauseButton.addEventListener('touchend', (e) => {
      e.stopPropagation();
      ignoreNextClick = true;
      togglePlay();
    });

    playPauseButton.addEventListener('click', (e) => {
      e.stopPropagation();

      if (ignoreNextClick) {
        ignoreNextClick = false;
        return;
      }

      togglePlay();
    });

    // ===== PROGRESS =====
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = progress + '%';

        if (bufferBar && video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          bufferBar.style.width = (bufferedEnd / video.duration) * 100 + '%';
        }
      }
    });

    progressBarContainer.addEventListener('click', (e) => {
      showControls();

      const rect = progressBarContainer.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;

      if (video.duration) {
        video.currentTime = ratio * video.duration;
      }
    });

    video.addEventListener('ended', () => {
      icon.classList.replace('fa-pause', 'fa-play');
      clearTimeout(hideControlsTimeout);
      showControls();
    });
  });
});