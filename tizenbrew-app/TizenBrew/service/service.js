"use strict";
// TizenBrew Standalone Service
// I wish I've seen running Node.JS on Tizen way before...

module.exports.onStart = function () {
    console.log('Service started.');
    const adbhost = require('adbhost');
    const express = require('express');
    const WebSocket = require('ws');
    const startDebugging = require('./debugger.js');
    const fetch = require('node-fetch');
    const loadModules = require('./moduleLoader.js');
    const startService = require('./serviceLauncher.js');
    const path = require('path');
    const app = express();

    // HTTP Proxy for modules
    app.all('*', (req, res) => {
        if (req.url.startsWith('/module/')) {
            const splittedUrl = req.url.split('/');
            const moduleType = splittedUrl[2];
            const encodedModuleName = splittedUrl[3];
            const moduleName = decodeURIComponent(encodedModuleName);
            fetch(`https://cdn.jsdelivr.net/${moduleType}/${moduleName}/${req.url.replace(`/module/${moduleType}/${encodedModuleName}/`, '')}`)
                .then(fetchRes => {
                    return fetchRes.body.pipe(res);
                })
                .then(() => {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.type(path.basename(req.url.replace(`/module/${moduleType}/${encodedModuleName}/`, '')).split('.').slice(-1)[0].split('?')[0]);
                });
        } else {
            res.send('Hello from TizenBrew Standalone Service!');
        }
    });

    const server = new WebSocket.Server({ server: app.listen(8081) });

    let adb;
    let canLaunchInDebug = null;
    fetch('http://127.0.0.1:8001/api/v2/').then(res => res.json())
        .then(json => {
            canLaunchInDebug = (json.device.developerIP === '127.0.0.1' || json.device.developerIP === '1.0.0.127') && json.device.developerMode === '1';
        });

    global.inDebug = {
        tizenDebug: false,
        webDebug: false
    };
    global.currentClient = null;
    global.services = new Map();
    global.appControlData = null;

    function createAdbConnection(isTizen3, ip, appId) {
        if (adb) {
            if (adb._stream !== null || adb._stream !== undefined) {
                adb._stream.removeAllListeners('connect');
                adb._stream.removeAllListeners('error');
                adb._stream.removeAllListeners('close');
            }
        }

        adb = adbhost.createConnection({ host: '127.0.0.1', port: 26101 });

        adb._stream.on('connect', () => {
            console.log('ADB connection established');
            //Launch app
            const shellCmd = adb.createStream(`shell:0 debug ${appId ? appId : 'xvvl3S1bvH.TizenBrewStandalone'}${isTizen3 ? ' 0' : ''}`);
            shellCmd.on('data', function dataIncoming(data) {
                const dataString = data.toString();
                if (dataString.includes('debug')) {
                    const port = dataString.substr(dataString.indexOf(':') + 1, 6).replace(' ', '');
                    startDebugging(port, adb, ip);
                }
            });
        });

        adb._stream.on('error', (e) => {
            console.log('ADB connection error. ' + e);
        });
        adb._stream.on('close', () => {
            console.log('ADB connection closed.');
        });

    }

    server.on('connection', (ws) => {
        global.currentClient = ws;
        ws.on('message', (msg) => {
            let message;
            try {
                message = JSON.parse(msg);
            } catch (e) {
                return ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON.' }));
            }

            switch (message.type) {
                case 'launchAppControl': {
                    loadModules([message.package]).then(modules => {
                        const module = modules.find(m => m.name === message.package.name);
                        if (!module) {
                            ws.send(JSON.stringify({ type: 'error', message: 'Module not found.' }));
                            return;
                        }
                        global.appControlData = {
                            module,
                            args: message.args
                        };
                    });
                    break;
                }
                case 'getDebugStatus': {
                    ws.send(JSON.stringify({ type: 'debugStatus', inDebug: global.inDebug }));
                    break;
                }
                case 'canLaunchInDebug': {
                    fetch('http://127.0.0.1:8001/api/v2/').then(res => res.json())
                        .then(json => {
                            canLaunchInDebug = (json.device.developerIP === '127.0.0.1' || json.device.developerIP === '1.0.0.127') && json.device.developerMode === '1';
                        });
                    ws.send(JSON.stringify({ type: 'canLaunchInDebug', status: canLaunchInDebug }));
                    break;
                }
                case 'relaunchInDebug': {
                    setTimeout(() => {
                        createAdbConnection(message.isTizen3, message.tvIp);
                    }, 1000);
                    break;
                }
                case 'loadModules': {
                    loadModules(message.modules).then(modules => {
                        ws.send(JSON.stringify({ type: 'modules', modules }));
                    });
                    break;
                }
                case 'launch': {
                    loadModules([message.package]).then(modules => {
                        const module = modules.find(m => m.name === message.package.name);
                        if (!module) {
                            ws.send(JSON.stringify({ type: 'error', message: 'Module not found.' }));
                            return;
                        }
                        if (module.packageType === 'mods') {
                            global.currentModule = {
                                type: 'mods',
                                path: `https://cdn.jsdelivr.net/${message.package.type}/${message.package.name}/${module.mainFile}`
                            }

                            if (module.tizenAppId) {
                                createAdbConnection(message.isTizen3, message.tvIp, module.tizenAppId);
                            }
                        } else {
                            global.currentModule = {
                                type: 'app',
                                path: `http://127.0.0.1:8081/module/${message.package.type}/${encodeURIComponent(message.package.name)}/${module.appPath}`
                            }

                            global.inDebug.tizenDebug = false;
                            global.inDebug.webDebug = false;
                        }
                    });
                    break;
                }
                case 'startService': {
                    loadModules([message.package]).then(modules => {
                        const module = modules.find(m => m.name === message.package.name);

                        if (!module) {
                            ws.send(JSON.stringify({ type: 'error', message: 'Module not found.' }));
                            return;
                        }

                        if (global.services.has(message.package.name)) {
                            if (global.services.get(message.package.name).hasCrashed) {
                                global.services.delete(message.package.name);
                                startService(module, message.package.type);
                            } else ws.send(JSON.stringify({ type: 'error', message: 'Service already running.' }));
                        } else startService(module, message.package);
                    });
                    break;
                }
                case 'getServiceStatuses': {
                    const serviceList = [];
                    global.services.forEach((key, value) => {
                        serviceList.push({
                            name: key,
                            hasCrashed: value.hasCrashed
                        });
                    });
                    ws.send(JSON.stringify({ type: 'serviceStatuses', services: serviceList }));
                    break;
                }
                default: {
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid message type.' }));
                    break;
                }
            }
        });
    });
}