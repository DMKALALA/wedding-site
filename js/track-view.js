// Fire-and-forget page view ping for the wedding-dashboard app (separate
// repo) to read. Never throws, never delays the page.
(function () {
  try {
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking must never break the page.
  }
})();
