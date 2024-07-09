"use strict";
const WebSocket = require('ws');
const fetch = require('node-fetch');
let client = null;
let currentID = 12;
let contextID = 1;

function startDebugging(port, adb_conn, ip) {
    let attempts = 1;
    global.inDebug.tizenDebug = true;
    const connectionInterval = setInterval(() => {
        fetch(`http://${ip}:${port}/json`).then(
            res => res.json()
        ).then(
            debuggerJson => {
                global.inDebug.webDebug = true;
                global.currentClient.send(JSON.stringify({ type: 'canLaunchModules', appControlData: global.appControlData }));
                clearInterval(connectionInterval);
                global.appControlData = null;
                return attachDebugger(debuggerJson[0].webSocketDebuggerUrl, adb_conn);
            }).catch(
                e => {
                    if (attempts >= 5) {
                        global.currentClient.send(JSON.stringify({ type: 'error', message: 'Failed to connect to debugger.' }));
                        clearInterval(connectionInterval);
                        global.inDebug.tizenDebug = false;
                        adb_conn._stream.end();
                        return;
                    }
                    attempts++;
                });
    }, 1250);
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
        global.inDebug = {
            tizenDebug: false,
            webDebug: false
        };;
    }

    client.onerror = () => {
        global.currentModule = null;
        global.inDebug = {
            tizenDebug: false,
            webDebug: false
        };;
    }
    return client;
}

module.exports = startDebugging;