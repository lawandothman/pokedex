const axios = require("axios");

async function getPokemon(id) {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await axios.get(url);
  const pokemon = res.data;
  return pokemon;
}

async function getPokemonByName(name) {
  const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
  const res = await axios.get(url);
  const pokemon = res.data;
  return pokemon;
}

async function getPokemonSpecies(id) {
  const url = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
  const res = await axios.get(url);
  const species = res.data;
  return species;
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
  const res = await axios.get(species.evolution_chain.url);
  let evoData = res.data.chain;
  const evoChain = [];
  do {
    const promises = getPokemonByName(evoData.species.name);
    const pokemon = await Promise.all([promises]);
    evoChain.push({
      name: evoData.species.name,
      id: pokemon[0].id,
      image: pokemon[0].sprites.front_default,
      min_level: !evoData.evolves_to[0]
        ? 1
        : evoData.evolves_to[0].evolution_details[0].min_level
    });
    const numOfEvolutions = evoData.evolves_to.length;
    if (numOfEvolutions > 1) {
      for (let i = 1; i < numOfEvolutions; i++) {
        const promises = getPokemonByName(evoData.evolves_to[i].species.name);
        const pokemon = await Promise.all([promises]);
        evoChain.push({
          name: evoData.evolves_to[i].species.name,
          id: pokemon[0].id,
          image: pokemon[0].sprites.front_default,
          min_level: !evoData.evolves_to[i].evolution_details[0].min_level
            ? 1
            : evoData.evolves_to[i].evolution_details[0].min_level
        });
      }
    }
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
