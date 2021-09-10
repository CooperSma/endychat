import { randomUUID } from 'crypto';
import WebSocket, { WebSocketServer } from 'ws';
import chalk from 'chalk';
import websocat from 'websocat';

process.on('SIGINT', function() {
  process.exit();
});

const wss = new WebSocketServer({ port: 8080 });
console.log(chalk.blue(`
 ########::'########:'##::::::::::'###::::'##:::'##:
 ##.... ##: ##.....:: ##:::::::::'## ##:::. ##:'##::
 ##:::: ##: ##::::::: ##::::::::'##:. ##:::. ####:::
 ########:: ######::: ##:::::::'##:::. ##:::. ##::::
 ##.. ##::: ##...:::: ##::::::: #########:::: ##::::
 ##::. ##:: ##::::::: ##::::::: ##.... ##:::: ##::::
 ##:::. ##: ########: ########: ##:::: ##:::: ##::::
 (server)
 https://github.com/relayapp-chat/relay-server

`));
console.log(("--> Server is listening on port " + wss.address().port))
wss.on('connection', function connection(ws, req) {
  ws.uuid = randomUUID();
  ws.name = ws.uuid;
  ws.username = null;
  ws.on('message', function incoming(message) {
    if(String(message).startsWith("/register")) {
      let submittedUsername = String(message).substring(10);
      let takenAlready;
      submittedUsername = String(submittedUsername).substring(0, submittedUsername.length - 1)
      wss.clients.forEach(function each(client) {
        if(client.username == submittedUsername) {
          takenAlready = true;
        }
      })
      if (takenAlready == true) {
        ws.send("Username already taken \n");
      } else {
        ws.username = submittedUsername;
        ws.name = ws.username;
        console.log(('--> ' + ws.uuid + ' is now known as ' + ws.name));
      }
    }
    else if(String(message).startsWith("/msg")){
      let user = String(message).substring(4);
      ws.send((`Type your message to ${user}: `))
      


    } 
    else {
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send("[" + ws.name + ']: ' + message + '\n');
        }
      });
    } 
  });
  console.log(('--> ' + ws.name + ' has joined the chat'));
  wss.clients.forEach(function each(client) { 
    if(client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(('--> ' + ws.name + ' has joined the chat') + '\n') 
    } else if(client === ws && client.readyState === WebSocket.OPEN) {
      client.send(("--> You have joined the chat") + '\n')
    }
  });
  ws.on('close', function close(req) {
    wss.clients.forEach(function each(client) { 
      client.send(('--> ' + ws.name + ' has left the chat') + '\n') 
    });
    console.log(("--> " + ws.name + ' has left the chat'));
  });
});

await websocat.create({
  listen: "tcp-l:0.0.0.0:8081",
  host: "ws://127.0.0.1:8080",
  exitOnEOF: false,
  binary: false,
})
