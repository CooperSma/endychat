import { randomUUID } from 'crypto';
import WebSocket, { WebSocketServer } from 'ws';
import bodyParser from "body-parser";
import chalk from 'chalk';
import * as Commands from './Commands.mjs';
import * as Channels from './Channels.mjs';
// const express = require("express");
// const bodyParser = require("body-pdarser");
import express from 'express';

const app = express();

app.get("/", (req, res) => {
    res.send("frick you cooper");
});

app.listen(3000);
 

process.on('SIGINT', function() {
  process.exit();
});
console.log()

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

function broadcastToAll(wss,ws,message,allButClient,channelRespecting) {
  wss.clients.forEach(function each(client) {
    if(channelRespecting == true) {
      if(allButClient == true) {
        if (client.readyState === WebSocket.OPEN && client != ws && ws.channel.name == client.channel.name) {
          client.send(message);
        }
      } else {
        if (client.readyState === WebSocket.OPEN && ws.channel.name == client.channel.name) {
          client.send(message)
        }
      }
    } else {
      if(allButClient == true) {
        if (client.readyState === WebSocket.OPEN && client != ws) {
          client.send(message);
        }
      } else {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      }

    }
  });
}


console.log(("--> Server is listening on port " + wss.address().port))

wss.on('connection', function connection(ws, req) {
  ws.uuid = randomUUID();
  ws.name = ws.uuid;
  ws.username = null;
  ws.channel = Channels.channels[0]
  console.log(('--> ' + ws.name + ' has joined the chat'));
  wss.clients.forEach(function each(client) { 
    if(client == ws && client.readyState == WebSocket.OPEN) {
      client.send(("--> You have joined the chat") + '\n') 
    } else if(client.readyState === WebSocket.OPEN) {
      client.send(('--> ' + ws.name + ' has joined the chat') + '\n')
    }
  });
  
  ws.on('message', function incoming(message) {
    message = String(message);
    console.log(message)
    Promise.any(Commands.promises(message)).then(callback => callback(ws,wss,WebSocket,Channels,message)).catch(res => {
      broadcastToAll(wss,ws,`[${ws.name} ${ws.channel.name}]: ${message}\n`,false,true);
    });
  })

  ws.on('close', function close(req) {
    wss.clients.forEach(function each(client) { 
      client.send(('--> ' + ws.name + ' has left the chat') + '\n') 
    });
    console.log(("--> " + ws.name + ' has left the chat'));
  });

});