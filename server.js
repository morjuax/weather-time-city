const express = require('express');
const bodyParser = require('body-parser');
const momentTz = require('moment-timezone');
const request = require('request');
const path = require('path');
// import citys from './service/init_citys.service'/
const citys = require('./service/init_citys.service');
const {promisify} = require('util');
const url = 'https://api.darksky.net/forecast/e2af05dcb1b168c821fca2997baf39a8/';

const app = express();
const port = process.env.PORT || 5000;


// Redis
let redis = require('redis');
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
});


app.get('/api/info/city/:city/', (req, res) => {
    let {city} = req.params;
    let isError = Math.random() < 0.1;
    if (isError) {
        const dataError = {
            type: 'api.errors',
            message: `La API Request fallo, ciudad ${city}`
        };
        clientRedis.hmset(new Date().getTime(), dataError);
        throw new Error('How unfortunate! The API Request Failed');
    }

    async function getLongitude() {
        return await getAsync(`longitude_${city}`);
    }

    async function getLatitude() {
        return await getAsync(`latitude_${city}`);
    }

    (async () => {
        let longitude = await getLongitude();
        let latitude = await getLatitude();
        console.log(city, longitude, latitude);
        request(`${url}${latitude},${longitude}?units=si`, (error, response, body) => {
            let b = JSON.parse(body);
            let date_time = momentTz.tz(b.currently.time * 1000, b.timezone);
            let data = {
                timezone: b.timezone,
                time: b.currently.time,
                temperature: b.currently.temperature.toFixed(1) + " C",
                date_time: date_time,
                time_format: date_time.format('H:m:s'),
            };
            res.json(data);
        });
    })();

});

// if (process.env.NODE_ENV === 'production') {
//     // Serve any static files
//     app.use(express.static(path.join(__dirname, 'client/build')));
//
//     // Handle React routing, return all requests to React app
//     app.get('*', function(req, res) {
//         res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
//     });
// }


app.listen(port, () => console.log(`Listening on port ${port}`));