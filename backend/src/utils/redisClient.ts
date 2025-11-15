import { createClient } from "redis";

const redisClient = createClient({
    url:'redis://127.0.0.1:6379'
})

redisClient.on('connect', ()=>{
    console.log('Redis connected successfully')
})

redisClient.on('error', (err)=>{
    console.error('redis error', err)
});

(async ()=>{
    await redisClient.connect()
})();

export default redisClient;