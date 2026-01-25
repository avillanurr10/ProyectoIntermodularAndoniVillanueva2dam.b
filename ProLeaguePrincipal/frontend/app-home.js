// =======================
// VERIFICAR LOGIN
// =======================
const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

// =======================
// LOGOUT
// =======================
const logoutLink = document.getElementById("nav-logout");
if (logoutLink) {
  logoutLink.style.display = "inline";
  logoutLink.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

// =======================
// HERO SLIDER
// =======================
let currentSlide = 0;
const slides = document.querySelectorAll(".hero-slider .slide");

function showSlide(index) {
  slides.forEach((s, i) => s.classList.toggle("active", i === index));
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

if (slides.length > 0) {
  showSlide(0);
  setInterval(nextSlide, 5000);
}

// =======================
// RSS CONFIG
// =======================
const newsList = document.getElementById("news-list");

const RSS_FEEDS = [
  { url: "https://www.espn.com/espn/rss/nba/news", category: "NBA" },
  { url: "https://www.espn.com/espn/rss/nfl/news", category: "NFL" }
];

const CORS_PROXY = "https://api.allorigins.win/raw?url=";

// =======================
// ESTADO GLOBAL DEL FILTRO
// =======================
let currentFilter = "all"; // all | nba | nfl

// =======================
// BOTONES FILTRO
// =======================
const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;

    // Aplicar filtro en tiempo real a todas las noticias
    document.querySelectorAll(".news-card").forEach(card => {
      card.style.display =
        currentFilter === "all" || card.classList.contains(currentFilter)
          ? "block"
          : "none";
    });
  });
});

// =======================
// IMAGEN LOCAL POR CATEGORÍA
// =======================
function getImageFromItem(item, category) {
  // Puedes descargar y poner tus PNG en la carpeta images/
  return category === "NBA"
    ? "images/nba-logo.png"  // tu PNG de baloncesto
    : "images/nfl-logo.png"; // tu PNG de balón de rugby
}

// =======================
// CARGAR NOTICIAS DESDE BACKEND
// =======================
async function loadRSS(feed) {
  try {
    // LLAMADA AL NUEVO ENDPOINT DEL BACKEND
    const res = await fetch(`http://localhost:3000/api/news?category=${feed.category.toLowerCase()}`);
    if (!res.ok) throw new Error("Error al cargar noticias");
    
    const items = await res.json();

    items.forEach((item, index) => {
      const image = getImageFromItem(item, feed.category);

      const card = document.createElement("div");
      card.className = `news-card ${feed.category.toLowerCase()}`;
      // Efecto escalonado
      card.style.animationDelay = `${index * 0.1}s`;

      card.innerHTML = `
        <img src="${image}" alt="${feed.category}" loading="lazy">
        <div class="news-card-content">
          <span class="news-tag ${feed.category.toLowerCase()}">${feed.category}</span>
          <h3>${item.title}</h3>
          <p>${item.description.replace(/<[^>]*>?/gm, "").slice(0, 140)}...</p>
          <div class="news-footer">
            <a href="${item.link}" target="_blank">Leer más →</a>
            <small>${item.pubDate ? new Date(item.pubDate).toLocaleDateString() : ""}</small>
          </div>
        </div>
      `;

      newsList.appendChild(card);
    });
  } catch (err) {
    console.error("Error RSS", feed.category, err);
  }
}

// =======================
// CARGAR TODAS LAS NOTICIAS
// =======================
RSS_FEEDS.forEach(feed => loadRSS(feed));
