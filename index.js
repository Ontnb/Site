document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".gallery-scroll");
  const scrollbarThumb = document.querySelector(".scrollbar-thumb");
  const scrollbar = document.querySelector(".scrollbar");
  const openContactsButton = document.getElementById("open-contacts");
  const contactsModal = document.getElementById("contacts-modal");
  const closeButton = document.querySelector(".close-button");

  // Функция для обновления размера и положения ползунка скроллбара
  function updateScrollbarThumb() {
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const scrollPercentage = maxScroll ? scrollContainer.scrollLeft / maxScroll : 0;
    const thumbWidth = (scrollContainer.clientWidth / scrollContainer.scrollWidth) * scrollbar.offsetWidth;
    scrollbarThumb.style.width = thumbWidth + "px";
    const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
    const thumbLeft = scrollPercentage * maxThumbLeft;
    scrollbarThumb.style.left = thumbLeft + "px";
  }

  // Вводим переменную для хранения целевой позиции прокрутки и флаг анимации
  let targetScrollLeft = scrollContainer.scrollLeft;
  let isAnimating = false;

  // Обработчик для горизонтальной прокрутки колесом мыши
  scrollContainer.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      
      // Определяем, является ли событие от тачпада (обычно deltaMode = 0 и дробные значения)
      const isTrackpad =
        event.deltaMode === 0 &&
        (Math.abs(event.deltaY) % 1 !== 0 || Math.abs(event.deltaX) % 1 !== 0);
      
      let delta = event.deltaY;
      if (isTrackpad) {
        delta = -delta;
      }
      
      // Увеличиваем целевую позицию с учетом коэффициента
      const smoothFactor = 7; // экспериментируйте с этим значением
      targetScrollLeft += delta * smoothFactor;
      
      // Ограничиваем целевое значение в допустимых пределах
      targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, scrollContainer.scrollWidth - scrollContainer.clientWidth));
      
      // Запускаем анимацию прокрутки
      if (!isAnimating) {
        animateScroll();
      }
    },
    { passive: false }
  );

  // Функция анимации прокрутки
  function animateScroll() {
    isAnimating = true;
    const currentScroll = scrollContainer.scrollLeft;
    const diff = targetScrollLeft - currentScroll;
    
    // Если разница незначительная, прекращаем анимацию
    if (Math.abs(diff) < 0.5) {
      scrollContainer.scrollLeft = targetScrollLeft;
      isAnimating = false;
      updateScrollbarThumb();
      return;
    }
    
    // Плавно приближаем текущую позицию к целевой
    scrollContainer.scrollLeft = currentScroll + diff * 0.03; // коэффициент 0.1 определяет скорость анимации
    updateScrollbarThumb();
    
    requestAnimationFrame(animateScroll);
  }

  // Перетаскивание (drag) кастомного ползунка
  let isDragging = false;
  let startX;
  let startScrollLeft;

  scrollbarThumb.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startScrollLeft = scrollContainer.scrollLeft;
    scrollbarThumb.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const thumbWidth = scrollbarThumb.offsetWidth;
    const maxThumbLeft = scrollbar.offsetWidth - thumbWidth;
    const scrollRatio = (scrollContainer.scrollWidth - scrollContainer.clientWidth) / maxThumbLeft;
    scrollContainer.scrollLeft = startScrollLeft + dx * scrollRatio;
    // Когда пользователь вручную двигает скроллбар, синхронизируем целевую позицию
    targetScrollLeft = scrollContainer.scrollLeft;
    updateScrollbarThumb();
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      scrollbarThumb.style.cursor = "grab";
      document.body.style.userSelect = "auto";
    }
  });

  // Сохранение позиции прокрутки галереи при перезагрузке страницы
  window.addEventListener("beforeunload", () => {
    localStorage.setItem("scrollPosition", scrollContainer.scrollLeft);
  });

  // Восстановление позиции прокрутки и обновление скроллбара
  const savedScrollPosition = localStorage.getItem("scrollPosition");
 if (savedScrollPosition) {
  scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
  targetScrollLeft = scrollContainer.scrollLeft; // синхронизируем целевое значение
  localStorage.removeItem("scrollPosition");
 }

  // Обновление скроллбара после загрузки изображений
  window.addEventListener("load", () => {
    updateScrollbarThumb();
  });

  // Открытие модального окна контактов
  openContactsButton.addEventListener("click", () => {
    contactsModal.style.display = "flex";
  });

  // Закрытие модального окна контактов
  closeButton.addEventListener("click", () => {
    contactsModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === contactsModal) {
      contactsModal.style.display = "none";
    }
  });
});