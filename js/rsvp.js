(function () {
  const form = document.getElementById("rsvp-form");
  if (!form) return;

  const status = document.getElementById("rsvp-status");

  // --- Hosting switch -----------------------------------------------
  // Netlify Forms (default): works automatically once deployed on
  // Netlify, no endpoint needed — Netlify detects the form at build time
  // because of the data-netlify="true" attribute on the <form> in
  // index.html.
  //
  // Using a different host? Switch to Formspree instead:
  //   1. Set FORM_ENDPOINT below to your Formspree endpoint,
  //      e.g. "https://formspree.io/f/xxxxxxx"
  //   2. Set USE_NETLIFY to false.
  const USE_NETLIFY = true;
  const FORM_ENDPOINT = ""; // Formspree endpoint, if USE_NETLIFY is false

  function encode(data) {
    return Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join("&");
  }

  function setStatus(state, message) {
    status.textContent = message;
    status.setAttribute("data-state", state);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Honeypot: if this hidden field has a value, silently drop the
    // submission (a real visitor never fills it in).
    const honeypot = form.querySelector('[name="bot-field"]');
    if (honeypot && honeypot.value) {
      return;
    }

    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    setStatus("pending", "Sending your RSVP…");

    try {
      if (USE_NETLIFY) {
        const data = {};
        formData.forEach((value, key) => (data[key] = value));
        await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encode(data),
        });
      } else {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        });
        if (!response.ok) throw new Error("Submission failed");
      }

      setStatus("success", "Thank you! Your RSVP has been received.");
      form.reset();
    } catch (error) {
      setStatus("error", "Something went wrong. Please try again or reach out directly.");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
