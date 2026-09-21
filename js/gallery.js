(function () {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  // Drop image files into assets/images/ and list them here to replace
  // the placeholder tiles. Example: ["engagement-1.jpg", "engagement-2.jpg"]
  const photos = [
    "_DSC4920_pic1-web.jpg",
    "_DSC4877_pic2-web.jpg",
    "_DSC4939_Pic3-web.jpg",
    "_DSC4895_hero_-web.jpg",
  ];

  if (photos.length === 0) {
    return; // placeholder tiles already in the markup are shown as-is
  }

  grid.innerHTML = "";
  photos.forEach((filename, index) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.setAttribute("aria-label", `View photo ${index + 1} of ${photos.length}`);

    const img = document.createElement("img");
    img.src = `assets/images/${filename}`;
    img.alt = "";
    img.loading = "lazy";

    item.appendChild(img);
    item.addEventListener("click", () => openLightbox(index));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
    grid.appendChild(item);
  });

  // ---------------------------------------------------------------- //
  // Lightbox                                                          //
  // ---------------------------------------------------------------- //
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  if (!lightbox || !lightboxImage || !closeBtn || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let lastFocused = null;

  function showPhoto(index) {
    currentIndex = (index + photos.length) % photos.length;
    lightboxImage.src = `assets/images/${photos[currentIndex]}`;
    lightboxImage.alt = `Photo ${currentIndex + 1} of ${photos.length}`;
  }

  function openLightbox(index) {
    lastFocused = document.activeElement;
    showPhoto(index);
    lightbox.classList.add("is-open");
    document.body.classList.add("no-scroll");
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (lastFocused) lastFocused.focus();
  }

  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", () => showPhoto(currentIndex + 1));
  prevBtn.addEventListener("click", () => showPhoto(currentIndex - 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") showPhoto(currentIndex + 1);
    if (event.key === "ArrowLeft") showPhoto(currentIndex - 1);
  });
})();
