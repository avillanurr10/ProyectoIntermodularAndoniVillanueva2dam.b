import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { pool as db } from "./db.js";

import authRoutes from "./routes/auth.routes.js";
import favoritesRoutes from "./routes/favorites.routes.js";
import newsRoutes from "./routes/news.routes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Ajustar en producción si es necesario
    methods: ["GET", "POST"],
  },
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/news", newsRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.send("ProLeague backend funcionando");
});

// =======================
// CHAT - SOCKET.IO
// =======================
// Almacén temporal de mensajes (se pierde al reiniciar server)
const messages = {
  nba: [],
  nfl: [],
};

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  // Unirse a una sala (nba o nfl)
  socket.on("joinRoom", (room) => {
    if (room !== "nba" && room !== "nfl") return;

    socket.join(room);
    console.log(`Socket ${socket.id} se unió a ${room}`);

    // Enviar historial
    socket.emit("loadMessages", { room, messages: messages[room] });

    // 🤖 BOT: Mensaje de bienvenida personal
    const welcomeText = room === 'nba' ? "¡Bienvenido al chat NBA! 🏀" : "¡Bienvenido al chat NFL! 🏈";
    socket.emit("message", {
      user: "🤖 ProLeagueBot",
      text: welcomeText,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      room
    });

    // 🤖 BOT: Avisar a otros (opcional, puede ser spam)
    // socket.to(room).emit("message", { user: "🤖 ProLeagueBot", text: "Un nuevo usuario se ha unido.", ... });
  });

  // Recibir mensaje
  socket.on("chatMessage", (data) => {
    const { room, user, text } = data;
    if (!room || !user || !text) return;

    const newMessage = {
      user,
      text,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      room 
    };

    // Guardar en memoria
    if (messages[room]) {
      messages[room].push(newMessage);
      if (messages[room].length > 50) messages[room].shift();
    }

    // Emitir a todos en la sala
    io.to(room).emit("message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// 🤖 BOT: Eventos automáticos (Simulación)
setInterval(() => {
  const rooms = ["nba", "nfl"];
  rooms.forEach(room => {
    const events = [
      "📢 Recordatorio: Mantened el respeto en el chat.",
      "📊 ¿Sabías que? Puedes ver las estadísticas en la pestaña principal.",
      "🔥 ¡El partido está al rojo vivo!",
      "👀 ¡Ojo a esa jugada!",
      "🤖 Soy un bot, pero disfruto del deporte."
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    const botMsg = {
      user: "🤖 ProLeagueBot",
      text: randomEvent,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      room
    };

    // No guardamos esto en el historial para no ensuciar, o sí. Decidimos NO guardar.
    // Solo emitir
    io.to(room).emit("message", botMsg);
  });
}, 45000); // Cada 45 segundos

// =======================
// NBA - EQUIPOS
// =======================
app.get("/api/nba/teams", async (req, res) => {
  try {
    const response = await axios.get("https://api.balldontlie.io/v1/teams", {
      headers: {
        Authorization: `Bearer ${process.env.BALLDONTLIE_API_KEY}`,
      },
    });

    res.json(response.data.data);
  } catch (err) {
    console.error("Error obteniendo equipos NBA:", err.message);
    res.status(500).json({ error: "Error obteniendo equipos NBA" });
  }
});

// =======================
// NFL - EQUIPOS
// =======================
app.get("/api/nfl/teams", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.balldontlie.io/nfl/v1/teams",
      {
        headers: {
          Authorization: `Bearer ${process.env.BALLDONTLIE_API_KEY}`,
        },
      },
    );

    res.json(response.data.data);
  } catch (err) {
    console.error("Error obteniendo equipos NFL:", err.message);
    res.status(500).json({ error: "Error obteniendo equipos NFL" });
  }
});
// =======================
// NBA - CLASIFICACIÓN
// =======================
app.get("/api/nba/standings", async (req, res) => {
  try {
    const response = await axios.get(
      "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings"
    );

    // Enviamos los datos crudos al frontend
    res.json(response.data);
  } catch (err) {
    console.error("Error obteniendo clasificación NBA:", err.message);
    res.status(500).json({ error: "No se pudo cargar la clasificación NBA" });
  }
});

// =======================
// NFL - CLASIFICACIÓN
// =======================
app.get("/api/nfl/standings", async (req, res) => {
  try {
    const response = await axios.get(
      "https://site.api.espn.com/apis/v2/sports/football/nfl/standings"
    );

    // Enviamos los datos crudos al frontend
    res.json(response.data);
  } catch (err) {
    console.error("Error obteniendo clasificación NFL:", err.message);
    res.status(500).json({ error: "No se pudo cargar la clasificación NFL" });
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`✅ Backend (Socket.io) activo en http://localhost:${PORT}`);
});
