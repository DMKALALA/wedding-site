(function () {
  const root = document.getElementById("countdown");
  if (!root || typeof WEDDING_CONFIG === "undefined") return;

  const targetDate = new Date(WEDDING_CONFIG.date).getTime();
  const els = {
    days: document.getElementById("countdown-days"),
    hours: document.getElementById("countdown-hours"),
    minutes: document.getElementById("countdown-minutes"),
    seconds: document.getElementById("countdown-seconds"),
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const now = Date.now();
    const diff = targetDate - now;

    if (Number.isNaN(targetDate) || diff <= 0) {
      root.setAttribute("data-state", "arrived");
      Object.values(els).forEach((el) => el && (el.textContent = "00"));
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (els.days) els.days.textContent = pad(days);
    if (els.hours) els.hours.textContent = pad(hours);
    if (els.minutes) els.minutes.textContent = pad(minutes);
    if (els.seconds) els.seconds.textContent = pad(seconds);
  }

  tick();
  window.setInterval(tick, 1000);
})();
