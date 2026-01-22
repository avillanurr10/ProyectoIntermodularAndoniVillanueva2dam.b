import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { pool as db } from "./db.js";

import authRoutes from "./routes/auth.routes.js";
import favoritesRoutes from "./routes/favorites.routes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.send("ProLeague backend funcionando");
});

// =======================
// NBA - EQUIPOS
// =======================
app.get("/api/nba/teams", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.balldontlie.io/v1/teams",
      {
        headers: {
          Authorization: `Bearer ${process.env.BALLDONTLIE_API_KEY}`
        }
      }
    );

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
          Authorization: `Bearer ${process.env.BALLDONTLIE_API_KEY}`
        }
      }
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
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings"
    );

    // Enviamos los datos crudos al frontend
    res.json(response.data);
  } catch (err) {
    console.error("Error obteniendo clasificación NBA:", err.message);
    res.status(500).json({ error: "No se pudo cargar la clasificación NBA" });
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend activo en http://localhost:${PORT}`);
});
