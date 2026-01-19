import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("ProLeague backend funcionando");
});

app.get("/api/nba/teams", async (req, res) => {
  try {
    const response = await axios.get("https://api.balldontlie.io/v1/teams", {
      headers: {
        Authorization: `Bearer ${process.env.BALLDONTLIE_API_KEY}`
      }
    });
    res.json(response.data.data);
  } catch (err) {
    console.error("Error llamando a la API:", err.message);
    res.status(500).json({ error: "Error obteniendo equipos NBA" });
  }
});

app.listen(3000, () => {
  console.log("✅ Backend activo en http://localhost:3000");
});
