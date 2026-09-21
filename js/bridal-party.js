// Add your bridal party here. Each entry needs a name and role; photo is
// optional — leave it out and a placeholder tile is shown instead.
// Example:
// { name: "Jane Doe", role: "Maid of Honor", photo: "assets/images/jane-web.jpg" }
const BRIDAL_PARTY = {
  bridesmaids: [],
  groomsmen: [],
};

(function () {
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
    members.forEach((member) => {
      const card = document.createElement("div");
      card.className = "party-card";

      const photo = document.createElement("div");
      photo.className = "party-photo";
      if (member.photo) {
        const img = document.createElement("img");
        img.src = member.photo;
        img.alt = member.name;
        img.loading = "lazy";
        photo.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "party-photo-placeholder";
        placeholder.textContent = "Photo coming soon";
        photo.appendChild(placeholder);
      }

      const name = document.createElement("p");
      name.className = "party-name";
      name.textContent = member.name;

      const role = document.createElement("p");
      role.className = "party-role";
      role.textContent = member.role;

      card.appendChild(photo);
      card.appendChild(name);
      card.appendChild(role);
      grid.appendChild(card);
    });
  }

  renderGroup("bridesmaids-grid", BRIDAL_PARTY.bridesmaids);
  renderGroup("groomsmen-grid", BRIDAL_PARTY.groomsmen);
})();
