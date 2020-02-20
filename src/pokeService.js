const axios = require("axios");

async function getPokemon(id) {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await axios.get(url);
  const pokemon = res.data;
  return pokemon;
}

async function getPokemonMoves(id) {
  const pokemon = await getPokemon(id);
  const moves = [];
  for (move of pokemon.moves) {
    moves.push(axios.get(move.move.url));
  }
  const resolvePromises = await Promise.all(moves);
  return resolvePromises;
}
async function getPokemonEvoChain(id) {
  const url = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
  const species = await axios.get(url);
  const evoChainUrl = species.data.evolution_chain.url;
  const evoChains = await axios.get(evoChainUrl);
  const evoData = evoChains.data.chain;
  const evoChain = [];
  const numberOfEvolutions = evoData["evolves_to"].length;
  if (numberOfEvolutions > 1) {
    for (let i = 1; i < numberOfEvolutions; i++) {
      evoChain.push({
        "species-name": evoData["evolves_to"][i].species.name
      });
    }
  }
  evoChain.push(evoData.evolves_to[0].species.name);

  console.log(evoChain, numberOfEvolutions);
}

async function getPokemonList(page) {
  const limit = 20;
  const offset = page * limit;
  const url = `https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`;
  const pokemonList = await axios.get(url);
  const maxNumOfPokemons = pokemonList.data.count;
  const maxNumOfPages = Math.ceil(maxNumOfPokemons / limit);
  const promises = pokemonList.data.results.map(pokemon =>
    axios.get(pokemon.url)
  );
  const pokemons = await Promise.all(promises);
  return {
    pokemons,
    maxNumOfPages,
    maxNumOfPokemons
  };
}

module.exports = {
  getPokemon,
  getPokemonMoves,
  getPokemonList,
  getPokemonEvoChain
};
