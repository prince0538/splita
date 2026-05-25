const Redis = require('ioredis');

const redis = new Redis('redis://default:L8cl4oV2JIhW6Fds6grjmXupVFszlb2T@textural-revamped-celery-26770.db.redis.io:10112')
redis.on("error", err => console.log('unable to connect to redis', err.message))

redis.on('connect', () => console.log('Redis connected'))

module.exports = redis;