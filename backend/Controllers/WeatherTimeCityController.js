const controller = {};
const citys = require('../../service/init_citys.service');
const momentTz = require('moment-timezone');
const clientRedis = require('../redis');
const rp = require('request-promise');
const {promisify} = require('util');
const getAsync = promisify(clientRedis.get).bind(clientRedis);
const urlRestApi = process.env.URL_REST_API; //'https://api.darksky.net/forecast/e2af05dcb1b168c821fca2997baf39a8/';



controller.save = (req, res) => {
    const timestamp = new Date().getTime();
    try {
        citys.forEach((item) => {
            clientRedis.exists(`latitude_${item.name}`, (err, reply) => {
                if (!reply) {
                    clientRedis.set(`latitude_${item.name}`, item.latitude, redis.print);
                }
            });

            clientRedis.exists(`longitude_${item.name}`, (err, reply) => {
                if (!reply) {
                    clientRedis.set(`longitude_${item.name}`, item.longitude, redis.print);
                }
            });
        });

        res.send({state: 1, message: 'Save success'});
    } catch (e) {
        clientRedis.hmset('api.errors', {
            [timestamp]: `La API Request fallo, save city`
        });
        res.status(500).send({state: 0, message: 'An error occurred, please contact the administrator'});
    }
};


controller.getInfoCity = async (req, res) => {
    let {city} = req.params;
    const timestamp = new Date().getTime();
    isValidRequest(clientRedis, res, city);

    try {
        // get long - lat to redis //
        let longitude = await getAsync(`longitude_${city}`);
        let latitude = await getAsync(`latitude_${city}`);

        let urlFull = `${urlRestApi}${latitude},${longitude}?units=si`;
        let dw = await rp(urlFull);
        dw = JSON.parse(dw);

        let date_time = momentTz.tz(dw.currently.time * 1000, dw.timezone);
        let data = {
            timezone: dw.timezone,
            time: dw.currently.time,
            temperature: dw.currently.temperature.toFixed(1) + " C",
            date_time: date_time,
            time_format: date_time.format('H:m:s'),
        };
        res.send({
            state: 1,
            message: 'Success data',
            data: data
        });

    } catch (e) {
        console.log("error exception", e.message);
        clientRedis.hmset('api.errors', {
            [timestamp]: `The city ${city} could not be returned`
        });
        res.status(500).send({state: 0, message: 'An error occurred, please contact the administrator'});
    }
};

function isValidRequest(clientRedis, res, city) {
    let timestamp = new Date().getTime();
    let isError = Math.random() < 0.1;
    if (isError) {
        clientRedis.hmset('api.errors', {
            [timestamp]: `The API Request Failed, city ${city}`
        });
        res.status(422).send({state: 0, message: 'How unfortunate! The API Request Failed'});
    }
}

module.exports = controller;
