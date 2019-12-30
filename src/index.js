const express = require("express");
const nunjucks = require("nunjucks");
const axios = require("axios");
const app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.use(express.static("public"));

app.get("/", async function(req, res) {
  console.log(req.query.page);
  const page = parseInt(req.query.page) || 0; //req.query returns a string !
  const limit = 20;
  const offset = page * limit;
  console.log("Someone is requesting the page /");
  const url = `https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`;
  const pokemonList = await axios.get(url);
  const promises = pokemonList.data.results.map(pokemon =>
    axios.get(pokemon.url)
  );
  const pokemon = await Promise.all(promises);
  res.render("index.html", {
    pokemons: pokemon,
    page
  });
});

app.get("/pokemon/:id", async (req, res) => {
  console.log("Someone is requesting a pokemon");
  const id = req.params.id;
  const pokemon = await getPokemon(id);
  const moves = [];
  for (move of pokemon.moves) {
    moves.push(axios.get(move.move.url));
  }
  const resolvePromises = await Promise.all(moves);
  res.render("pokemon.html", {
    number: id,
    pokemon,
    moves: resolvePromises
  });
});

async function getPokemon(id) {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await axios.get(url);
  const pokemon = res.data;
  return pokemon;
}

const listener = app.listen(process.env.PORT || 3000, function() {
  console.log("  Your app is listening on port  " + listener.address().port);
});
