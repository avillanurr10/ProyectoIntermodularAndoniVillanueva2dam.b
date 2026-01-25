document.addEventListener("DOMContentLoaded", async () => {
  await loadHeader(); // Cargar header primero
  await loadFooter(); // Cargar footer

  // ===== LOGUEADO =====
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    const profileLink = document.getElementById("nav-profile");
    if (profileLink) profileLink.style.display = "inline";

    const chatLink = document.getElementById("nav-chat");
    if (chatLink) chatLink.style.display = "inline";

    const logoutLink = document.getElementById("nav-logout");
    if (logoutLink) {
      logoutLink.style.display = "inline";
      logoutLink.addEventListener("click", e => {
        e.preventDefault();
        localStorage.removeItem("user");
        window.location.href = "login.html";
      });
    }
  }

  const nbaSection = document.getElementById("nba-section");
  nbaSection.style.display = "block";

  // ===== CARGAR CLASIFICACIÓN Y EQUIPOS =====
  await cargarClasificacion();
  await cargarEquipos();

  // ===== MODAL =====
  const modal = document.getElementById("team-modal");
  document.getElementById("modal-close").onclick = () => modal.style.display = "none";
  window.onclick = e => { if(e.target === modal) modal.style.display = "none"; };
});

// ===== HEADER / FOOTER =====
async function loadHeader() {
  document.getElementById("header-placeholder").innerHTML =
    await fetch("header.html").then(r => r.text());
}
async function loadFooter() {
  document.getElementById("footer-placeholder").innerHTML =
    await fetch("footer.html").then(r => r.text());
}

// ===== GOOGLE CHARTS =====
google.charts.load("current", { packages: ["corechart"] });

const teamLogos = {
  "Atlanta Hawks": "ATL.png","Boston Celtics": "BOS.png","Brooklyn Nets": "BKN.png",
  "Charlotte Hornets": "CHA.png","Chicago Bulls": "CHI.png","Cleveland Cavaliers": "CLE.png",
  "Dallas Mavericks": "DAL.png","Denver Nuggets": "DEN.png","Detroit Pistons": "DET.png",
  "Golden State Warriors": "GSW.png","Houston Rockets": "HOU.png","Indiana Pacers": "IND.png",
  "Los Angeles Clippers": "LAC.png","Los Angeles Lakers": "LAL.png","Memphis Grizzlies": "MEM.png",
  "Miami Heat": "MIA.png","Milwaukee Bucks": "MIL.png","Minnesota Timberwolves": "MIN.png",
  "New Orleans Pelicans": "NOP.png","New York Knicks": "NYK.png","Oklahoma City Thunder": "OKC.png",
  "Orlando Magic": "ORL.png","Philadelphia 76ers": "PHI.png","Phoenix Suns": "PHX.png",
  "Portland Trail Blazers": "POR.png","Sacramento Kings": "SAC.png","San Antonio Spurs": "SAS.png",
  "Toronto Raptors": "TOR.png","Utah Jazz": "UTA.png","Washington Wizards": "WIZ.png"
};

// ===== FUNCIONES =====
async function cargarClasificacion() {
  const tbody = document.querySelector("#standings-table tbody");
  tbody.innerHTML = '<tr><td colspan="5">Cargando clasificación...</td></tr>';

  try {
    const res = await fetch("http://localhost:3000/api/nba/standings");
    const data = await res.json();

    // ESPN structure: children -> groups -> standings -> team, stats
    // Aplanamos la estructura para obtener una lista única de equipos
    let allEntries = [];
    
    // Función auxiliar recursiva para encontrar 'entries'
    function findEntries(node) {
        if (node.standings && node.standings.entries) {
            allEntries = allEntries.concat(node.standings.entries);
        }
        if (node.children) {
            node.children.forEach(child => findEntries(child));
        }
    }

    if (data.children) {
        data.children.forEach(child => findEntries(child));
    } else if (data.standings && data.standings.entries) {
        allEntries = data.standings.entries;
    }

    tbody.innerHTML = "";

    // Sort by Percentage descending
    allEntries.sort((a, b) => {
        const pa = a.stats.find(s => s.name === "winPercent")?.value || 0;
        const pb = b.stats.find(s => s.name === "winPercent")?.value || 0;
        return pb - pa;
    });

    allEntries.forEach((entry, index) => {
        const team = entry.team;
        // Stats: busca stats por nombre
        const winsStat = entry.stats.find(s => s.name === "wins") || { value: 0 };
        const lossesStat = entry.stats.find(s => s.name === "losses") || { value: 0 };
        const pctStat = entry.stats.find(s => s.name === "winPercent") || { value: 0 };

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${team.logos[0].href}" alt="${team.abbreviation}" style="width:30px; height:30px;">
                    ${team.displayName}
                </div>
            </td>
            <td>${winsStat.value}</td>
            <td>${lossesStat.value}</td>
            <td>${(pctStat.value * 100).toFixed(1)}%</td>
        `;
        tbody.appendChild(tr);
    });

  } catch(err) {
    console.error("Error cargando clasificación NBA:", err);
    tbody.innerHTML = `<tr><td colspan="5">No se pudo cargar la clasificación</td></tr>`;
  }
}



async function cargarEquipos() {
  try {
    const res = await fetch("http://localhost:3000/api/nba/teams");
    const equipos = await res.json();

    equipos.forEach(team => {
      team.numPlayers = 0;
      team.avgAge = 0;
      team.conference = (team.conference || "Desconocido").trim();
      team.division = (team.division || "Desconocido").trim();
      team.city = (team.city || "Desconocido").trim();
    });

    mostrarEquipos(equipos);

    google.charts.setOnLoadCallback(() => {
      dibujarGraficoConferencia(equipos);
      dibujarGraficoDivision(equipos);
      dibujarGraficoCiudades(equipos);
      dibujarGraficoJugadores(equipos);
    });
  } catch (err) {
    console.error("Error cargando equipos NBA:", err);
  }
}

// Exponer para el botón de refrescar
window.cargarClasificacion = cargarClasificacion;

function mostrarEquipos(equipos) {
  const contenedor = document.getElementById("team-list");
  contenedor.innerHTML = "";

  equipos.forEach(team => {
    const logoSrc = teamLogos[team.full_name] || `${team.abbreviation}.png`;
    const card = document.createElement("div");
    card.className = "team-card";
    card.innerHTML = `
      <div class="team-card-inner">
        <div class="team-card-front">
          <img class="team-logo" src="logos/${logoSrc}" alt="${team.full_name}">
          <div class="team-name">${team.full_name}</div>
          <div class="team-info">Ciudad: ${team.city}</div>
          <div class="team-info">Conferencia: ${team.conference}</div>
          <div class="team-info">División: ${team.division}</div>
        </div>
        <div class="team-card-back">
          <div class="team-back-title">${team.full_name} Stats</div>
          <div class="team-back-stat">Número de jugadores: ${team.numPlayers}</div>
          <div class="team-back-stat">Edad promedio: ${team.avgAge}</div>
        </div>
      </div>
    `;

    // Botón favorito
    const favBtn = document.createElement("button");
    favBtn.textContent = "⭐";
    favBtn.className = "fav-btn";
    favBtn.onclick = async (e) => {
      e.stopPropagation();
      const user = JSON.parse(localStorage.getItem("user"));
      try {
        await fetch("http://localhost:3000/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            league: "NBA",
            teamId: team.id,
            teamName: team.full_name
          })
        });
        alert("Añadido a favoritos ✅");
      } catch (err) {
        console.error(err);
        alert("Error al añadir favorito ❌");
      }
    };
    card.querySelector(".team-card-front").appendChild(favBtn);

    contenedor.appendChild(card);

    card.onclick = () => {
      const modal = document.getElementById("team-modal");
      modal.style.display = "flex";
      document.getElementById("modal-logo").src = `logos/${logoSrc}`;
      document.getElementById("modal-name").textContent = team.full_name;
      document.getElementById("modal-city").textContent = `Ciudad: ${team.city}`;
      document.getElementById("modal-conference").textContent = `Conferencia: ${team.conference}`;
      document.getElementById("modal-division").textContent = `División: ${team.division}`;
      document.getElementById("modal-stats").innerHTML = `
        <p>Número de jugadores: ${team.numPlayers}</p>
        <p>Edad promedio: ${team.avgAge}</p>
      `;
    };
  });
}

// ===== GRÁFICOS =====
function dibujarGraficoConferencia(equipos){
  const data = google.visualization.arrayToDataTable([
    ["Conferencia", "Equipos"],
    ["Este", equipos.filter(t=>t.conference==="East").length],
    ["Oeste", equipos.filter(t=>t.conference==="West").length]
  ]);
  new google.visualization.ColumnChart(document.getElementById("chart_conferences"))
    .draw(data, {title:"Equipos por Conferencia", legend:{position:"none"}});
}

function dibujarGraficoDivision(equipos){
  const divisions = {};
  equipos.forEach(t => divisions[t.division] = (divisions[t.division]||0)+1);
  const data = google.visualization.arrayToDataTable([["División","Equipos"], ...Object.entries(divisions)]);
  new google.visualization.PieChart(document.getElementById("chart_divisions"))
    .draw(data,{title:"Equipos por División"});
}

function dibujarGraficoCiudades(equipos){
  const cityCounts = {};
  equipos.forEach(t=>{ const c=t.city[0]; cityCounts[c]=(cityCounts[c]||0)+1; });
  const data = google.visualization.arrayToDataTable([["Inicial Ciudad","Equipos"], ...Object.entries(cityCounts)]);
  new google.visualization.BarChart(document.getElementById("chart_cities"))
    .draw(data,{title:"Equipos por inicial de la ciudad", legend:{position:"none"}});
}

function dibujarGraficoJugadores(equipos){
  const data = google.visualization.arrayToDataTable([["Equipo","Jugadores"], ...equipos.map(t=>[t.full_name, t.numPlayers||0])]);
  new google.visualization.ColumnChart(document.getElementById("chart_players"))
    .draw(data,{title:"Número de jugadores por equipo", legend:{position:"none"}});
}
