document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) { window.location.href = "login.html"; return; }

  await loadHeader();
  await loadFooter();

  cargarFavoritos(user.id);
});

// Header / Footer
async function loadHeader() {
  document.getElementById("header-placeholder").innerHTML =
    await fetch("header.html").then(r => r.text());
}
async function loadFooter() {
  document.getElementById("footer-placeholder").innerHTML =
    await fetch("footer.html").then(r => r.text());
}

// Cargar favoritos
async function cargarFavoritos(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/favorites/${userId}`);
    const favoritos = await res.json();

    const contenedor = document.getElementById("favorites-list");
    contenedor.innerHTML = "";

    favoritos.forEach(fav => {
      const card = document.createElement("div");
      card.className = "team-card";
      card.innerHTML = `
        <div class="team-card-inner">
          <div class="team-card-front">
            <img class="team-logo" src="logos/${fav.team_name.replace(/\s/g,'_')}.png" alt="${fav.team_name}">
            <div class="team-name">${fav.team_name}</div>
            <div class="team-info">Liga: ${fav.league}</div>
            <button class="remove-fav">❌ Quitar</button>
          </div>
        </div>
      `;

      contenedor.appendChild(card);

      card.querySelector(".remove-fav").onclick = async (e) => {
        e.stopPropagation();
        await fetch("http://localhost:3000/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            league: fav.league,
            teamId: fav.team_id
          })
        });
        card.remove();
      };
    });
  } catch (err) {
    console.error("Error cargando favoritos:", err);
  }
}
