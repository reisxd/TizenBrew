"use strict";
const WebSocket = require('ws');
const fetch = require('node-fetch');
let client = null;
let currentID = 12;
let contextID = 1;

function startDebugging(port, adb_conn, ip) {
    global.inDebug = true;
    try {
        fetch(`http://${ip}:${port}/json`).then(
            res => res.json()
        ).then(
            debuggerJson => {
                return attachDebugger(debuggerJson[0].webSocketDebuggerUrl, adb_conn);
            });
    } catch (error) {
        global.inDebug = false;
        console.log('Error attaching debugger:', error.message);
        adb_conn._stream.end();
    }
}

function attachDebugger(wsUrl, adb_conn) {
    client = new WebSocket(wsUrl);
    client.onopen = () => {
        client.send(JSON.stringify({ "id": 7, "method": "Debugger.enable" }));
        client.send(JSON.stringify({ "id": 11, "method": "Runtime.enable" }));
        adb_conn._stream.end();
    }

    client.onmessage = (message) => {
        const msg = JSON.parse(message.data);

        // Future-proof it just incase the page reloads/something happens.
        if (msg.method && msg.method == 'Runtime.executionContextCreated') {
            contextID = msg.params.context.id;
            if (global.currentModule && global.currentModule.type === 'mods') {
                fetch(global.currentModule.path).then(res => res.text()).then(modFile => {
                    client.send(JSON.stringify({ "id": currentID, "method": "Runtime.evaluate", "params": { "expression": modFile, "objectGroup": "console", "includeCommandLineAPI": true, "doNotPauseOnExceptionsAndMuteConsole": false, "contextId": msg.params.context.id, "returnByValue": false, "generatePreview": true } }))
                    currentID++;
                });
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

module.exports = startDebugging;