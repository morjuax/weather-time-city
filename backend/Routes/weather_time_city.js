const express = require('express');
const router = express.Router();
const WeatherTimeCityController = require('../Controllers/WeatherTimeCityController');


router.get('/api/info/city/:city/', WeatherTimeCityController.getInfoCity);
//
// router.get('/:id', EmployeController.edit);

router.post('/save/citys', WeatherTimeCityController.save);

// router.put('/:id', EmployeController.update);
//
// router.delete('/:id', EmployeController.destroy);

module.exports = router;
