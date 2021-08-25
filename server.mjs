import { randomUUID } from 'crypto';
import WebSocket, { WebSocketServer } from 'ws';
import chalk from 'chalk';

const wss = new WebSocketServer({ port: 8080 });
console.log(chalk.blue(`
 ########: ##::: ##: ########:: ##::: ##:: ######:: ##:::: ##::::'###:::: ########:
 ##.....:: ###:: ##: ##.... ##:. ##:'##::'##... ##: ##:::: ##:::'## ##:::... ##..::
 ##::::::: ####: ##: ##:::: ##::. ####::: ##:::..:: ##:::: ##::'##:. ##::::: ##::::
 ######::: ## ## ##: ##:::: ##:::. ##:::: ##::::::: #########:'##:::. ##:::: ##::::
 ##...:::: ##. ####: ##:::: ##:::: ##:::: ##::::::: ##.... ##: #########:::: ##::::
 ##::::::: ##:. ###: ##:::: ##:::: ##:::: ##::: ##: ##:::: ##: ##.... ##:::: ##::::
 ########: ##::. ##: ########::::: ##::::. ######:: ##:::: ##: ##:::: ##:::: ##::::
........::..::::..::........::::::..::::::......:::..:::::..::..:::::..:::::..:::::
`))
wss.on('connection', function connection(ws, req) {
  ws.uuid = randomUUID();
  ws.name = ws.uuid;
  ws.username = null;
  ws.on('message', function incoming(message) {
    if(String(message).startsWith("/register")) {
      ws.username = String(message).substring(10)
      ws.username = String(ws.username).substring(0, ws.username.length - 1);
      ws.name = ws.username;
    } else {
      console.log("[" + req.socket.remoteAddress + ']: ' + message);
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send("[" + ws.name + ']: ' + message);
        }
      });
    } 
  });
  console.log(ws.name + ' has joined the chat')
  wss.clients.forEach(function each(client) { 
    if(client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(ws.name + ' has joined the chat' + '\n') 
    } else if(client === ws && client.readyState === WebSocket.OPEN) {
      client.send("--> \x1b[32m You have joined the chat" + '\n')
    }
  });
  ws.on('close', function close(req) {
    wss.clients.forEach(function each(client) { 
      client.send(ws.name + ' has left the chat' + '\n') 
    });
  });
});

