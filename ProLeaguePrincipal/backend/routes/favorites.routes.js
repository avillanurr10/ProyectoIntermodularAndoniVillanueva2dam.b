import express from "express";
import { pool as db } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, league, teamId, teamName } = req.body;

  try {
    await db.query(
      "INSERT INTO favorites (user_id, league, team_id, team_name) VALUES (?, ?, ?, ?)",
      [userId, league, teamId, teamName]
    );

    res.json({ message: "Favorito añadido" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Ya es favorito" });
    }
    console.error(err);
    res.status(500).json({ error: "Error añadiendo favorito" });
  }
});
router.get("/:userId", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM favorites WHERE user_id = ?",
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo favoritos" });
  }
});
router.delete("/", async (req, res) => {
  const { userId, league, teamId } = req.body;

  try {
    await db.query(
      "DELETE FROM favorites WHERE user_id=? AND league=? AND team_id=?",
      [userId, league, teamId]
    );
    res.json({ message: "Favorito eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando favorito" });
  }
});

export default router;
