const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const axios = require('axios');
const { API_KEY } = process.env;
const { Dog, Temperament } = require('../db')
const router = Router();



const  {getAllDogs}  = require('../controllers/DogRControllers');

router.get('/dogs', async (req, res) => {
    /* http://localhost:3001/dogs && http://localhost:3001/dogs/?name=Affenpinscher */
        const name = req.query.name;
        try {
            let dogsTotal = await getAllDogs();
            if (name) { /* Si entra un query */
                let dogName = await dogsTotal.filter(
                    dog => dog.name.toLowerCase().includes(name.toLowerCase())
                );
                dogName.length ?
                    res.status(200).send(dogName) :
                    res.status(404).send("Cann't find the dog with the name you are looking for")
            } else { /* Si no hay query en la URL */
                res.status(200).json(dogsTotal)
            }
        } catch (error) {
            res.status(404).json("There is no dog's with this name")
        }

    });



                
/*router.get('/dogs', async (req,res)=>{
    const name = req.query.name
    const allDogs = await getAllDogs();
    if (name){
        const dog = await allDogs.filter(el => el.name.toLowerCase().includes(name.toLowerCase()));
        dog.length ? 
        res.status(200).send(dog) :
        res.status(404).send("Dog not found")
    } else {
        res.status(200).send(allDogs)
    }
});*/


router.get('/dogs/:raceId', async (req, res, next) => {
    const { raceId } = req.params;
    const allRaces = await getAllDogs();
    if (raceId) {
        let race = await allRaces.filter(e => e.id == raceId);
        race.length ?
            res.status(200).json(race) :
            res.status(404).json(`Perdon, el ID '${raceId}' No aparece`)
    }
});

router.get( "/dog/",
    /* http://localhost:3001/dog/?temperament=active */ async (req, res) => {
      const temperament = req.query.temperament;
      const everyDog = await getAllDogs();
  
      const dogSearchResult = everyDog.filter((dog) => {
        if (temperament === "all") return everyDog;
        else if (dog.temperament) {
          return dog.temperament
            .toLowerCase()
            .includes(temperament.toLowerCase());
        }
      });
  
      res.status(200).json(dogSearchResult);
    }
  );
  


/*router.get('/temperament', async (req, res, next) => {
    let infoApi = await axios(`https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}`)
    try {
        let allTemperament = infoApi.data.map(allDogs => allDogs.temperament ? allDogs.temperament : 'no temperament').join(',').split(',')
        let filterTemperament = allTemperament.filter(temper => temper !== 'no temperament')
        let eTemper = [... new Set(filterTemperament)]
        eTemper.forEach(temper => {
            Temperament.findOrCreate({
                where: { name: temper }
            })
        })
        let temperDB = await Temperament.findAll()
        res.status(200).send(temperDB)
    } catch (error) {
        res.status(404).send(error)

    }
});*/

router.get('/temperament',/* http://localhost:3001/temperament */ async (req, res) => {
    const allData = await axios.get(`https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}`);
    try {
        let everyTemperament = allData.data.map((dog) => dog.temperament ? dog.temperament : "No info").map((dog) => dog?.split(', '));
        /* Set para hacer UNIQUE :: Stackoverflow */
        let eachTemperament = [...new Set(everyTemperament.flat())];
        eachTemperament.forEach(el => {
            if (el) { // temperament : ,
                Temperament.findOrCreate({
                    where: { name: el }
                });
            }
        });
        eachTemperament = await Temperament.findAll();
        res.status(200).json(eachTemperament);
    } catch (error) {
        res.status(404).send(error)
    }
});

router.post('/dogs', async (req, res) => {
    let {
        name,
        height_min,
        height_max,
        weight_min,
        weight_max,
        life_span,
        image,
        temperament,
        createdInDB,
    } = req.body
    let raceCreated = await Dog.create({
        name,
        height_min,
        height_max,
        weight_min,
        weight_max,
        life_span: life_span ,
        image,
        createdInDB,
    })
    if(name && height_min && height_max && weight_max && weight_min && life_span && req.body.temperament){
    let temperamentDB = await Temperament.findAll({
        where: {
            name: req.body.temperament
        }
    })

    raceCreated.addTemperament(temperamentDB)
    res.status(200).send('Raza creada')
}else {
    res.status(404).send('Data needed to proceed is missing')
}  

})
/*router.post('/dogs', async (req, res) => {
    var { // takes these properties to build the new dog
        name,
        height_min,
        height_max,
        weight_min,
        weight_max,
        life_span,
        temperament,
        image,
    } = req.body;
    
    if(!image){
        try {
            image = await (await axios.get('https://dog.ceo/api/breeds/image/random')).data.message;
        } catch (error) {
            console.log(error)
        }
    }

    if (name && height_min && height_max && weight_min && weight_max && temperament && image) {
        // takes that data for the new dog  
        const createDog = await Dog.create({
            name: name,
            height_min: parseInt(height_min),
            height_max: parseInt(height_max),
            weight_min: parseInt(weight_min),
            weight_max: parseInt(weight_max),
            life_span: life_span,
            image: image || 'https://dog.ceo/api/breeds/image/random',
        });
        temperament.map(async el => {
            const findTemp = await Temperament.findAll({
                where: { name: el }
            });
            createDog.addTemperament(findTemp);
        })
        res.status(200).send(createDog);
    } else {
        res.status(404).send('Data needed to proceed is missing');
    }
})*/






// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


module.exports = router;

