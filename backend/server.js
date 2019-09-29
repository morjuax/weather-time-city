if (process.env.NODE_ENV == 'development') {
    require('dotenv').config();
}
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const socketIo = require('socket.io');
const weatherTimeCityRepository = require('./Repositories/WeatherTimeCityRepository');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 5000;

// Importing routes
const weatherTimeCityRoutes = require('./Routes/weather_time_city');
// Routes
app.use(weatherTimeCityRoutes);

// Settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Handle React routing, return all requests to React app
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

io.on('connection', socket => {
    setInterval(async () => {
         let data = await weatherTimeCityRepository.getInfoCityAll();
        socket.broadcast.emit('request_city', data)
    }, 10000);

});


server.listen(port, () => console.log(`Listening on port ${port}`));
