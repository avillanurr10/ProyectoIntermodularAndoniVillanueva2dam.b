// =======================
// VERIFICAR LOGIN
// =======================
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  window.location.href = "login.html";
}

// =======================
// SECCIONES
// =======================
const homeSection = document.getElementById("home-section");
const logoutLink = document.getElementById("nav-logout");

// Mostrar logout y home al cargar si hay usuario
if (logoutLink) logoutLink.style.display = "inline";
if (homeSection) homeSection.style.display = "block";

// =======================
// LOGOUT
// =======================
if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

// =======================
// NAVIGATION
// =======================
const navHome = document.getElementById("nav-home");
if (navHome) {
  navHome.addEventListener("click", (e) => {
    e.preventDefault();
    if (homeSection) homeSection.style.display = "block";
  });
}

const navNBA = document.getElementById("nav-nba");
if (navNBA) {
  navNBA.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "nba.html"; // redirige a la página NBA
  });
}

const navNFL = document.getElementById("nav-nfl");
if (navNFL) {
  navNFL.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "nfl.html"; // redirige a la página NFL
  });
}
