// import redisClient from "./redisClient";

// export const clearEventCache = async(category: string) => {
//     try {
//         await redisClient.del('allEvents:all')

//         if(category){
//             await redisClient.del(`allEvents:${category}`)
//         }
//     } catch (error) {
//         console.error('error clearing event cache:', error)
//     }
// }