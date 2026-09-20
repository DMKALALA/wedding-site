(function () {
  const overlay = document.getElementById("envelope-overlay");
  if (!overlay) return;

  const envelope = document.getElementById("envelope");
  const enterBtn = document.getElementById("envelope-enter");
  const skipLink = document.getElementById("envelope-skip");
  const cardNames = document.getElementById("envelope-card-names");
  const cardDate = document.getElementById("envelope-card-date");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (typeof WEDDING_CONFIG !== "undefined") {
    cardNames.textContent = `${WEDDING_CONFIG.partner1} & ${WEDDING_CONFIG.partner2}`;
    cardDate.textContent = WEDDING_CONFIG.displayDate;
  }

  document.body.classList.add("no-scroll");

  function openEnvelope() {
    if (overlay.classList.contains("is-open")) return;
    overlay.classList.add("is-open");
    if (prefersReducedMotion) {
      enterBtn.focus();
    }
  }

  function dissolve() {
    overlay.classList.add("is-dissolving");
    document.body.classList.remove("no-scroll");
    window.setTimeout(() => {
      overlay.remove();
    }, prefersReducedMotion ? 0 : 650);
  }

  envelope.addEventListener("click", openEnvelope);

  envelope.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEnvelope();
    }
  });

  enterBtn.addEventListener("click", dissolve);

  skipLink.addEventListener("click", (event) => {
    event.preventDefault();
    dissolve();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dissolve();
    }
  });
})();
