const redis_url = process.env.REDIS_URL || '//127.0.0.1:6379';
const redis = require('redis');
const clientRedis = redis.createClient(redis_url);

clientRedis.on('connect', () => {
    console.log('Redis client connected');
});

clientRedis.on('error', (err) => {
    console.log('Something went wrong ' + err);
});


module.exports = clientRedis;
