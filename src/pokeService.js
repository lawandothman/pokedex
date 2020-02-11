const axios = require("axios");

async function getPokemon(id) {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await axios.get(url);
  const pokemon = res.data;
  return pokemon;
}

module.exports = { getPokemon };
