async function cargarEquipos() {
  try {
    const res = await fetch("http://localhost:3000/api/nba/teams");
    const equipos = await res.json();
    const contenedor = document.getElementById("team-list");

    equipos.forEach(team => {
      const card = document.createElement("div");
      card.classList.add("team-card");
      card.innerHTML = `
        <div class="team-name">${team.full_name} (${team.abbreviation})</div>
        <div class="team-info">Ciudad: ${team.city}</div>
        <div class="team-info">Conferencia: ${team.conference || 'N/A'}</div>
        <div class="team-info">División: ${team.division || 'N/A'}</div>
      `;
      contenedor.appendChild(card);
    });

  } catch (err) {
    console.error("Error cargando equipos:", err);
  }
}

// Llamamos a la función cuando carga la página
cargarEquipos();
