const repository = {};
const momentTz = require('moment-timezone');
// const redis = require('redis');
const clientRedis = require('../redis');
const rp = require('request-promise');
const {promisify} = require('util');
// const getAsync = promisify(clientRedis.get).bind(clientRedis);
const getHAsync = promisify(clientRedis.hgetall).bind(clientRedis);
const urlRestApi = `${process.env.URL_REST_API}${process.env.KEY_REST_API}/`;
const cities = require('../../service/init_citys.service');
const {forEach} = require('p-iteration');

repository.save = () => {
    const timestamp = new Date().getTime();
    try {
        cities.forEach((item) => {
                clientRedis.hmset(`lat_log_${item.name}`, {
                        lat: item.latitude,
                        log: item.longitude
                    }
                );
            }
        );

        return {state: 1, message: 'Save success'};
    } catch (e) {
        clientRedis.hmset('api.errors', {
            [timestamp]: `API Request fail, save city`
        });
        throw Error('An error occurred, save info city');
    }
};

repository.getInfoCity = async (city) => {

    const timestamp = new Date().getTime();

    try {
        // get long - lat from redis //
        let lat_log = await getHAsync(`lat_log_${city}`);

        let urlFull = `${urlRestApi}${lat_log.lat},${lat_log.log}?units=si`;
        //console.log('Url Request: ', urlFull);
        let dw = await rp(urlFull); //request
        dw = JSON.parse(dw);

        let date_time = momentTz.tz(dw.currently.time * 1000, dw.timezone);
        return {
            timezone: dw.timezone,
            time: dw.currently.time,
            temperature: dw.currently.temperature.toFixed(1) + " C",
            date_time: date_time,
            time_format: date_time.format('H:m:s'),
        };

    } catch (e) {
        console.log("Error exception", e.message);
        clientRedis.hmset('api.errors', {
            [timestamp]: `The city ${city} could not be returned`
        });
        throw Error('An error occurred, request getInfoCity, ' + e.message);
    }
};


repository.getInfoCityAll = async () => {

    let data = [];
    try {

        await forEach(cities, async (city) => {
            let response = await repository.getInfoCity(city.name);
            response['city'] = city.name;
            data.push(response);
        });

    } catch (e) {
        throw Error('An error occurred, request getInfoCityAll, =>' + e.message);
    }

    return data;
};

module.exports = repository;
