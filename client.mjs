import { stdin } from 'process';
import WebSocket, { createWebSocketStream } from 'ws';
import dotenv from 'dotenv';
import chalk from 'chalk';
dotenv.config();

console.log(chalk.blue(`
########::'########:'##::::::::::'###::::'##:::'##:
##.... ##: ##.....:: ##:::::::::'## ##:::. ##:'##::
##:::: ##: ##::::::: ##::::::::'##:. ##:::. ####:::
########:: ######::: ##:::::::'##:::. ##:::. ##::::
##.. ##::: ##...:::: ##::::::: #########:::: ##::::
##::. ##:: ##::::::: ##::::::: ##.... ##:::: ##::::
##:::. ##: ########: ########: ##:::: ##:::: ##::::
`))

const ws = new WebSocket(process.env.WS_CLIENT_URL);

const duplex = createWebSocketStream(ws, { encoding: 'utf8' });

ws.on('close', function close(req) {
    console.log(chalk.red("--> The remote server closed the connection"))
    process.exit();
});
duplex.pipe(process.stdout);
process.stdin.pipe(duplex);;