(function () {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  if (!lightbox || !lightboxImage || !closeBtn || !prevBtn || !nextBtn) return;

  let photos = [];
  let currentIndex = 0;
  let lastFocused = null;

  function showPhoto(index) {
    currentIndex = (index + photos.length) % photos.length;
    lightboxImage.src = `assets/images/${photos[currentIndex]}`;
    lightboxImage.alt = `Photo ${currentIndex + 1} of ${photos.length}`;
  }

  function open(photoList, index) {
    photos = photoList;
    lastFocused = document.activeElement;
    showPhoto(index);
    lightbox.classList.add("is-open");
    document.body.classList.add("no-scroll");
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (lastFocused) lastFocused.focus();
  }

  closeBtn.addEventListener("click", close);
  nextBtn.addEventListener("click", () => showPhoto(currentIndex + 1));
  prevBtn.addEventListener("click", () => showPhoto(currentIndex - 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowRight") showPhoto(currentIndex + 1);
    if (event.key === "ArrowLeft") showPhoto(currentIndex - 1);
  });

  window.WeddingLightbox = { open };
})();
