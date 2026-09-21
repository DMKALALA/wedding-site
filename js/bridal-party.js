// Add your bridal party here. Each entry needs a name and role; photo is
// optional — leave it out and a placeholder tile is shown instead.
// Example:
// { name: "Jane Doe", role: "Maid of Honor", photo: "assets/images/jane-web.jpg" }
const BRIDAL_PARTY = {
  bride: { name: "Clèda Mputu", role: "Bride", photo: "assets/images/_DSC4849_Bride-web.jpg" },
  groom: { name: "Denis Kalala", role: "Groom", photo: "assets/images/_DSC4909_Groom-web.jpg" },
  groomsmen: [],
  bridesmaids: [],
  planners: [],
};

(function () {
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

    const toggle = () => card.classList.toggle("is-active");
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
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
