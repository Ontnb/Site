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

    let isDragging = false;
    let wasDragging = false;
    let wasControlsHiddenOnTouchStart = false;

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;

      wasControlsHiddenOnTouchStart = videoControls.classList.contains('hidden');
    });

    container.addEventListener('touchend', (e) => {
      if (wasDragging) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      if (Math.abs(endX - startX) > 10 || Math.abs(endY - startY) > 10) return;
      if (e.target.closest('.progress-bar-container')) return;

      const currentTime = Date.now();
      const tapLength = currentTime - lastTap;

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
        tapTimeout = setTimeout(() => {
          if (wasControlsHiddenOnTouchStart) {
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

      lastTap = currentTime;
    });

    playPauseButton.addEventListener('touchend', (e) => e.stopPropagation());

    playPauseButton.addEventListener('click', (e) => {
      showControls();

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

    video.addEventListener('timeupdate', () => {
      if (video.duration && !isDragging) {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = progress + '%';

        if (bufferBar && video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          bufferBar.style.width = (bufferedEnd / video.duration) * 100 + '%';
        }
      }
    });

    // ===== SEEK FIX =====
    let ignoreClick = false;

    function updateSeek(clientX) {
      const rect = progressBarContainer.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

      if (video.duration) {
        video.currentTime = ratio * video.duration;
        progressBar.style.width = (ratio * 100) + '%';
      }
    }

    progressBarContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      wasDragging = true;
      ignoreClick = true;

      updateSeek(e.touches[0].clientX);
      e.preventDefault();
    });

    progressBarContainer.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSeek(e.touches[0].clientX);
      e.preventDefault();
    });

    progressBarContainer.addEventListener('touchend', () => {
      isDragging = false;

      setTimeout(() => {
        wasDragging = false;
        ignoreClick = false;
      }, 50);
    });

    progressBarContainer.addEventListener('click', (e) => {
      if (ignoreClick) return;

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