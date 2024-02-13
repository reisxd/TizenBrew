import { WebSocketServer } from 'ws';
import Express from 'express';
import adbhost from 'adbhost';
import Config from './config.json' assert { type: 'json' };
import startDebugging from './debugger.js';
import loadModules from './moduleLoader.js';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = Express();
const server = new WebSocketServer({ server: app.listen(8080) });
let adb;
global.inDebug = false;

function createAdbConnection(isTizen3, ip) {
    if (adb?._stream) {
        adb._stream.removeAllListeners('connect');
        adb._stream.removeAllListeners('error');
        adb._stream.removeAllListeners('close');
    }

    adb = adbhost.createConnection({ host: Config.tvIP, port: 26101 });

    adb._stream.on('connect', () => {
        console.log('ADB connection established');
        //Launch app
        const shellCmd = adb.createStream(`shell:0 debug ${Config.appId}${isTizen3 ? ' 0' : ''}`);
        shellCmd.on('data', data => {
            const dataString = data.toString();
            if (dataString.includes('debug')) {
                const port = dataString.substr(dataString.indexOf(':') + 1, 6).replace(' ', '');
                startDebugging(port, adb, inDebug);
            }
        });
    });

    adb._stream.on('error', () => {
        console.log('ADB connection error.');
    });
    adb._stream.on('close', () => {
        console.log('ADB connection closed.');
    });

}

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use((req, res, next) => {
    if (req.path.startsWith('/app')) {
        const currentPath = req.path.replace('/app', '');
        res.sendFile(`${__dirname}/${global.currentModule.path}/${currentPath}`);
    }
});

server.on('connection', (ws) => {
    const ip = ws._socket.remoteAddress.replace('::ffff:', '');
    ws.on('message', async (msg) => {
        let message;
        try {
            message = JSON.parse(msg);
        } catch (e) {
            return ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON.' }));
        }
        switch (message.type) {
            case 'getDebugStatus': {
                ws.send(JSON.stringify({ type: 'debugStatus', inDebug }));
                break;
            }
            case 'relaunchInDebug': {
                const sleep = ms => new Promise(r => setTimeout(r, ms));
                await sleep(2500);
                createAdbConnection(message.isTizen3, ip);
                break;
            }
            case 'loadModules': {
                const modules = await loadModules();
                ws.send(JSON.stringify({ type: 'modules', modules }));
                break;
            }
            case 'launch': {
                const module = (await loadModules()).find(m => m.name === message.packageName);
                if (!module) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Module not found.' }));
                    break;
                }
                if (module.packageType === 'mods') {
                    global.currentModule = {
                        type: 'mods',
                        path: `node_modules/${module.name}/${module.mainFile}`
                    }
                } else {
                    global.currentModule = {
                        type: 'app',
                        path: `node_modules/${module.name}${module.appPath}`
                    }
                }
                break;
            }
            default: {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid message type.' }));
                break;
            }
        }
    });
});