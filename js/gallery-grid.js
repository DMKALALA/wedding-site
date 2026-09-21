// Builds a grid of photo tiles into `grid` and wires each one to open the
// shared lightbox (see lightbox.js). Used by both the homepage teaser
// gallery and the full gallery page.
function renderGalleryGrid(grid, photos) {
  if (!grid || photos.length === 0) return;

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

    const openThisPhoto = () => {
      if (window.WeddingLightbox) window.WeddingLightbox.open(photos, index);
    };
    item.addEventListener("click", openThisPhoto);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openThisPhoto();
      }
    });

    grid.appendChild(item);
  });
}
