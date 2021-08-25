import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws, req) {
  ws.on('message', function incoming(message) {
    console.log("[" + req.socket.remoteAddress + ']: ' + message);
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send("[" + req.socket.remoteAddress + ']: ' + message);
      }
    });
  });
  console.log(req.socket.remoteAddress + ' has joined the chat')
  wss.clients.forEach(function each(client) { 
    if(client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(req.socket.remoteAddress + ' has joined the chat' + '\n') 
    } else if(client === ws && client.readyState === WebSocket.OPEN) {
      client.send("--> \x1b[32m You have joined the chat" + '\n')
    }
  });
});
