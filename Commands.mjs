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
	  new Command("/register", function(ws, wss, WebSocket, message) {
            let submittedUsername = message.substring(10)
            let takenAlready;
            wss.clients.forEach(function each(client) {
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
              wss.clients.forEach(client => {
                if(client.readyState === WebSocket.OPEN && client != ws) {
                  client.send('--> ' + oldName + ' is now known as ' + ws.name + '\n');
                }
              });          
              ws.send("Registered!\n")
            }
	    return;
	  }),
  new Command("/channel", function(ws,wss,WebSocket,message){
    if(message.substring(9) == "new") {
      message = message.substring()
    }
  })

	]

const promises = (message) => {
  let array = []
  commands.forEach(el => {
    array.push(el.check(message))
  })
  return array;
}

export { commands, promises };