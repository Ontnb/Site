document.addEventListener("DOMContentLoaded", () => {
    const scrollContainer = document.querySelector(".gallery-scroll");
    const scrollbarThumb = document.querySelector(".scrollbar-thumb");
    const scrollbar = document.querySelector(".scrollbar");
    const openContactsButton = document.getElementById("open-contacts");
    const contactsModal = document.getElementById("contacts-modal");
    const closeButton = document.querySelector(".close-button");

    // Функция для обновления положения ползунка
    function updateScrollbarThumb() {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const scrollPercentage = scrollContainer.scrollLeft / maxScroll;
        const thumbPosition =
          scrollPercentage * (scrollbar.offsetWidth - scrollbarThumb.offsetWidth);
        scrollbarThumb.style.left = `${thumbPosition}px`;
    }

    // Добавляем событие scroll для обновления положения ползунка
    scrollContainer.addEventListener("scroll", updateScrollbarThumb);

    // Сохраняем и восстанавливаем позицию прокрутки при перезагрузке страницы
    window.addEventListener("beforeunload", () => {
        localStorage.setItem("scrollPosition", scrollContainer.scrollLeft);
    });
    const savedScrollPosition = localStorage.getItem("scrollPosition");
    if (savedScrollPosition) {
        scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
        localStorage.removeItem("scrollPosition");
    }

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
});
