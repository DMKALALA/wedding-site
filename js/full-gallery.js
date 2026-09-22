(function () {
  const grid = document.getElementById("full-gallery-grid");
  if (!grid) return;

  const photos = [
    "2I3A1060-web.jpg",
    "DSC05078-web.jpg",
    "DSC05183-web.jpg",
    "DSC09907-web.jpg",
    "DSC09907-2-web.jpg",
    "DSC09919-Edit-web.jpg",
    "DSC09919-Edit-2-web.jpg",
    "DSC09920-web.jpg",
    "DSC09932_pic5-web.jpg",
    "_DSC0239-Edit-web.jpg",
    "_DSC0239-Edit-3-web.jpg",
    "_DSC4849_Bride-web.jpg",
    "_DSC4850-web.jpg",
    "_DSC4851-web.jpg",
    "_DSC4858-web.jpg",
    "_DSC4869-web.jpg",
    "_DSC4877_pic2-web.jpg",
    "_DSC4878-web.jpg",
    "_DSC4878-2-web.jpg",
    "_DSC4895_hero_-web.jpg",
    "_DSC4895-2-web.jpg",
    "_DSC4909_Groom-web.jpg",
    "_DSC4916-web.jpg",
    "_DSC4920_pic1-web.jpg",
    "_DSC4921-web.jpg",
    "_DSC4929-web.jpg",
    "_DSC4939_Pic3-web.jpg",
    "_DSC4975-web.jpg",
    "_DSC4979-web.jpg",
    "_DSC4987-web.jpg",
    "_DSC5002-web.jpg",
    "_DSC5004-web.jpg",
    "_DSC5006-web.jpg",
    "_DSC5028-web.jpg",
  ];

  renderGalleryGrid(grid, photos);
})();
