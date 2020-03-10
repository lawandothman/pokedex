const axios = require("axios");
const BASE_URL = `https://pokeapi.co/api/v2`

const getFromUrl = async (url) => {
  try {
    console.log(`Getting ${url}`)
    const { data } = await axios.get(url)
    console.log(`Got ${url}`)
    return data
  } catch (e) {
    console.error(e)
  }
}
const get = (path) => (id) => getFromUrl(`${BASE_URL}${path}/${id}`)

const getPokemon = get('/pokemon')
const getPokemonSpecies = get('/pokemon-species')

async function getPokemonMoves(id) {
  const pokemon = await getPokemon(id);
  return Promise.all(pokemon.moves.map(move => getFromUrl(move.move.url)));
}

function flattenArray(arr) {
  return [].concat.apply([], arr)
}

function flatGraph(root) {
  if (root.evolves_to) {
    const { evolves_to } = root
    return [root].concat(flattenArray(evolves_to.map(flatGraph)))
  }
  return [root]
}

function getMinLevel(evo) {
  if (evo.evolution_details[0]) {
    return evo.evolution_details[0].min_level
  }
  return null
}

async function getPokemonEvoChain(id) {
  const species = await getPokemonSpecies(id);
  const evoData = (await axios.get(species.evolution_chain.url)).data.chain;
  const evoList = flatGraph(evoData)
  return Promise.all(evoList.map(async (evo, i) => {
    return {
      min_level: getMinLevel(evo),
      ...evo,
      ...(await getPokemon(evo.species.name))
    }
  }))
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
