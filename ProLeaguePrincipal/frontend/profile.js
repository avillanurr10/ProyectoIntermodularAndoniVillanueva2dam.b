// ===== CARGAR USUARIO =====
let user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

// Función para refrescar los datos del perfil desde backend
async function loadUserProfile() {
  try {
    const res = await fetch(`http://localhost:3000/api/auth/user/${user.id}`);
    if (!res.ok) throw new Error("No se pudo cargar el perfil");
    const data = await res.json();

    // Actualizar variable global y localStorage
    user = data.user;
    localStorage.setItem("user", JSON.stringify(user));

    // Mostrar datos en profile.html
    document.getElementById("profile-username").textContent = user.username || "Usuario";
    document.getElementById("profile-email").textContent = user.email || "email@email.com";
    document.getElementById("profile-bio").value = user.bio || "";

    // Imagen del avatar
    document.getElementById("profile-img").src = user.avatar
      ? `http://localhost:3000${user.avatar}`
      : "images/default-avatar.png";
  } catch (err) {
    console.error(err);
    alert("Error cargando perfil ❌");
  }
}
loadUserProfile();

// ===== HEADER / FOOTER =====
async function loadHeaderFooter() {
  try {
    const headerHtml = await fetch("header.html").then(r => r.text());
    document.getElementById("header-placeholder").innerHTML = headerHtml;

    const navProfile = document.getElementById("nav-profile");
    const navLogout = document.getElementById("nav-logout");

    if (user) {
      if (navProfile) navProfile.style.display = "inline";
      if (navLogout) navLogout.style.display = "inline";
    }

    if (navLogout) {
      navLogout.addEventListener("click", e => {
        e.preventDefault();
        localStorage.removeItem("user");
        window.location.href = "login.html";
      });
    }

    const footerHtml = await fetch("footer.html").then(r => r.text());
    document.getElementById("footer-placeholder").innerHTML = footerHtml;
  } catch (err) {
    console.error("Error cargando header/footer:", err);
  }
}
loadHeaderFooter();

// ===== VISTA PREVIA AVATAR =====
document.getElementById("avatar-input").addEventListener("change", () => {
  const file = document.getElementById("avatar-input").files[0];
  if (file) {
    document.getElementById("profile-img").src = URL.createObjectURL(file);
  }
});

// ===== GUARDAR PERFIL (BIO + AVATAR) =====
document.getElementById("save-profile").addEventListener("click", async () => {
  const bio = document.getElementById("profile-bio").value;
  const avatarInput = document.getElementById("avatar-input");
  let avatarUrl = user.avatar || null;

  // Subida de avatar si hay archivo nuevo
  if (avatarInput.files && avatarInput.files[0]) {
    const formData = new FormData();
    formData.append("avatar", avatarInput.files[0]);

    try {
      const res = await fetch(`http://localhost:3000/api/auth/upload-avatar/${user.id}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error subiendo avatar");

      avatarUrl = data.avatarUrl; // URL relativa
      user.avatar = avatarUrl; // actualizar variable global
      document.getElementById("profile-img").src = `http://localhost:3000${avatarUrl}`;
    } catch (err) {
      console.error(err);
      alert("Error subiendo avatar ❌");
      return;
    }
  }

  // Guardar bio y avatar en backend
  try {
    const res = await fetch("http://localhost:3000/api/auth/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, bio, avatar: avatarUrl })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error actualizando perfil");

    user = data.user;
    localStorage.setItem("user", JSON.stringify(user));
    alert("Perfil actualizado ✅");

    // Actualizar vista inmediatamente
    document.getElementById("profile-username").textContent = user.username || "Usuario";
    document.getElementById("profile-bio").value = user.bio || "";
    document.getElementById("profile-img").src = user.avatar
      ? `http://localhost:3000${user.avatar}`
      : "images/default-avatar.png";

  } catch (err) {
    console.error(err);
    alert("Error actualizando perfil ❌");
  }
});

// ===== CAMBIAR CREDENCIALES =====
document.getElementById("change-credentials").addEventListener("click", async () => {
  const newUsername = document.getElementById("new-username").value.trim();
  const newPassword = document.getElementById("new-password").value.trim();

  if (!newUsername && !newPassword) {
    alert("Introduce algún cambio");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        username: newUsername || undefined,
        password: newPassword || undefined
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error actualizando credenciales");

    user = data.user;
    localStorage.setItem("user", JSON.stringify(user));
    alert("Credenciales actualizadas ✅");

    // Actualizar vista
    document.getElementById("profile-username").textContent = user.username || "Usuario";

  } catch (err) {
    console.error(err);
    alert("Error actualizando credenciales ❌");
  }
});
