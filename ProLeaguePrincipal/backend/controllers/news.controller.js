import axios from "axios";
import * as cheerio from "cheerio";

export const getNews = async (req, res) => {
  const category = req.query.category || "nba"; // 'nba' o 'nfl', por defecto nba
  
  let url = "";
  if (category.toLowerCase() === "nba") {
    url = "https://www.espn.com/espn/rss/nba/news";
  } else if (category.toLowerCase() === "nfl") {
    url = "https://www.espn.com/espn/rss/nfl/news";
  } else {
    return res.status(400).json({ error: "Categoría no válida. Use 'nba' o 'nfl'." });
  }

  try {
    const response = await axios.get(url);
    const xmlData = response.data;
    const $ = cheerio.load(xmlData, { xmlMode: true });
    
    const items = [];
    
    $("item").each((i, el) => {
      const item = $(el);
      const title = item.find("title").text();
      const description = item.find("description").text();
      const link = item.find("link").text();
      const pubDate = item.find("pubDate").text();
      
      // Intentar extraer imagen si existe en description o media:content (depende del feed)
      // En los feeds de ESPN a veces la imagen no viene explícita en una etiqueta limpia,
      // pero el frontend ya manejaba una imagen estática local por categoría, así que
      // devolveremos los datos básicos y que el frontend decida la imagen.
      
      items.push({
        title,
        description,
        link,
        pubDate,
        category: category.toUpperCase() // Para que el frontend sepa qué logo poner
      });
    });

    res.json(items);

  } catch (error) {
    console.error("Error al obtener RSS:", error.message);
    res.status(500).json({ error: "Error al obtener noticias externas" });
  }
};
