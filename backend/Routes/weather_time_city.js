const express = require('express');
const router = express.Router();
const WeatherTimeCityController = require('../Controllers/WeatherTimeCityController');


router.get('/api/info/city/:city/', WeatherTimeCityController.getInfoCity);

router.get('/api/info/cities', WeatherTimeCityController.getInfoCityAll);

router.post('/save/cities', WeatherTimeCityController.save);

module.exports = router;
