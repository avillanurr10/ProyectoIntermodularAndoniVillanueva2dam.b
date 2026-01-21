document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  await loadHeader();
  await loadFooter();

  const logoutLink = document.getElementById("nav-logout");
  logoutLink.style.display = "inline";
  logoutLink.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  const nbaSection = document.getElementById("nba-section");
  nbaSection.style.display = "block";
  cargarEquipos();

  // Modal
  const closeBtn = document.getElementById("modal-close");
  const modal = document.getElementById("team-modal");
  closeBtn.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
  });
});

// Header / Footer
async function loadHeader() {
  const headerHtml = await fetch("header.html").then(r => r.text());
  document.getElementById("header-placeholder").innerHTML = headerHtml;
}
async function loadFooter() {
  const footerHtml = await fetch("footer.html").then(r => r.text());
  document.getElementById("footer-placeholder").innerHTML = footerHtml;
}

// GOOGLE CHARTS
google.charts.load("current", { packages: ["corechart"] });

const teamLogos = {
  "Atlanta Hawks": "ATL.png",
  "Boston Celtics": "BOS.png",
  "Brooklyn Nets": "BKN.png",
  "Charlotte Hornets": "CHA.png",
  "Chicago Bulls": "CHI.png",
  "Cleveland Cavaliers": "CLE.png",
  "Dallas Mavericks": "DAL.png",
  "Denver Nuggets": "DEN.png",
  "Detroit Pistons": "DET.png",
  "Golden State Warriors": "GSW.png",
  "Houston Rockets": "HOU.png",
  "Indiana Pacers": "IND.png",
  "Los Angeles Clippers": "LAC.png",
  "Los Angeles Lakers": "LAL.png",
  "Memphis Grizzlies": "MEM.png",
  "Miami Heat": "MIA.png",
  "Milwaukee Bucks": "MIL.png",
  "Minnesota Timberwolves": "MIN.png",
  "New Orleans Pelicans": "NOP.png",
  "New York Knicks": "NYK.png",
  "Oklahoma City Thunder": "OKC.png",
  "Orlando Magic": "ORL.png",
  "Philadelphia 76ers": "PHI.png",
  "Phoenix Suns": "PHX.png",
  "Portland Trail Blazers": "POR.png",
  "Sacramento Kings": "SAC.png",
  "San Antonio Spurs": "SAS.png",
  "Toronto Raptors": "TOR.png",
  "Utah Jazz": "UTA.png",
  "Washington Wizards": "WIZ.png"
};
async function cargarEquipos() {
  try {
    const res = await fetch("http://localhost:3000/api/nba/teams");
    const equipos = await res.json();

    // Jugadores
    await Promise.all(equipos.map(async team => {
      try {
        const resPlayers = await fetch(`http://localhost:3000/api/nba/players?team=${team.id}`);
        const jugadores = await resPlayers.json();
        team.numPlayers = jugadores.length || 0;
        team.avgAge = jugadores.length
          ? Math.round(jugadores.reduce((sum, p) => sum + (p.age || 0), 0) / jugadores.length)
          : 0;
      } catch {
        team.numPlayers = 0;
        team.avgAge = 0;
      }
    }));

    mostrarEquipos(equipos);

    google.charts.setOnLoadCallback(() => {
      dibujarGraficoConferencia(equipos);
      dibujarGraficoDivision(equipos);
      dibujarGraficoCiudades(equipos);
      dibujarGraficoJugadores(equipos);
    });
  } catch (err) {
    console.error("Error cargando equipos:", err);
  }
}

function mostrarEquipos(equipos) {
  const contenedor = document.getElementById("team-list");
  contenedor.innerHTML = "";

  equipos.forEach(team => {
    const logoSrc = teamLogos[team.full_name] || `${team.abbreviation}.png`;

    const card = document.createElement("div");
    card.classList.add("team-card");
    card.innerHTML = `
      <div class="team-card-inner">
        <div class="team-card-front">
          <img class="team-logo" src="logos/${logoSrc}" alt="${team.full_name}" onerror="this.style.display='none'">
          <div class="team-name">${team.full_name}</div>
          <div class="team-info">Ciudad: ${team.city}</div>
          <div class="team-info">Conferencia: ${team.conference || "N/A"}</div>
          <div class="team-info">División: ${team.division || "N/A"}</div>
        </div>
        <div class="team-card-back">
          <div class="team-back-title">${team.full_name} Stats</div>
          <div class="team-back-stat">Número de jugadores: ${team.numPlayers}</div>
          <div class="team-back-stat">Edad promedio: ${team.avgAge}</div>
        </div>
      </div>
    `;
    contenedor.appendChild(card);

    card.addEventListener("click", () => {
      document.getElementById("modal-logo").src = `logos/${logoSrc}`;
      document.getElementById("modal-logo").alt = team.full_name;
      document.getElementById("modal-name").textContent = team.full_name;
      document.getElementById("modal-city").textContent = `Ciudad: ${team.city}`;
      document.getElementById("modal-conference").textContent = `Conferencia: ${team.conference || "N/A"}`;
      document.getElementById("modal-division").textContent = `División: ${team.division || "N/A"}`;
      document.getElementById("modal-stats").innerHTML = `
        <p>Número de jugadores: ${team.numPlayers}</p>
        <p>Edad promedio: ${team.avgAge}</p>
      `;
      document.getElementById("team-modal").style.display = "flex";
    });
  });
}

// GRÁFICOS
function dibujarGraficoConferencia(equipos) {
  const data = google.visualization.arrayToDataTable([
    ["Conferencia", "Equipos"],
    ["Este", equipos.filter(t => t.conference === "East").length],
    ["Oeste", equipos.filter(t => t.conference === "West").length]
  ]);
  const chart = new google.visualization.ColumnChart(document.getElementById("chart_conferences"));
  chart.draw(data, { title: "Equipos por Conferencia", legend: { position: "none" } });
}

function dibujarGraficoDivision(equipos) {
  const divisions = {};
  equipos.forEach(t => { divisions[t.division] = (divisions[t.division] || 0) + 1; });
  const data = google.visualization.arrayToDataTable([
    ["División", "Equipos"],
    ...Object.entries(divisions)
  ]);
  const chart = new google.visualization.PieChart(document.getElementById("chart_divisions"));
  chart.draw(data, { title: "Equipos por División" });
}

function dibujarGraficoCiudades(equipos) {
  const cityCounts = {};
  equipos.forEach(t => { 
    const c = t.city[0]; 
    cityCounts[c] = (cityCounts[c] || 0) + 1; 
  });
  const data = google.visualization.arrayToDataTable([
    ["Inicial Ciudad", "Equipos"],
    ...Object.entries(cityCounts)
  ]);
  const chart = new google.visualization.BarChart(document.getElementById("chart_cities"));
  chart.draw(data, { title: "Equipos por inicial de la ciudad", legend: { position: "none" } });
}

// NUEVO: gráfico de número de jugadores por equipo
function dibujarGraficoJugadores(equipos) {
  if (!equipos || equipos.length === 0) return;
  const data = google.visualization.arrayToDataTable([
    ["Equipo", "Jugadores"],
    ...equipos.map(t => [t.full_name, t.numPlayers || 0])
  ]);
  const chart = new google.visualization.ColumnChart(document.getElementById("chart_players"));
  chart.draw(data, { title: "Número de jugadores por equipo", legend: { position: "none" } });
}
