import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import dns from "node:dns";
import mongoose from "mongoose";
import cors from "cors";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import { Server } from "socket.io";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.resolve(__dirname, "../../frontend/build");

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
}

app.use("/api/v1/users", userRoutes);

if (fs.existsSync(frontendBuildPath)) {
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/")) return next();
        res.sendFile(path.join(frontendBuildPath, "index.html"));
    });
}

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