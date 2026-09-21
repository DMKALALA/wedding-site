(function () {
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  function setOpen(isOpen) {
    links.classList.toggle("is-open", isOpen);
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => {
    setOpen(!links.classList.contains("is-open"));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
})();
