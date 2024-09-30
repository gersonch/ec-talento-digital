const http = require("http");
const fs = require("fs/promises");
const { read } = require("fs");

const server = http.createServer(async (req, res) => {
  const { searchParams, pathname } = new URL(
    req.url,
    `http://${req.headers.host}`
  );
  const params = new URLSearchParams(searchParams);

  if (pathname == "/anime" && req.method == "GET") {
    const readingFile = await fs.readFile("anime.json");
    const animeData = JSON.parse(readingFile);
    const id = params.get("id");

    if (id) {
      const anime = animeData[id];
      if (anime) {
        res.write(JSON.stringify(anime));
      } else {
        res.statusCode = 404;
        res.write(JSON.stringify({ error: "no encontrado" }));
      }
    } else {
      res.write(JSON.stringify(animeData));
    }
    res.end();
  }

  //---------------------------------------------------------------------------

  if (pathname == "/anime" && req.method == "POST") {
    const originalFile = await fs.readFile("anime.json");
    const originalData = JSON.parse(originalFile);
    const newID = Object.keys(originalData).length + 1;

    let animeData = "";

    req.on("data", (data) => {
      animeData = JSON.parse(data);
    });
    req.on("end", async () => {
      originalData[newID] = animeData;
      await fs.writeFile("anime.json", JSON.stringify(originalData, null, 2));
      res.write("anime agregado");
      res.end();
    });

    //-----------------------------------------------------------------------------
  }
  if (pathname == "/anime" && req.method == "PUT") {
    const id = params.get("id");
    const fileData = await fs.readFile("anime.json");
    const originalObjectFile = JSON.parse(fileData);
    let dataToModified;
    req.on("data", (data) => {
      dataToModified = JSON.parse(data);
    });
    req.on("end", async () => {
      const originalAnime = originalObjectFile[id];
      const updatedAnime = { ...originalAnime, ...dataToModified };

      originalObjectFile[id] = updatedAnime;

      await fs.writeFile(
        "anime.json",
        JSON.stringify(originalObjectFile, null, 2)
      );
      res.write("updated");
      res.end();
    });
  }
  //----------------------------------------------------------------------
  if (pathname == "/anime" && req.method == "DELETE") {
    const originalAnime = await fs.readFile("anime.json");
    const originalObjectFile = JSON.parse(originalAnime);
    const id = params.get("id");
    delete originalObjectFile[id];

    await fs.writeFile(
      "anime.json",
      JSON.stringify(originalObjectFile, null, 2)
    );

    res.write("anime eliminado");
    res.end();
  }
});

module.exports = server;
