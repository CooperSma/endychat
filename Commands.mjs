import { Channel } from "./Channels.mjs";

class Command {
  constructor(command, callback) {
    this.check = (message) => new Promise((resolve, reject) => {
        if(message.startsWith(command)) {
          resolve(this.callback)
        } else {
          reject()
        }
      });
    this.callback = callback;
  }
}

const commands = [
	  new Command("/register", function(ws, connections, WebSocket, Channels, message) {
            let submittedUsername = message.substring(10)
            let takenAlready;
            connections.forEach(function each(client) {
              if(client.username == submittedUsername) {
                takenAlready = true;
              }
            })
            if (takenAlready == true) {
              ws.send("Username already taken \n");
            } else {
              let oldName = ws.name;
              ws.username = submittedUsername;
              ws.name = ws.username;
              connections.forEach(client => {
                if(client.readyState === WebSocket.OPEN && client != ws) {
                  client.send('--> ' + oldName + ' is now known as ' + ws.name + '\n');
                }
              });          
              ws.send("Registered!\n")
              connections[ws.connectionID] = ws;
            }
	    return;
	  }),
  new Command("/join", (ws,connections,WebSocket,Channels,message) => joinChannel(ws,connections,WebSocket,Channels,message)),
  new Command("/create", function(ws,connections,WebSocket,Channels,message){
      message = message.substring(8)
      console.log(message)
      let newChannelIndex = Number(Channels.channels.push(new Channel(message))) - 1;
      ws.channel = Channels.channels[newChannelIndex]
      ws.send(`Created and joined channel ${ws.channel.name}\n`)
      connections[ws.connectionID] = ws;
  })

	]

function joinChannel(ws,connections,WebSocket,Channels,message){
      message = message.substring(6)
      console.log(Channels.channels[0])
      console.log(message)
      let channel;
      let realChannel = false;
      for (let element of Channels.channels) {
        if (element.name == message) {
          realChannel = true;
          channel = element;
          break;
        }
      }
      if(realChannel == true) {
        ws.channel = channel;
        ws.send("Joined channel " + ws.channel.name + '\n')
        connections[ws.connectionID] = ws;
      } else {
        ws.send("Invalid channel\n")
      }
  }

const promises = (message) => {
  let array = []
  commands.forEach(el => {
    array.push(el.check(message))
  })
  return array;
}

export { commands, promises };