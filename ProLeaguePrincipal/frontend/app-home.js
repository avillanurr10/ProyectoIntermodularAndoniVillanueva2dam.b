// =======================
// AUTH & STATE
// =======================
const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

let currentFilter = "all";

// =======================
// CUSTOM CURSOR
// =======================
function initCustomCursor() {
  const cursor = document.createElement("div");
  const dot = document.createElement("div");
  cursor.className = "custom-cursor";
  dot.className = "custom-cursor-dot";
  document.body.appendChild(cursor);
  document.body.appendChild(dot);

  document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
    dot.style.transform = `translate(${e.clientX - 2}px, ${e.clientY - 2}px)`;
  });

  document.querySelectorAll("a, button, .dot, .nav-logo").forEach(el => {
    el.addEventListener("mouseenter", () => cursor.style.transform += " scale(2)");
    el.addEventListener("mouseleave", () => cursor.style.transform = cursor.style.transform.replace(" scale(2)", ""));
  });
}
initCustomCursor();

// =======================
// FAVORITES BADGE
// =======================
function updateFavBadge() {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  const badge = document.getElementById("fav-badge");
  const favLink = document.getElementById("nav-favorites");
  
  if (!favLink) return; // Header not loaded yet

  if (favorites.length > 0) {
    if (badge) {
      badge.textContent = favorites.length;
      badge.style.display = "inline-block";
    }
    favLink.style.display = "inline";
  } else {
    if (badge) badge.style.display = "none";
    favLink.style.display = "inline"; 
  }
}

// =======================
// HERO SLIDER
// =======================
let currentSlide = 0;
const slides = document.querySelectorAll(".hero-slider .slide");
const dotsContainer = document.getElementById("slider-dots");

function createDots() {
  slides.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => {
      currentSlide = i;
      showSlide(currentSlide);
    });
    dotsContainer.appendChild(dot);
  });
}

function showSlide(index) {
  slides.forEach((s, i) => s.classList.toggle("active", i === index));
  const dots = document.querySelectorAll(".dot");
  dots.forEach((d, i) => d.classList.toggle("active", i === index));
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

if (slides.length > 0) {
  createDots();
  showSlide(0);
  setInterval(nextSlide, 5000);
}

// =======================
// SPORTS CLOCK (ET Time)
// =======================
function updateClock() {
  const options = {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  };
  const formatter = new Intl.DateTimeFormat([], options);
  const timeStr = formatter.format(new Date());
  const clockEl = document.getElementById("clock-time");
  if (clockEl) clockEl.textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// =======================
// NEWS SEARCH & FILTERING
// =======================
const searchInput = document.getElementById("news-search");
let allNewsCards = [];

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    filterNews(term, currentFilter);
  });
}

function filterNews(term = "", category = "all") {
  allNewsCards.forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const desc = card.querySelector("p").textContent.toLowerCase();
    const matchesTerm = title.includes(term) || desc.includes(term);
    const matchesCat = category === "all" || card.classList.contains(category);
    
    card.style.display = (matchesTerm && matchesCat) ? "block" : "none";
  });
}

// =======================
// SKELETON SCREENS
// =======================
const newsList = document.getElementById("news-list");

function showSkeletons() {
  newsList.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const skel = document.createElement("div");
    skel.className = "news-card skeleton";
    skel.style.height = "250px";
    newsList.appendChild(skel);
  }
}

// =======================
// CARGAR NOTICIAS (RSS)
// =======================
const RSS_FEEDS = [
  { url: "https://www.espn.com/espn/rss/nba/news", category: "NBA" },
  { url: "https://www.espn.com/espn/rss/nfl/news", category: "NFL" }
];

async function loadRSS(feed) {
  try {
    const res = await fetch(`http://localhost:3000/api/news?category=${feed.category.toLowerCase()}`);
    if (!res.ok) throw new Error("Error al cargar noticias");
    
    const items = await res.json();
    return items.map(item => ({ ...item, category: feed.category }));
  } catch (err) {
    console.error("Error RSS", feed.category, err);
    return [];
  }
}

async function initNews() {
  showSkeletons();
  
  const results = await Promise.all(RSS_FEEDS.map(feed => loadRSS(feed)));
  const allItems = results.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  newsList.innerHTML = "";
  allItems.forEach((item, index) => {
    const category = item.category;
    const image = category === "NBA" ? "images/nba-logo.png" : "images/nfl-logo.png";

    const card = document.createElement("div");
    card.className = `news-card ${category.toLowerCase()}`;
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <img src="${image}" alt="${category}" loading="lazy" onerror="this.src='https://via.placeholder.com/50'">
      <div class="news-card-content">
        <span class="news-tag ${category.toLowerCase()}">${category}</span>
        <h3>${item.title}</h3>
        <p>${item.description.replace(/<[^>]*>?/gm, "").slice(0, 140)}...</p>
        <div class="news-footer">
          <a href="${item.link}" target="_blank">Leer más →</a>
          <small>${item.pubDate ? new Date(item.pubDate).toLocaleDateString() : ""}</small>
        </div>
      </div>
    `;

    newsList.appendChild(card);
    allNewsCards.push(card);
  });
}

// Initial load
initNews();
updateFavBadge();

function updateNavLinks() {
  const logoutLink = document.getElementById("nav-logout");
  const chatLink = document.getElementById("nav-chat");
  const profileLink = document.getElementById("nav-profile");

  if (user && logoutLink) {
    logoutLink.style.display = "inline";
    if (chatLink) chatLink.style.display = "inline";
    if (profileLink) profileLink.style.display = "inline";
    
    logoutLink.addEventListener("click", e => {
      e.preventDefault();
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }
}

// Poll for header load (simple way without changing home.html script much)
const headerCheck = setInterval(() => {
  if (document.getElementById("nav-home")) {
    updateFavBadge();
    updateNavLinks();
    clearInterval(headerCheck);
  }
}, 100);

// Update filter buttons to use global filterNews
const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    filterNews(searchInput ? searchInput.value.toLowerCase() : "", currentFilter);
  });
});
