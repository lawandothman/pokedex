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
  const species = await getPokemonSpecies(id);
  const evoChainUrl = species.data.evolution_chain.url;
  const evoChains = await axios.get(evoChainUrl);
  let evoData = evoChains.data.chain;
  const numOfEvolutions = evoData.evolves_to.length; // what if a pokemon has more than 1 evoChain

  const evoChain = [];
  do {
    evoChain.push({
      name: evoData.species.name,
      url: evoData.species.url
    });

    evoData = evoData["evolves_to"][0];
  } while (!!evoData && evoData.hasOwnProperty("evolves_to"));
  const resolvedPromises = await Promise.all(evoChain);

  // get pokemon images
  const pokemonImages = [];
  for (url of evoChain) {
    const speciesData = await axios.get(url.url);
    const id = speciesData.data.id;

    const pokemon = await getPokemon(id);
    pokemonImages.push({
      image: pokemon.sprites.front_default,
      name: pokemon.name
    });
  }
  console.log(resolvedPromises);
  return {
    resolvedPromises,
    pokemonImages
  };
}

async function getPokemonSpecies(id) {
  const url = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
  const species = await axios.get(url);
  return species;
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
