// ===============================
// MAPAS DE LOGOS
// ===============================
const nbaLogos = {
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

const nflLogos = {
  "Arizona Cardinals":"NFL_ARI.png","Atlanta Falcons":"NFL_ATL.png","Baltimore Ravens":"NFL_BAL.png",
  "Buffalo Bills":"NFL_BUF.png","Carolina Panthers":"NFL_CAR.png","Chicago Bears":"NFL_CHI.svg",
  "Cincinnati Bengals":"NFL_CIN.png","Cleveland Browns":"NFL_CLE.png","Dallas Cowboys":"NFL_DAL.svg",
  "Denver Broncos":"NFL_DEN.svg","Detroit Lions":"NFL_DET.png","Green Bay Packers":"NFL_GB.png",
  "Houston Texans":"NFL_HOU.png","Indianapolis Colts":"NFL_IND.svg","Jacksonville Jaguars":"NFL_JAX.png",
  "Kansas City Chiefs":"NFL_KC.png","Las Vegas Raiders":"NFL_LV.png","Los Angeles Chargers":"NFL_LAC.png",
  "Los Angeles Rams":"NFL_LAR.png","Miami Dolphins":"NFL_MIA.png","Minnesota Vikings":"NFL_MIN.png",
  "New England Patriots":"NFL_NE.png","New Orleans Saints":"NFL_NO.png","New York Giants":"NFL_NYG.png",
  "New York Jets":"NFL_NYJ.svg","Philadelphia Eagles":"NFL_PHI.png","Pittsburgh Steelers":"NFL_PIT.png",
  "San Francisco 49ers":"NFL_SF.svg","Seattle Seahawks":"NFL_SEA.png","Tampa Bay Buccaneers":"NFL_TB.svg",
  "Tennessee Titans":"NFL_TEN.svg","Washington Commanders":"NFL_WAS.png"
};

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  await loadHeader();
  await loadFooter();

  cargarFavoritos(user.id);
});

// ===============================
// HEADER / FOOTER
// ===============================
async function loadHeader() {
  document.getElementById("header-placeholder").innerHTML =
    await fetch("header.html").then(r => r.text());
}

async function loadFooter() {
  document.getElementById("footer-placeholder").innerHTML =
    await fetch("footer.html").then(r => r.text());
}

// ===============================
// CARGAR FAVORITOS
// ===============================
async function cargarFavoritos(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/favorites/${userId}`);
    const favoritos = await res.json();

    const contenedor = document.getElementById("favorites-list");
    contenedor.innerHTML = "";

    if (favoritos.length === 0) {
      contenedor.innerHTML = "<p>No tienes favoritos todavía ⭐</p>";
      return;
    }

    favoritos.forEach(fav => {
      const logo =
        fav.league === "NBA"
          ? nbaLogos[fav.team_name]
          : nflLogos[fav.team_name];

      const logoPath = logo
        ? `logos/${logo}`
        : "logos/default.png";

      const card = document.createElement("div");
      card.className = "team-card";
      card.innerHTML = `
        <div class="team-card-inner">
          <div class="team-card-front">
            <img class="team-logo" src="${logoPath}" alt="${fav.team_name}">
            <div class="team-name">${fav.team_name}</div>
            <div class="team-info">Liga: ${fav.league}</div>
            <button class="remove-fav">❌ Quitar</button>
          </div>
        </div>
      `;

      contenedor.appendChild(card);

      card.querySelector(".remove-fav").addEventListener("click", async (e) => {
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
      });
    });

  } catch (err) {
    console.error("❌ Error cargando favoritos:", err);
  }
}
