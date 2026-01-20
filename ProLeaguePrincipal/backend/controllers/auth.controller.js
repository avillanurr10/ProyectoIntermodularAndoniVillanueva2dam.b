import bcrypt from "bcrypt";
import { pool as db } from "../db.js"; // renombramos pool como db aquí

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Faltan campos" });

  try {
    // Verificar si ya existe usuario o email
    const [existing] = await db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existing.length > 0)
      return res.status(400).json({ error: "Usuario o email ya existe" });

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en BD
    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error en register:", err);
    res.status(500).json({ error: "Error registrando usuario" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Faltan campos" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    res.json({
      message: "Login correcto",
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error iniciando sesión" });
  }
};
