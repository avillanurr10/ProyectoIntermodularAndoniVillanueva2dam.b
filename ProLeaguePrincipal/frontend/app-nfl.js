document.addEventListener("DOMContentLoaded", async () => {
  await loadHeader(); // Cargar header primero
  await loadFooter(); // Cargar footer

  // ===== LOGUEADO =====
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) { 
    window.location.href = "login.html"; 
    return; 
  }

  // Mostrar "Mi perfil" y "Cerrar sesión"
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

  // ===== SECCIÓN NFL =====
  const nflSection = document.getElementById("nfl-section");
  nflSection.style.display = "block";

  cargarClasificacion();
  cargarEquipos();
  cargarFavoritos(user.id);

  // ===== MODAL =====
  const modal = document.getElementById("team-modal");
  document.getElementById("modal-close").onclick = () => modal.style.display = "none";
  window.onclick = e => { if(e.target === modal) modal.style.display = "none"; };

  // Botón ver favoritos
  const showFavBtn = document.getElementById("show-favorites-btn");
  const allTeamsContainer = document.getElementById("team-list");
  const favContainer = document.getElementById("favorites-list");

  showFavBtn.onclick = async () => {
    if(favContainer.style.display === "none"){
      allTeamsContainer.style.display = "none";
      favContainer.style.display = "grid";
      await cargarFavoritos(user.id);
      showFavBtn.textContent = "⬅ Volver a todos los equipos";
    } else {
      favContainer.style.display = "none";
      allTeamsContainer.style.display = "grid";
      showFavBtn.textContent = "⭐ Ver Mis Favoritos";
    }
  };
});


  // Header/Footer
  async function loadHeader(){
    document.getElementById("header-placeholder").innerHTML =
      await fetch("header.html").then(r=>r.text());
  }
  async function loadFooter(){
    document.getElementById("footer-placeholder").innerHTML =
      await fetch("footer.html").then(r=>r.text());
  }

  // Cargar equipos NFL
  const teamLogos = {
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

  // Cargar Clasificación NFL
  async function cargarClasificacion() {
    const tbody = document.querySelector("#standings-table tbody");
    tbody.innerHTML = '<tr><td colspan="5">Cargando clasificación...</td></tr>';

    try {
      const res = await fetch("http://localhost:3000/api/nfl/standings");
      const data = await res.json();

      // ESPN NFL structure parsing
      let allEntries = [];

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

      // Sort by Win %
      allEntries.sort((a, b) => {
          const pa = a.stats.find(s => s.name === "winPercent")?.value || 0;
          const pb = b.stats.find(s => s.name === "winPercent")?.value || 0;
          return pb - pa;
      });

      // Render top 16 or all
      allEntries.forEach((entry, index) => {
          const team = entry.team;
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
      console.error("Error cargando clasificación NFL:", err);
      tbody.innerHTML = `<tr><td colspan="5">No se pudo cargar la clasificación</td></tr>`;
    }
  }

  // Exponer globalmente para el refresh
  window.cargarClasificacion = cargarClasificacion;

  async function cargarEquipos(){
    try {
      const res = await fetch("http://localhost:3000/api/nfl/teams");
      const equipos = await res.json();
      equipos.forEach(t => { 
        t.numPlayers = t.numPlayers || 0;
        t.avgAge = t.avgAge || 0;
        t.city = t.city || "Desconocido";
        t.conference = t.conference || "Desconocido";
        t.division = t.division || "Desconocido";
      });
      mostrarEquipos(equipos);

      google.charts.load("current",{packages:["corechart"]});
      google.charts.setOnLoadCallback(()=>{ 
        dibujarGraficoConferencia(equipos);
        dibujarGraficoDivision(equipos);
        dibujarGraficoCiudades(equipos);
        dibujarGraficoJugadores(equipos);
      });
    } catch(err){ console.error("Error cargando equipos NFL:", err); }
  }

  function mostrarEquipos(equipos){
    const contenedor = document.getElementById("team-list");
    contenedor.innerHTML="";
    equipos.forEach(team=>{
      const logoSrc = teamLogos[team.full_name] || `${team.abbreviation}.png`;
      const card = document.createElement("div");
      card.className="team-card";
      card.innerHTML=`
        <div class="team-card-inner">
          <div class="team-card-front">
            <img class="team-logo" src="logos/${logoSrc}" alt="${team.full_name}">
            <div class="team-name">${team.full_name}</div>
            <div class="team-info">Ciudad: ${team.city}</div>
            <div class="team-info">Conferencia: ${team.conference}</div>
            <div class="team-info">División: ${team.division}</div>
          </div>
        </div>
      `;

      const favBtn = document.createElement("button");
      favBtn.textContent="⭐";
      favBtn.className="fav-btn";
      favBtn.onclick=async e=>{
        e.stopPropagation();
        try{
          await fetch("http://localhost:3000/api/favorites",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
            userId:JSON.parse(localStorage.getItem("user")).id,
            league:"NFL",
            teamId:team.id,
            teamName:team.full_name
          })});
          alert("Añadido a favoritos ✅");
        }catch(err){ console.error(err); alert("Error ❌"); }
      };
      card.querySelector(".team-card-front").appendChild(favBtn);

      card.onclick=()=>{
        const modal=document.getElementById("team-modal");
        modal.style.display="flex";
        document.getElementById("modal-logo").src=`logos/${logoSrc}`;
        document.getElementById("modal-name").textContent=team.full_name;
        document.getElementById("modal-city").textContent=`Ciudad: ${team.city}`;
        document.getElementById("modal-conference").textContent=`Conferencia: ${team.conference}`;
        document.getElementById("modal-division").textContent=`División: ${team.division}`;
        document.getElementById("modal-stats").innerHTML=`<p>Número de jugadores: ${team.numPlayers}</p><p>Edad promedio: ${team.avgAge}</p>`;
      };

      contenedor.appendChild(card);
    });
  }

  // Google Charts
  function dibujarGraficoConferencia(equipos){
    const data = google.visualization.arrayToDataTable([
      ["Conferencia","Equipos"],
      ["AFC", equipos.filter(t=>t.conference==="AFC").length],
      ["NFC", equipos.filter(t=>t.conference==="NFC").length]
    ]);
    new google.visualization.ColumnChart(document.getElementById("chart_conferences"))
      .draw(data,{title:"Equipos por Conferencia",legend:{position:"none"}});
  }

  function dibujarGraficoDivision(equipos){
    const divisions={};
    equipos.forEach(t=>divisions[t.division]=(divisions[t.division]||0)+1);
    const data=google.visualization.arrayToDataTable([["División","Equipos"], ...Object.entries(divisions)]);
    new google.visualization.PieChart(document.getElementById("chart_divisions"))
      .draw(data,{title:"Equipos por División"});
  }

  function dibujarGraficoCiudades(equipos){
    const cities={};
    equipos.forEach(t=>{const c=t.city[0]; cities[c]=(cities[c]||0)+1;});
    const data=google.visualization.arrayToDataTable([["Inicial Ciudad","Equipos"], ...Object.entries(cities)]);
    new google.visualization.BarChart(document.getElementById("chart_cities"))
      .draw(data,{title:"Inicial de ciudad",legend:{position:"none"}});
  }

  function dibujarGraficoJugadores(equipos){
    const data=google.visualization.arrayToDataTable([["Equipo","Jugadores"], ...equipos.map(t=>[t.full_name,t.numPlayers||0])]);
    new google.visualization.ColumnChart(document.getElementById("chart_players"))
      .draw(data,{title:"Número de jugadores por equipo",legend:{position:"none"}});
  }



  // Favoritos
  async function cargarFavoritos(userId){
    const contenedor=document.getElementById("favorites-list");
    contenedor.innerHTML="";
    try{
      const res=await fetch(`http://localhost:3000/api/favorites/${userId}`);
      const favs=await res.json();
      favs.forEach(fav=>{
        const card=document.createElement("div");
        card.className="team-card";
        card.innerHTML=`
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
        card.querySelector(".remove-fav").onclick=async e=>{
          e.stopPropagation();
          await fetch("http://localhost:3000/api/favorites",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({
            userId, league:fav.league, teamId:fav.team_id
          })});
          card.remove();
        };
      });
    }catch(err){ console.error("Error cargando favoritos:",err); }
  }
