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
  console.log("Someone is requesting the page /");
  const url = "https://pokeapi.co/api/v2/pokemon/";
  const pokemonList = await axios.get(url);
  console.log(pokemonList);
  const promises = pokemonList.data.results.map(pokemon =>
    axios.get(pokemon.url)
  );
  const pokemons = await Promise.all(promises);
  console.log(pokemons);
  res.render("index.html", {
    pokemon: pokemons
  });
});

app.get("/pokemon/:id", async (req, res) => {
  console.log("Someone is request a pokemon");
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
