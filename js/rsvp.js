(function () {
  const form = document.getElementById("rsvp-form");
  if (!form) return;

  const status = document.getElementById("rsvp-status");

  // Submissions are stored via the Cloudflare Pages Function at
  // functions/api/rsvp.js (backed by Supabase — see supabase/schema.sql
  // and README for setup). Guests attending get their auto-assigned
  // reception table number back in the response. A name that isn't on the
  // guest list is never blocked — the list only powers the live
  // suggestions below, via functions/api/guest-suggest.js.
  const ENDPOINT = "/api/rsvp";
  const SUGGEST_ENDPOINT = "/api/guest-suggest";

  const nameInput = document.getElementById("rsvp-name");
  const suggestionsList = document.getElementById("rsvp-name-suggestions");
  let suggestTimer = null;

  if (nameInput && suggestionsList) {
    nameInput.addEventListener("input", () => {
      const query = nameInput.value.trim();
      clearTimeout(suggestTimer);
      if (query.length < 2) {
        suggestionsList.innerHTML = "";
        return;
      }
      suggestTimer = setTimeout(async () => {
        try {
          const response = await fetch(`${SUGGEST_ENDPOINT}?q=${encodeURIComponent(query)}`);
          if (!response.ok) return;
          const result = await response.json();
          suggestionsList.innerHTML = "";
          (result.names || []).forEach((name) => {
            const option = document.createElement("option");
            option.value = name;
            suggestionsList.appendChild(option);
          });
        } catch {
          // Suggestions are a nicety — silently ignore failures.
        }
      }, 200);
    });
  }

  function setStatus(state, message) {
    status.textContent = message;
    status.setAttribute("data-state", state);
  }

  // Confetti bursts from wherever the RSVP section currently sits in the
  // viewport, then the page scrolls back up to the hero once the guest has
  // had a moment to see it.
  function celebrateAndScrollHome() {
    if (typeof confetti === "function") {
      const rect = form.getBoundingClientRect();
      const origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: Math.min(Math.max(rect.top / window.innerHeight, 0), 1),
      };
      confetti({
        particleCount: 140,
        spread: 90,
        startVelocity: 45,
        origin,
        colors: ["#7a4a44", "#d9b8b0", "#c9a24b", "#f7f3f0"],
      });
    }

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1400);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Honeypot: if this hidden field has a value, silently drop the
    // submission (a real visitor never fills it in).
    const honeypot = form.querySelector('[name="bot-field"]');
    const isBot = !!(honeypot && honeypot.value);

    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    setStatus("pending", "Sending your RSVP…");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          attending: formData.get("attending"),
          guests: formData.get("guests"),
          message: formData.get("message"),
          botField: isBot,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "request_failed");
      }

      if (result.attending) {
        if (result.tableNumber) {
          setStatus(
            "success",
            `You're confirmed! We can't wait to celebrate with you — you've been seated at Table ${result.tableNumber}.`
          );
        } else {
          setStatus(
            "success",
            "You're confirmed! We're finalizing seating and will follow up with your table assignment soon."
          );
        }
      } else {
        setStatus("success", "Thanks for letting us know — you'll be missed!");
      }

      form.reset();
      if (suggestionsList) suggestionsList.innerHTML = "";
      celebrateAndScrollHome();
    } catch (error) {
      setStatus("error", "Something went wrong. Please try again or reach out directly.");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
