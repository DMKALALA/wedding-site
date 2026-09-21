// Add your bridal party here. Each entry needs a name and role; photo is
// optional — leave it out and a placeholder tile is shown instead.
// Example:
// { name: "Jane Doe", role: "Maid of Honor", photo: "assets/images/jane-web.jpg" }
const BRIDAL_PARTY = {
  bride: { name: "Clèda Mputu", role: "Bride", photo: "assets/images/_DSC4849_Bride-web.jpg" },
  groom: {
    name: "Denis Kalala",
    role: "Groom",
    photo: "assets/images/_DSC4909_Groom-web.jpg",
    imagePosition: "10% center",
  },
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
  planners: [
    {
      name: "EmoPlanner",
      role: "Monique & Enoch, Wedding Planners",
      instagram: "https://www.instagram.com/emoplanner/",
      photo: "assets/images/Wedding_Planners.png",
      fit: "contain",
      squarePhoto: true,
    },
  ],
};

const INSTAGRAM_ICON_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">' +
  '<path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.3-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1 .1-1.6.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.3-.3.9-.3 1.9C3.2 8.5 3.2 8.9 3.2 12s0 3.5.1 4.7c.1 1 .2 1.6.3 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.1.9.3 1.9.3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.3.3-.9.3-1.9.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.3-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.1-.9-.3-1.9-.3-1.2-.1-1.6-.1-4.7-.1zm0 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4zm5.7-2a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0z"/>' +
  "</svg>";

function buildInstagramLink(member, extraClass) {
  const link = document.createElement("a");
  link.href = member.instagram;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = `party-instagram-link ${extraClass}`;
  link.setAttribute("aria-label", `View ${member.name} on Instagram`);
  link.innerHTML = INSTAGRAM_ICON_SVG;
  link.addEventListener("click", (event) => event.stopPropagation());
  return link;
}

(function () {
  const modal = document.getElementById("party-modal");
  const modalImage = document.getElementById("party-modal-image");
  const modalPlaceholder = document.getElementById("party-modal-placeholder");
  const modalName = document.getElementById("party-modal-name");
  const modalRole = document.getElementById("party-modal-role");
  const modalInstagram = document.getElementById("party-modal-instagram");
  const modalPhoto = document.getElementById("party-modal-photo");
  const modalClose = document.getElementById("party-modal-close");

  let lastFocused = null;

  function openModal(member) {
    if (!modal) return;
    lastFocused = document.activeElement;

    if (member.photo) {
      modalImage.src = member.photo;
      modalImage.style.objectFit = member.fit || "cover";
      modalImage.style.objectPosition = member.imagePosition || "center";
      modalImage.hidden = false;
      modalPlaceholder.hidden = true;
    } else {
      modalImage.hidden = true;
      modalPlaceholder.hidden = false;
    }
    modalPhoto.classList.toggle("party-modal-photo-square", !!member.squarePhoto);

    modalName.textContent = member.name;
    modalRole.textContent = member.role;

    const existingLink = modalInstagram.querySelector(".party-instagram-link");
    if (existingLink) existingLink.remove();
    if (member.instagram) {
      modalInstagram.appendChild(buildInstagramLink(member, "party-instagram-link-modal"));
      modalInstagram.hidden = false;
    } else {
      modalInstagram.hidden = true;
    }

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
      if (member.fit) img.style.objectFit = member.fit;
      if (member.imagePosition) img.style.objectPosition = member.imagePosition;
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
    if (member.instagram) {
      card.appendChild(buildInstagramLink(member, "party-instagram-link-card"));
    }

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
