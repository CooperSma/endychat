import { randomUUID } from 'crypto';
import WebSocket, { WebSocketServer } from 'ws';
import bodyParser from "body-parser";
import chalk from 'chalk';
import * as Commands from './Commands.mjs';
import * as Channels from './Channels.mjs';
import Koa from 'koa';
import Router from 'koa-router';
import websocket from 'koa-easy-ws';
import { ClientRequest } from 'http';

const app = new Koa();
const router = new Router();
app.use(websocket())
let connections = [];
function broadcastToAll(connections,ws,message,allButClient,channelRespecting) {
  connections.forEach(function each(client) {
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
router.get("/channels", async ctx => {
    ctx.body = Channels.channels;
});
router.get("/server", async ctx => {
  if (ctx.ws) {
    const ws = await ctx.ws()
    ws.uuid = randomUUID();
    ws.name = ws.uuid;
    ws.username = null;
    ws.channel = Channels.channels[0]
    ws.connectionID = Number(connections.push(ws)) - 1;
    connections[ws.connectionID] = ws;
    console.log(('--> ' + ws.name + ' has joined the chat'));
    connections.forEach(function each(client) { 
      if(client == ws && client.readyState == WebSocket.OPEN) {
        client.send(("--> You have joined the chat") + '\n') 
      } else if(client.readyState === WebSocket.OPEN) {
        client.send(('--> ' + ws.name + ' has joined the chat') + '\n')
      }
    });
  
    ws.on('message', function incoming(message) {
        message = String(message);
        console.log(message)
        Promise.any(Commands.promises(message)).then(callback => callback(ws,connections,WebSocket,Channels,message)).catch(res => {
            broadcastToAll(connections, ws,`[${ws.name} ${ws.channel.name}]: ${message}\n`,false,true);
        });
    })

    ws.on('close', function close(req) {
        connections.forEach(function each(client) { 
            client.send(('--> ' + ws.name + ' has left the chat') + '\n') 
        });
        console.log(("--> " + ws.name + ' has left the chat'));
    });
    ctx.status = 200;
} else {
    ctx.body = "HTTP request sent to WebSocket server"
    ctx.status = 403;
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods());
const listener = app.listen(3000);
 

process.on('SIGINT', function() {
  process.exit();
});

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
console.log(`--> Server is listening on ${listener.address().address}:${listener.address().port}`)
 