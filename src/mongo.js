import mongoose from 'mongoose';
import dotenv from 'dotenv-defaults';

export default {
    connect: () => {
        dotenv.config();
        if (!process.env.MONGO_URL) {
            console.error("Missing MONGO_URL");
            process.exit(1);
        }
        mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 5000,
        }).then((res) => console.log("Connect to DB successfully"));
        mongoose.connection.on("error",
            console.error.bind(console, "connection error"));
    },
}

