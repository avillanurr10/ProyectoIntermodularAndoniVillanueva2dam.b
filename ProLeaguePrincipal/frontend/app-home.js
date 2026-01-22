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
// CARGAR RSS
// =======================
async function loadRSS(feed) {
  try {
    const res = await fetch(CORS_PROXY + encodeURIComponent(feed.url));
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    const items = [...xml.querySelectorAll("item")];

    items.forEach((item, index) => {
      const title = item.querySelector("title")?.textContent || "";
      const description = item.querySelector("description")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "#";
      const pubDate = item.querySelector("pubDate")?.textContent || "";

      const image = getImageFromItem(item, feed.category);

      const card = document.createElement("div");
      card.className = `news-card ${feed.category.toLowerCase()}`;
      card.style.animationDelay = `${index * 0.1}s`;

      card.innerHTML = `
        <img src="${image}" alt="${feed.category}" loading="lazy">
        <div class="news-card-content">
          <span class="news-tag ${feed.category.toLowerCase()}">${feed.category}</span>
          <h3>${title}</h3>
          <p>${description.replace(/<[^>]*>?/gm, "").slice(0, 140)}...</p>
          <div class="news-footer">
            <a href="${link}" target="_blank">Leer más →</a>
            <small>${pubDate ? new Date(pubDate).toLocaleDateString() : ""}</small>
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
