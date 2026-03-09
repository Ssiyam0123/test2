import mongoose from "mongoose";
import dns from "dns"; // 1. Import Node's native DNS module (no npm install needed)

// dns.setServers(['8.8.8.8', '1.1.1.1']);

export const connectDb = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`database is connected ${conn.connection.host}`)
    } catch (error) {
        console.log("error from database",error);
        process.exit(1);
    }
}   