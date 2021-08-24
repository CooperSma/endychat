import { stdin } from 'process';
import WebSocket, { createWebSocketStream } from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const ws = new WebSocket(process.env.WS_CLIENT_URL);

const duplex = createWebSocketStream(ws, { encoding: 'utf8' });

duplex.pipe(process.stdout);
process.stdin.pipe(duplex);