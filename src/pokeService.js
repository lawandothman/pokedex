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
  let evoData = evoChains.data.chain;
  const numOfEvolutions = evoData.evolves_to.length;
  const evoChain = [];
  do {
    evoChain.push({
      name: evoData.species.name
    });

    evoData = evoData["evolves_to"][0];
  } while (!!evoData && evoData.hasOwnProperty("evolves_to"));
  const resolvedPromises = await Promise.all(evoChain);
  return resolvedPromises;
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
