const controller = {};
const weatherTimeCityRepository = require('../Repositories/WeatherTimeCityRepository');

const clientRedis = require('../redis');


controller.save = (req, res) => {
    try {
        let resp = weatherTimeCityRepository.save();
        res.send(resp);
    } catch (e) {
        console.log("error exception", e.message);
        res.status(400).send({state: 0, message: e.message});
    }
};


controller.getInfoCity = async (req, res) => {
    let {city} = req.params;

    try {
        if (isErrorRequest(city)) {
            res.status(422).send({state: 2, message: 'How unfortunate! The API Request Failed'});
        }
        let data = await weatherTimeCityRepository.getInfoCity(city);
        res.send({state: 1, message: 'Success data', data});
    } catch (e) {
        console.log("error exception", e.message);
        res.status(400).send({state: 0, message: e.message});
    }
};

function isErrorRequest(city) {
    let timestamp = new Date().getTime();
    let isError = Math.random() < 0.1;
    if (isError) {
        clientRedis.hmset('api.errors', {
            [timestamp]: `The API Request Failed, city ${city}`
        });
        return 1;
    }
    return 0;
}

module.exports = controller;
