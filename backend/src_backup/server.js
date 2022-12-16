import express from 'express';
import mongo from './mongo';
import http from 'http';
import WebSocket from 'ws';
import mongoose from 'mongoose';

import wsConnect from './wsConnect';

mongo.connect();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const db = mongoose.connection

db.once("open", () => {
    console.log("MongoDB connected!");
    wss.on('connection', (ws) => {
        ws.onmessage = wsConnect.onMessage(wss, ws);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => { });
