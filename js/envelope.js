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

  // Arriving with a link to a specific section (e.g. nav links from the
  // full gallery page, or a direct #rsvp link) should land there directly
  // instead of forcing the intro animation again.
  const targetHash = window.location.hash;
  if (targetHash && targetHash !== "#" && targetHash !== "#home") {
    overlay.remove();
    const target = document.querySelector(targetHash);
    if (target) {
      // Jump instantly (bypassing the page's smooth-scroll CSS, which
      // would otherwise animate toward a target whose position is still
      // shifting) once web fonts have finished loading and swapping in,
      // since that's what moves section positions during initial load.
      const jump = () => target.scrollIntoView({ behavior: "instant" });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => requestAnimationFrame(jump));
      } else {
        requestAnimationFrame(jump);
      }
    }
    return;
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
