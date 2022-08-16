const { Router } = require("express");
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const axios = require("axios");
const {Pokemon,Tipo} = require('../db')

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

const getApiInfo = async () => {
  try {
    const apiUrl = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?offset=0&limit=40"
    );
    const dataPokemons = apiUrl.data.results;
    const pokemons = await Promise.all(
      dataPokemons.map(async (elem) => {
        let details = await axios(elem.url);
        return {
          id: details.data.id,
          name: details.data.name,
          image: details.data.sprites.other.home.front_default,
          types: details.data.types.map((t) => t.type.name),
          hp: details.data.stats[0].base_stat,
          attack: details.data.stats[1].base_stat,
          defense: details.data.stats[2].base_stat,
          speed: details.data.stats[5].base_stat,
          height: details.data.height,
          weight: details.data.weight,
        };
      })
    );
    return pokemons;
  } catch (error) {
    throw error;
  }
};

const getDbInfo = async () => {
  return await Pokemon.findAll({
    include: {
      model: Tipo,
      attributes: ["nombre"],
      through: {
        attributes: [],
      },
    },
  });
};

const getAllPokemons = async () => {
    const apiInfo = await getApiInfo();
    const dbInfo = await getDbInfo();
    const infoTotal = apiInfo.concat(dbInfo);
    return infoTotal;
}
const getApiTipos = async () => {
  try {
    const apiUrl = await axios.get(
      "https://pokeapi.co/api/v2/type"
    );
    const dataTipos = apiUrl.data.results;
    const tipos = await Promise.all(
      dataTipos.map(async (elem) => {
        let details = await axios(elem.url);
        return {
          id: details.data.id,
          name: details.data.name,
        };
      })
    );
    return tipos;
  } catch (error) {
    throw error;
  }
};

router.get('/tipos', async (req,res) => {
  const name = req.query.name
  let tiposTotal = await getApiTipos();
      res.status(200).send(tiposTotal)
})

router.get('/pokemons', async (req,res) => {
    const name = req.query.name
    let pokemonsTotal = await getAllPokemons();
    if (name){  //si llega query name
        let pokemonName = await pokemonsTotal.filter( el => el.name.toLowerCase()===(name.toLowerCase()))
        if (pokemonName.length){                                                //.includes
            res.status(200).send(pokemonName)
        } else {
            res.status(404).send(`No existe el pokemon: ${name}`);
        }
    } else {
        res.status(200).send(pokemonsTotal)
    }
})

router.get('/pokemons/:id', async (req, res) => {
  const id = req.params.id;
  const pokemonsTotal = await getAllPokemons();
  if (id) {
    let pokemonId = await pokemonsTotal.filter( el => el.id == id);
    if (pokemonId.length) {
      res.status(200).json(pokemonId);
    } else {
      res.status(404).send(`No existe el pokemon con id: ${id}`)
    }
  }
})

module.exports = router;
