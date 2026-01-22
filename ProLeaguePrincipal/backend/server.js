import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { pool as db } from "./db.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
console.log("API KEY:", process.env.BALLDONTLIE_API_KEY);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);

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
// NFL - EQUIPOS (MISMO QUE NBA)
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

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend activo en http://localhost:${PORT}`);
});
