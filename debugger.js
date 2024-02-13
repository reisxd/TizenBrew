import WebSocket from 'ws';
import { readFileSync } from 'node:fs';
import Config from './config.json' assert { type: 'json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

let client = null;
let currentID = 12;
let contextID = 1;
async function startDebugging(port, adb_conn, ip) {
    global.inDebug = true;
    try {
        const debuggerJsonReq = await fetch(`http://${ip}:${port}/json`);
        const debuggerJson = await debuggerJsonReq.json();
        return attachDebugger(debuggerJson[0].webSocketDebuggerUrl, adb_conn);
    } catch (error) {
        inDebug = false;
        console.log('Error attaching debugger:', error.message);
        adb_conn._stream.end();
    }
}

async function attachDebugger(wsUrl, adb_conn) {
    client = await new WebSocket(wsUrl);
    client.onopen = () => {
        if (Config.debug) {
            client.send(JSON.stringify({ "id": 2, "method": "Console.enable" }));
        }

        client.send(JSON.stringify({ "id": 7, "method": "Debugger.enable" }));
        client.send(JSON.stringify({ "id": 11, "method": "Runtime.enable" }));
        client.send(JSON.stringify({ "id": currentID, "method": "Runtime.evaluate", "params": { "expression": "document.getElementById('wsText').innerText = 'TizenBrew Server has connected to the app.'", "objectGroup": "console", "includeCommandLineAPI": true, "doNotPauseOnExceptionsAndMuteConsole": false, "contextId": contextID, "returnByValue": false, "generatePreview": true } }))
        currentID++;
        adb_conn._stream.end();
    }
    
    client.onmessage = async (message) => {
        const msg = JSON.parse(message.data);

        // Future-proof it just incase the page reloads/something happens.
        if (msg.method && msg.method == 'Runtime.executionContextCreated') {
            contextID = msg.params.context.id;
            if (global?.currentModule?.type === 'mods') {
                let modFile;
                try {
                    modFile = readFileSync(global.currentModule.path, 'utf-8');
                } catch (error) {
                    console.error(`Error reading module file for ${global.currentModule.name}:`, error.message);
                    return;
                }
                await sleep(3000);
                client.send(JSON.stringify({ "id": currentID, "method": "Runtime.evaluate", "params": { "expression": modFile, "objectGroup": "console", "includeCommandLineAPI": true, "doNotPauseOnExceptionsAndMuteConsole": false, "contextId": msg.params.context.id, "returnByValue": false, "generatePreview": true } }))
                currentID++;
            }
        }

        if (Config.debug) {
            if (msg.method == 'Console.messageAdded') {
                console.log(msg.params.message.text, msg.params.message.parameters);
            } else if (msg?.result?.result?.wasThrown) {
                console.error(msg.result.result.description);
            }
        }
    }

    client.onclose = () => {
        global.currentModule = null;
        global.inDebug = false;
    }

    client.onerror = () => {
        global.currentModule = null;
        global.inDebug = false;
    }
    return client;
}

export default startDebugging;