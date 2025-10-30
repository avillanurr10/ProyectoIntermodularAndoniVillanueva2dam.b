import dotenv from "dotenv";
dotenv.config();

import { BalldontlieAPI } from "@balldontlie/sdk";

const apiKey = process.env.BALLDONTLIE_API_KEY;
if (!apiKey) throw new Error("API key no definida en .env");

const api = new BalldontlieAPI({ apiKey });

async function main() {
  try {
    // ===============================
    // 1️⃣ Probar NBA (funciona con tu key)
    // ===============================
    const nbaTeams = await api.nba.getTeams();
    console.log("🏀 Equipos NBA:");
    nbaTeams.data.forEach(team => console.log(team.full_name));

    // ===============================
    // 2️⃣ Probar NFL (solo endpoints públicos)
    // ===============================
          try {
        const playersResponse = await api.nfl.getActivePlayers({ per_page: 5 });
        const players = playersResponse?.data || [];

        if (players.length > 0) {
          console.log("🧑 Algunos jugadores activos NFL:");
          players.forEach(p => console.log(`${p.first_name} ${p.last_name}`));
        } else {
          console.log("⚠️ No se pudo obtener datos NFL públicos.");
        }
      } catch {
        console.log("⚠️ No se pudo obtener datos NFL públicos.");
      }


  } catch (err) {
    console.error("❌ Error al llamar a la API:", err);
  }
}

main();
