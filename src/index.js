const express = require("express");
const nunjucks = require("nunjucks");
const app = express();
const pokeService = require("./pokeService");

nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.use(express.static("public"));

app.get("/", async function(req, res) {
  const page = parseInt(req.query.page) || 0; //req.query returns a string !
  console.log(`Someone is requesting the page ${page}`);
  const pokemonList = await pokeService.getPokemonList(page)
  console.log (pokemonList)
  const pokemons = pokemonList.pokemons
  const maxNumOfPages = pokemonList.maxNumOfPages
  res.render("index.html", {
    pokemons,
    page,
    maxNumOfPages
  });
});

app.get("/pokemon/:id", async (req, res) => {
  console.log("Someone is requesting a pokemon");
  const id = req.params.id;
  const pokemon = await pokeService.getPokemon(id);
  const moves = await pokeService.getPokemonMoves(id);
  res.render("pokemon.html", {
    pokemon,
    moves
  });
});

const listener = app.listen(process.env.PORT || 3000, function() {
  console.log("Your app is listening on port  " + listener.address().port);
});
