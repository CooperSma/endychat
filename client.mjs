import { stdin } from 'process';
import WebSocket, { createWebSocketStream } from 'ws';

const ws = new WebSocket('ws://localhost:8080');

const duplex = createWebSocketStream(ws, { encoding: 'utf8' });

duplex.pipe(process.stdout);
process.stdin.pipe(duplex);