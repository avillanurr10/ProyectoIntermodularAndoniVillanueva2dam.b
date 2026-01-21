// VERIFICAR LOGIN
const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

// LOGOUT
const logoutLink = document.getElementById("nav-logout");
if (logoutLink) {
  logoutLink.style.display = "inline";
  logoutLink.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

// SLIDER
let currentSlide = 0;
const slides = document.querySelectorAll(".hero-slider .slide");

function showSlide(index){
  slides.forEach((s,i)=> s.classList.toggle("active", i===index));
}

function nextSlide(){
  currentSlide = (currentSlide+1) % slides.length;
  showSlide(currentSlide);
}

if(slides.length > 0){
  showSlide(0);
  setInterval(nextSlide, 5000);
}

// NOTICIAS SIMULADAS (después se pueden cargar de RSS o API)
const newsList = document.getElementById("news-list");
const noticias = [
  {title:"LeBron James lidera a Lakers", desc:"Lakers consiguen victoria con gran actuación de LeBron.", img:"images/news1.jpg"},
  {title:"Packers y Buccaneers se enfrentan", desc:"Partido épico en la NFC con resultados sorprendentes.", img:"images/news2.jpg"},
  {title:"Curry anota 50 puntos", desc:"Golden State Warriors vencen con actuación histórica.", img:"images/news3.jpg"},
  {title:"Tom Brady anuncia retiro", desc:"Una leyenda de la NFL dice adiós a los campos.", img:"images/news4.jpg"}
];

noticias.forEach(n => {
  const card = document.createElement("div");
  card.className = "news-card";
  card.innerHTML = `
    <img src="${n.img}" alt="${n.title}">
    <div class="news-card-content">
      <h3>${n.title}</h3>
      <p>${n.desc}</p>
    </div>
  `;
  newsList.appendChild(card);
});
