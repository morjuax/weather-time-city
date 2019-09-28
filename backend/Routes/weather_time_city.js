const express = require('express');
const router = express.Router();
const WeatherTimeCityController = require('../Controllers/WeatherTimeCityController');


router.get('/api/info/city/:city/', WeatherTimeCityController.getInfoCity);

router.post('/save/citys', WeatherTimeCityController.save);

module.exports = router;
