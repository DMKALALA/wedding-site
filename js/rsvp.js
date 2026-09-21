(function () {
  const form = document.getElementById("rsvp-form");
  if (!form) return;

  const status = document.getElementById("rsvp-status");

  // Submissions are verified against the guest list and stored via the
  // Netlify Function at netlify/functions/rsvp.js (backed by Supabase —
  // see supabase/schema.sql and README for setup). Guests attending get
  // their auto-assigned reception table number back in the response.
  const ENDPOINT = "/.netlify/functions/rsvp";

  function setStatus(state, message) {
    status.textContent = message;
    status.setAttribute("data-state", state);
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
    setStatus("pending", "Checking your invitation…");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          inviteCode: formData.get("inviteCode"),
          email: formData.get("email"),
          attending: formData.get("attending"),
          guests: formData.get("guests"),
          message: formData.get("message"),
          botField: isBot,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "not_found") {
          setStatus(
            "error",
            "We couldn't find that invite code. Please double check what you entered, or reach out to us directly."
          );
        } else {
          throw new Error(result.error || "request_failed");
        }
        return;
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
    } catch (error) {
      setStatus("error", "Something went wrong. Please try again or reach out directly.");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
