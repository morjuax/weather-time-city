const express = require('express');
const bodyParser = require('body-parser');
const momentTz = require('moment-timezone');
// const request = require('request');
const rp = require('request-promise');
const path = require('path');
// import citys from './service/init_citys.service'/
const citys = require('./service/init_citys.service');
const {promisify} = require('util');
const url = 'https://api.darksky.net/forecast/e2af05dcb1b168c821fca2997baf39a8/';

const app = express();
const port = process.env.PORT || 5000;

const redis_url = process.env.REDIS_URL || 'http://localhost::6379';


// Redis
let redis = require('redis').createClient(redis_url);
let clientRedis = redis.createClient();
clientRedis.on('connect', function () {
    console.log('Redis client connected');
});

clientRedis.on('error', function (err) {
    console.log('Something went wrong ' + err);
});
const getAsync = promisify(clientRedis.get).bind(clientRedis);


// Settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// Routes //
app.post('/save/citys', (req, res) => {
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

});


app.get('/api/info/city/:city/', async (req, res) => {
    const timestamp = new Date().getTime();
    let {city} = req.params;
    let isError = Math.random() < 0.1;
    if (isError) {
        clientRedis.hmset('api.errors', {
            [timestamp]: `The API Request Failed, city ${city}`
        });
        res.status(422).send({state: 0, message: 'How unfortunate! The API Request Failed'});
    }

    try {
        // get long - lat to redis //
        let longitude = await getAsync(`longitude_${city}`);
        let latitude = await getAsync(`latitude_${city}`);

        console.log(city, longitude, latitude);
        let urlFull = `${url}${latitude},${longitude}?units=si`;
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

});

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));

    // Handle React routing, return all requests to React app
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}


app.listen(port, () => console.log(`Listening on port ${port}`));
