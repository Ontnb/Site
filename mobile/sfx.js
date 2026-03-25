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

    // ===== ADD SEEK OVERLAY =====
    const seekOverlay = document.createElement('div');
    seekOverlay.style.position = 'absolute';
    seekOverlay.style.top = '50%';
    seekOverlay.style.left = '50%';
    seekOverlay.style.transform = 'translate(-50%, -50%)';
    seekOverlay.style.fontSize = '24px';
    seekOverlay.style.color = 'white';
    seekOverlay.style.background = 'rgba(0,0,0,0.5)';
    seekOverlay.style.padding = '10px 15px';
    seekOverlay.style.borderRadius = '10px';
    seekOverlay.style.opacity = '0';
    seekOverlay.style.transition = 'opacity 0.3s ease';
    seekOverlay.style.pointerEvents = 'none';
    seekOverlay.style.zIndex = '20';
    container.appendChild(seekOverlay);

    function showSeekOverlay(text) {
      seekOverlay.textContent = text;
      seekOverlay.style.opacity = '1';
      setTimeout(() => {
        seekOverlay.style.opacity = '0';
      }, 600);
    }

    if (!video.src) {
      video.src = video.getAttribute('data-src');
    }

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      video.addEventListener('webkitbeginfullscreen', function(e) {
        e.preventDefault();
      });
      if (video.requestFullscreen) {
        video.requestFullscreen = () => Promise.reject('Fullscreen disabled on iOS');
      }
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
    container.addEventListener('touchstart', showControls);

    video.addEventListener('play', () => {
      scheduleHide();
    });

    video.addEventListener('pause', () => {
      clearTimeout(hideControlsTimeout);
      showControls();
    });

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

    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const progressPercentage = (video.currentTime / video.duration) * 100;
        progressBar.style.width = progressPercentage + '%';

        if (bufferBar) {
  if (video.buffered.length > 0) {
    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
    const bufferPercentage = (bufferedEnd / video.duration) * 100;
    bufferBar.style.width = bufferPercentage + '%';
  } else {
    bufferBar.style.width = '0%';
  }
}
      }
    });

    progressBarContainer.addEventListener('click', (event) => {
      showControls();
      const rect = progressBarContainer.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const ratio = clickX / rect.width;
      if (video.duration) {
        video.currentTime = ratio * video.duration;
      }
    });

    video.addEventListener('ended', () => {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
      clearTimeout(hideControlsTimeout);
      showControls();
    });

    // ===== DOUBLE TAP SEEK =====
    let lastTap = 0;

    container.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < 300 && tapLength > 0) {
        const rect = container.getBoundingClientRect();
        const tapX = e.changedTouches[0].clientX - rect.left;

        const isLeft = tapX < rect.width / 2;

        if (video.duration) {
          if (isLeft) {
            video.currentTime = Math.max(0, video.currentTime - 15);
            showSeekOverlay('⏪ 15s');
          } else {
            video.currentTime = Math.min(video.duration, video.currentTime + 15);
            showSeekOverlay('15s ⏩');
          }
        }
      }

      lastTap = currentTime;
    });
  });
});