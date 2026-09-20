(function () {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  // Drop image files into assets/images/ and list them here to replace
  // the placeholder tiles. Example: ["engagement-1.jpg", "engagement-2.jpg"]
  const photos = [];

  if (photos.length === 0) {
    return; // placeholder tiles already in the markup are shown as-is
  }

  grid.innerHTML = "";
  photos.forEach((filename) => {
    const item = document.createElement("div");
    item.className = "gallery-item";

    const img = document.createElement("img");
    img.src = `assets/images/${filename}`;
    img.alt = "";
    img.loading = "lazy";

    item.appendChild(img);
    grid.appendChild(item);
  });
})();
