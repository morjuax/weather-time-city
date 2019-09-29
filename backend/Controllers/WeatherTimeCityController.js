const controller = {};
const weatherTimeCityRepository = require('../Repositories/WeatherTimeCityRepository');

const clientRedis = require('../redis');


controller.save = (req, res) => {
    try {
        clientRedis.exists('init_app', async (err, reply) => {
            if (!reply) {//first
                clientRedis.set('init_app', 1);
                let resp = weatherTimeCityRepository.saveUpdateData();
                res.send(resp);
            } else {
                res.send({state: 1, message: 'Data updated'});
            }
        });

    } catch (e) {
        console.log("error exception", e.message);
        res.status(400).json({state: 0, message: e.message});
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

controller.getInfoCityAll = async (req, res) => {

    try {
        if (isErrorRequest()) {
            res.status(422).json({state: 2, message: 'How unfortunate! The API Request Failed'});
        }
        let data = await weatherTimeCityRepository.getInfoCityAll();
        res.send({state: 1, message: 'Success data', data});
    } catch (e) {
        console.log("error exception", e.message);
        res.status(400).json({state: 0, message: e.message});
    }
};

function isErrorRequest() {
    let timestamp = new Date().getTime();
    let isError = Math.random() < 0.1;
    if (isError) {
        clientRedis.hmset('api.errors', {
            [timestamp]: `The API Request Failed, emulated error`
        });
        return 1;
    }
    return 0;
}

module.exports = controller;
