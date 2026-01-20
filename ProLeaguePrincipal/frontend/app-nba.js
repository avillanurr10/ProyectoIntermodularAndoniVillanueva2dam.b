// =======================
// app-nba.js
// =======================

document.addEventListener("DOMContentLoaded", async () => {
  // 1️⃣ Verificar sesión
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 2️⃣ Cargar header y footer
  await loadHeader();
  await loadFooter();

  // 3️⃣ Mostrar logout y preparar home
  const logoutLink = document.getElementById("nav-logout");
  logoutLink.style.display = "inline";

  // 4️⃣ NAVIGATION
  const homeSection = document.getElementById("home-section");
  const nbaSection = document.getElementById("nba-section");
  const nflSection = document.getElementById("nfl-section");

  document.getElementById("nav-home").addEventListener("click", (e) => {
    e.preventDefault();
    homeSection.style.display = "block";
    nbaSection.style.display = "none";
    nflSection.style.display = "none";
  });

  document.getElementById("nav-nba").addEventListener("click", (e) => {
    e.preventDefault();
    homeSection.style.display = "none";
    nbaSection.style.display = "block";
    nflSection.style.display = "none";
    cargarEquipos();
  });

  document.getElementById("nav-nfl").addEventListener("click", (e) => {
    e.preventDefault();
    homeSection.style.display = "none";
    nbaSection.style.display = "none";
    nflSection.style.display = "block";
  });

  // 5️⃣ Logout
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  // 6️⃣ Cargar NBA al inicio si quieres
  // homeSection.style.display = "block"; // Opcional
  // nbaSection.style.display = "block"; // Para abrir NBA directo
});

// =======================
// Funciones cargar header/footer
// =======================
async function loadHeader() {
  const headerHtml = await fetch("header.html").then(r => r.text());
  document.getElementById("header-placeholder").innerHTML = headerHtml;
}

async function loadFooter() {
  const footerHtml = await fetch("footer.html").then(r => r.text());
  document.getElementById("footer-placeholder").innerHTML = footerHtml;
}

// =======================
// GOOGLE CHARTS
// =======================
google.charts.load("current", { packages: ["corechart"] });

// =======================
// NBA CARDS
// =======================
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
  "LA Clippers": "LAC.png",
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

    mostrarEquipos(equipos);
    google.charts.setOnLoadCallback(() => dibujarGrafico(equipos));
  } catch (err) {
    console.error("Error cargando equipos:", err);
  }
}

function mostrarEquipos(equipos) {
  const contenedor = document.getElementById("team-list");
  contenedor.innerHTML = "";

  equipos.forEach(team => {
    const card = document.createElement("div");
    card.classList.add("team-card");

    const logoSrc = teamLogos[team.full_name] || `${team.abbreviation}.png`;

    card.innerHTML = `
      <img class="team-logo" src="logos/${logoSrc}" alt="${team.full_name}" onerror="this.style.display='none'">
      <div class="team-name">${team.full_name} (${team.abbreviation})</div>
      <div class="team-info">Ciudad: ${team.city}</div>
      <div class="team-info">Conferencia: ${team.conference || "N/A"}</div>
      <div class="team-info">División: ${team.division || "N/A"}</div>
    `;

    contenedor.appendChild(card);

    // Modal
    card.addEventListener("click", () => {
      const modal = document.getElementById("team-modal");
      document.getElementById("modal-logo").src = `logos/${logoSrc}`;
      document.getElementById("modal-logo").alt = team.full_name;
      document.getElementById("modal-name").textContent = team.full_name;
      document.getElementById("modal-city").textContent = `Ciudad: ${team.city}`;
      document.getElementById("modal-conference").textContent = `Conferencia: ${team.conference || "N/A"}`;
      document.getElementById("modal-division").textContent = `División: ${team.division || "N/A"}`;

      document.getElementById("modal-stats").innerHTML = `
        <p>Puntos promedio por partido: ${team.avg_points || "N/D"}</p>
        <p>Victorias: ${team.wins || "N/D"}</p>
        <p>Derrotas: ${team.losses || "N/D"}</p>
      `;

      modal.style.display = "flex";
    });
  });
}

// =======================
// GRÁFICO
// =======================
function dibujarGrafico(equipos) {
  let east = 0;
  let west = 0;

  equipos.forEach(team => {
    if (team.conference === "East") east++;
    if (team.conference === "West") west++;
  });

  const data = google.visualization.arrayToDataTable([
    ["Conferencia", "Número de equipos"],
    ["Este", east],
    ["Oeste", west]
  ]);

  const options = {
    title: "Distribución de equipos NBA por conferencia",
    legend: { position: "none" }
  };

  const chart = new google.visualization.ColumnChart(document.getElementById("chart_conferences"));
  chart.draw(data, options);
}

// =======================
// MODAL
// =======================
function cerrarModal() {
  const modal = document.getElementById("team-modal");
  modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("modal-close");
  closeBtn.addEventListener("click", cerrarModal);

  const modal = document.getElementById("team-modal");
  window.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });
});
