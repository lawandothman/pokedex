const express = require("express");
const nunjucks = require("nunjucks");
const axios = require("axios");
const app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(express.static("public"));

app.get("/", function(request, response) {
  console.log("Someone is requesting the page /");
  response.render("index.html");

});

app.get("/pokemon/:id", async (req, res) => {
  console.log("Someone is request a pokemon")
  const id = req.params.id
  const pokemon = await getPokemon(id)
  const moves = [];
  for(move of pokemon.moves) {
      moves.push(axios.get(move.move.url))
  }
  const resolvePromises = await Promise.all(moves)

  console.log(resolvePromises)
  res.render("pokemon.html", {
    number: id, 
    pokemon,
    moves: resolvePromises,
  })
})

// for moves :  type name 


async function getPokemon(id) {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`
  const res = await axios.get(url)
  const pokemon = res.data
  return pokemon
}


const listener = app.listen(process.env.PORT | 3000, function() {
  console.log("Your app is listening on port  " + listener.address().port);
});
