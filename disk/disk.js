document.addEventListener("DOMContentLoaded", () => {
  const portfolioItems = document.querySelectorAll(".portfolio-item img");
  const fullscreenOverlay = document.getElementById("fullscreen-overlay");
  const fullscreenImage = document.getElementById("fullscreen-image");
  const prevButton = document.getElementById("prev-button");
  const nextButton = document.getElementById("next-button");
  const closeButton = document.getElementById("close-button");
  const openContactsButton = document.getElementById("open-contacts");
  const contactsModal = document.getElementById("contacts-modal");
  const modalCloseButton = document.querySelector(".close-button");
  const downloadAllButton = document.getElementById("download-all");
  const downloadFullButton = document.getElementById("download-full");

  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let scale = 1;

  // Для перемещения изображения при обычном драгировании (если зум не pinch-gesture)
  let currentTranslateX = 0;
  let currentTranslateY = 0;
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  // Переменные для pinch-to-zoom
  let isPinching = false;
  let initialPinchDistance = 0;

  // ===================== Lazy Loading с Intersection Observer =====================
  function lazyLoadImages() {
    const observerOptions = {
      root: null, // Используем viewport как область наблюдения
      rootMargin: "0px", // Отступы вокруг области наблюдения
      threshold: 0.1, // Изображение начнет загружаться, когда 10% его площади будет видно
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src; // Загружаем изображение
          img.removeAttribute("data-src"); // Удаляем атрибут data-src
          observer.unobserve(img); // Прекращаем наблюдение за изображением
        }
      });
    }, observerOptions);

    // Назначаем наблюдение для каждого изображения
    portfolioItems.forEach((img) => {
      img.dataset.src = img.src; // Сохраняем оригинальный src в data-src
      img.src = ""; // Очищаем src, чтобы изображение не загружалось сразу
      observer.observe(img); // Начинаем наблюдение
    });
  }

  // Инициализация lazy loading
  lazyLoadImages();

  // ===================== Остальной код =====================
  // Функция открытия полноэкранного изображения
  function showFullscreen(index) {
    currentIndex = index;
    fullscreenImage.src = portfolioItems[index].src;
    scale = 1;
    currentTranslateX = 0;
    currentTranslateY = 0;
    fullscreenImage.style.transition = ""; // сброс анимации
    // Сброс transformOrigin на центр по умолчанию (до начала жеста)
    fullscreenImage.style.transformOrigin = "50% 50%";
    fullscreenImage.style.transform = `scale(${scale}) translate(0px, 0px)`;
    fullscreenImage.classList.remove("zoomed");
    startX = 0;
    startY = 0;
    fullscreenOverlay.classList.add("open");
    fullscreenOverlay.style.display = "flex";
    document.addEventListener("keydown", handleKeyboardNavigation);
  }

  // Функция закрытия полноэкранного изображения
  function hideFullscreen() {
    fullscreenOverlay.classList.remove("open");
    setTimeout(() => {
      fullscreenOverlay.style.display = "none";
    }, 300);
    document.removeEventListener("keydown", handleKeyboardNavigation);
  }

  // Перелистывание изображений с анимацией
  function navigate(direction) {
    fullscreenImage.classList.add("fade-out");
    setTimeout(() => {
      currentIndex += direction;
      if (currentIndex < 0) {
        currentIndex = portfolioItems.length - 1;
      } else if (currentIndex >= portfolioItems.length) {
        currentIndex = 0;
      }
      fullscreenImage.src = portfolioItems[currentIndex].src;
      scale = 1;
      currentTranslateX = 0;
      currentTranslateY = 0;
      fullscreenImage.style.transition = "";
      // Сброс transformOrigin на центр
      fullscreenImage.style.transformOrigin = "50% 50%";
      fullscreenImage.style.transform = `scale(${scale}) translate(0px, 0px)`;
      fullscreenImage.classList.remove("zoomed");
      startX = 0;
      startY = 0;
      fullscreenImage.classList.remove("fade-out");
    }, 300);
  }

  // Обработка навигации с клавиатуры (стрелки и Esc)
  function handleKeyboardNavigation(event) {
    if (event.key === "ArrowLeft") {
      navigate(-1);
    } else if (event.key === "ArrowRight") {
      navigate(1);
    } else if (event.key === "Escape") {
      hideFullscreen();
    }
  }

  // Навешиваем обработчик клика на превью изображений
  portfolioItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      showFullscreen(index);
    });
  });

  // Обработчики для кнопок закрытия и навигации
  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    hideFullscreen();
  });

  fullscreenOverlay.addEventListener("click", (event) => {
    if (event.target === fullscreenOverlay) {
      hideFullscreen();
    }
  });

  prevButton.addEventListener("click", (event) => {
    event.stopPropagation();
    navigate(-1);
  });

  nextButton.addEventListener("click", (event) => {
    event.stopPropagation();
    navigate(1);
  });

  // ===================== Обработка касаний на мобильных устройствах =====================
  fullscreenImage.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1 && !isPinching) {
      // Один палец – начинаем свайп или drag, если изображение зумировано (но не pinch)
      touchStartX = e.touches[0].screenX;
      if (scale > 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    } else if (e.touches.length === 2) {
      // Начало pinch-to-zoom
      isPinching = true;
      // Сброс данных для свайпа
      touchStartX = null;
      touchEndX = null;
      // Рассчитываем центр жеста относительно изображения
      const rect = fullscreenImage.getBoundingClientRect();
      const centerX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
      const centerY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
      fullscreenImage.style.transformOrigin = `${centerX}px ${centerY}px`;
      // Запоминаем начальное расстояние между пальцами
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      initialPinchDistance = Math.hypot(x2 - x1, y2 - y1);
    }
  });

  fullscreenImage.addEventListener("touchmove", (e) => {
    if (isPinching && e.touches.length === 2) {
      // Обработка pinch-to-zoom: изменяем масштаб по разности расстояний пальцев
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;
      const currentDistance = Math.hypot(x2 - x1, y2 - y1);
      let newScale = 1 + (currentDistance - initialPinchDistance) * 0.01;
      scale = Math.max(1, Math.min(3, newScale));
      fullscreenImage.style.transition = ""; // отключаем анимацию во время жеста
      fullscreenImage.style.transform = `scale(${scale})`;
      if (scale > 1) {
        fullscreenImage.classList.add("zoomed");
      } else {
        fullscreenImage.classList.remove("zoomed");
      }
    } else if (isDragging && e.touches.length === 1 && scale > 1 && !isPinching) {
      // Обработка drag увеличенного изображения (один палец)
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - startX;
      const dy = y - startY;
      startX = x;
      startY = y;
      currentTranslateX += dx;
      currentTranslateY += dy;
      fullscreenImage.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
    }
  });

  fullscreenImage.addEventListener("touchend", (e) => {
    if (isPinching && e.touches.length < 2) {
      // По окончании pinch-gesture: плавно анимируем возвращение в исходное состояние,
      // при этом transformOrigin остаётся равным установленной ранее точке
      isPinching = false;
      fullscreenImage.style.transition = "transform 0.3s ease";
      scale = 1;
      fullscreenImage.style.transform = `scale(${scale})`;
      fullscreenImage.classList.remove("zoomed");
      // НЕ сбрасываем transformOrigin – так анимация будет исходить из точки увеличения
      currentTranslateX = 0;
      currentTranslateY = 0;
      setTimeout(() => {
        fullscreenImage.style.transition = "";
      }, 300);
    }
    if (!isPinching && e.changedTouches.length === 1) {
      if (scale === 1 && touchStartX !== null) {
        // Если изображение не увеличено – обрабатываем свайп
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }
      isDragging = false;
    }
  });

  function handleSwipe() {
    if (touchStartX === null || touchEndX === null) return;
    if (touchEndX < touchStartX - 50) {
      navigate(1);
    } else if (touchEndX > touchStartX + 50) {
      navigate(-1);
    }
  }

  // ===================== Обработка зума для ПК (колесо мыши) =====================
  fullscreenImage.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    scale = Math.max(1, Math.min(3, scale + delta));
    // При зуме через колесо сбрасываем смещение (если нужно)
    currentTranslateX = 0;
    currentTranslateY = 0;
    fullscreenImage.style.transform = `scale(${scale}) translate(0px, 0px)`;
    if (scale > 1) {
      fullscreenImage.classList.add("zoomed");
    } else {
      fullscreenImage.classList.remove("zoomed");
    }
  });

  // ===================== Работа с модальным окном контактов =====================
  openContactsButton.addEventListener("click", () => {
    contactsModal.style.display = "flex";
  });

  modalCloseButton.addEventListener("click", () => {
    contactsModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === contactsModal) {
      contactsModal.style.display = "none";
    }
  });

  // ===================== Функционал "Download All" =====================
  downloadAllButton.addEventListener("click", async () => {
    const zip = new JSZip();
    downloadAllButton.textContent = "Downloading...";
    downloadAllButton.disabled = true;
    try {
      for (let i = 0; i < portfolioItems.length; i++) {
        const img = portfolioItems[i];
        const url = img.src;
        let filename = img.alt || `image_${i + 1}`;
        const fileExtension = url.substring(url.lastIndexOf("."));
        filename += fileExtension;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${url}`);
        }
        const blob = await response.blob();
        zip.file(filename, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = "images.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (error) {
      console.error("Error downloading images:", error);
      alert("An error occurred while downloading the images. Please try again.");
    } finally {
      downloadAllButton.textContent = "Download All";
      downloadAllButton.disabled = false;
    }
  });

  // ===================== Функционал "Download Full" =====================
  downloadFullButton.addEventListener("click", (event) => {
    event.stopPropagation(); // чтобы клик не срабатывал на фоне (например, закрытие полноэкранного режима)
    const imgURL = fullscreenImage.src;
    // Попытка извлечь имя файла из URL, можно задать значение по умолчанию, если не удалось.
    let filename = imgURL.substring(imgURL.lastIndexOf('/') + 1) || "downloaded_image.webp";

    // Создаём временный элемент ссылки для инициирования скачивания
    const a = document.createElement("a");
    a.href = imgURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});