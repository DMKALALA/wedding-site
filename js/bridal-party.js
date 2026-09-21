// Add your bridal party here. Each entry needs a name and role; photo is
// optional — leave it out and a placeholder tile is shown instead.
// Example:
// { name: "Jane Doe", role: "Maid of Honor", photo: "assets/images/jane-web.jpg" }
const BRIDAL_PARTY = {
  bride: { name: "Clèda Mputu", role: "Bride", photo: "assets/images/_DSC4849_Bride-web.jpg" },
  groom: { name: "Denis Kalala", role: "Groom", photo: "assets/images/_DSC4909_Groom-web.jpg" },
  // TODO: swap these placeholder names for the real roster.
  groomsmen: [
    { name: "Groomsman 3", role: "Best Man", photo: "assets/images/groomsman_3.png" },
    { name: "Groomsman 5", role: "Groomsman", photo: "assets/images/groomsman_5.png" },
    { name: "Groomsman 7", role: "Groomsman", photo: "assets/images/groomsman_7.png" },
    { name: "Groomsman 8", role: "Groomsman", photo: "assets/images/groomsman_8.png" },
    { name: "Groomsman 9", role: "Groomsman", photo: "assets/images/groomsman_9.png" },
    { name: "Groomsman 10", role: "Groomsman", photo: "assets/images/groomsman_10.png" },
  ],
  bridesmaids: [
    { name: "Bridesmaid 3", role: "Maid of Honor", photo: "assets/images/bridesmaid_3.png" },
    { name: "Bridesmaid 2", role: "Bridesmaid", photo: "assets/images/bridesmaid_2.png" },
    { name: "Bridesmaid 1", role: "Bridesmaid", photo: "assets/images/bridesmaid_1.png" },
    { name: "Bridesmaid 4", role: "Bridesmaid", photo: "assets/images/bridesmaid_4.png" },
    { name: "Bridesmaid 5", role: "Bridesmaid", photo: "assets/images/bridesmaid_5.png" },
    { name: "Bridesmaid 6", role: "Bridesmaid", photo: "assets/images/bridesmaid_6.png" },
  ],
  planners: [],
};

(function () {
  const modal = document.getElementById("party-modal");
  const modalImage = document.getElementById("party-modal-image");
  const modalPlaceholder = document.getElementById("party-modal-placeholder");
  const modalName = document.getElementById("party-modal-name");
  const modalRole = document.getElementById("party-modal-role");
  const modalClose = document.getElementById("party-modal-close");

  let lastFocused = null;

  function openModal(member) {
    if (!modal) return;
    lastFocused = document.activeElement;

    if (member.photo) {
      modalImage.src = member.photo;
      modalImage.hidden = false;
      modalPlaceholder.hidden = true;
    } else {
      modalImage.hidden = true;
      modalPlaceholder.hidden = false;
    }
    modalName.textContent = member.name;
    modalRole.textContent = member.role;

    modal.classList.add("is-open");
    document.body.classList.add("no-scroll");
    modalClose.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (lastFocused) lastFocused.focus();
  }

  if (modal) {
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  function buildCard(member) {
    const card = document.createElement("div");
    card.className = "party-card";
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.setAttribute("aria-label", `${member.name}, ${member.role}`);

    const photo = document.createElement("div");
    photo.className = "party-photo";

    if (member.photo) {
      const img = document.createElement("img");
      img.src = member.photo;
      img.alt = "";
      img.loading = "lazy";
      photo.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "party-photo-placeholder";
      placeholder.textContent = "Photo coming soon";
      photo.appendChild(placeholder);
    }

    const overlay = document.createElement("div");
    overlay.className = "party-photo-overlay";
    const name = document.createElement("p");
    name.className = "party-name";
    name.textContent = member.name;
    overlay.appendChild(name);
    photo.appendChild(overlay);

    const role = document.createElement("p");
    role.className = "party-role";
    role.textContent = member.role;

    card.appendChild(photo);
    card.appendChild(role);

    card.addEventListener("click", () => openModal(member));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(member);
      }
    });

    return card;
  }

  function renderGroup(containerId, members) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (members.length === 0) {
      grid.classList.add("party-grid-empty");
      grid.innerHTML = `
        <div class="party-card">
          <div class="party-photo">
            <div class="party-photo-placeholder">Add names in<br />js/bridal-party.js</div>
          </div>
        </div>
      `;
      return;
    }

    grid.classList.remove("party-grid-empty");
    grid.innerHTML = "";
    members.forEach((member) => grid.appendChild(buildCard(member)));
  }

  const coupleGrid = document.getElementById("couple-grid");
  if (coupleGrid) {
    coupleGrid.innerHTML = "";
    coupleGrid.appendChild(buildCard(BRIDAL_PARTY.groom));
    coupleGrid.appendChild(buildCard(BRIDAL_PARTY.bride));
  }

  renderGroup("groomsmen-grid", BRIDAL_PARTY.groomsmen);
  renderGroup("bridesmaids-grid", BRIDAL_PARTY.bridesmaids);
  renderGroup("planners-grid", BRIDAL_PARTY.planners);
})();
