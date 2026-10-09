import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    app.set("mongo_user")
    const mongoUri = process.env.MONGO_URL || "mongodb+srv://imdigitalashish:imdigitalashish@cluster0.cujabk4.mongodb.net/";
    const connectionDb = await mongoose.connect(mongoUri)

    console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
    server.listen(app.get("port"), () => {
        console.log(`LISTENIN ON PORT ${app.get("port")}`)
    });
}



start();