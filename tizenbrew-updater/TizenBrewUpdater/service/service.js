"use strict";
// TizenBrew Updater Service

const isTV = process.platform === 'linux' && process.title.startsWith('/opt/usr/home/');
module.exports.onStart = function () {
    console.log('Service started.');
    const adbhost = require('adbhost');
    const fs = require('fs');
    const WebSocket = require('ws');
    const pushFile = require('./filePush.js');
    const ghApi = require('./ghApi.js');
    const fetch = require('node-fetch');
    const express = require('express');
    const app = express();
    const isUsingUpdater = fs.existsSync(`${process.platform === 'win32' ? 'C:' : '' }/snapshot/TizenBrewUpdater`);
    app.use(express.static(isUsingUpdater ? `${process.platform === 'win32' ? 'C:' : '' }/snapshot/TizenBrewUpdater` : '../'));
    const server = new WebSocket.Server({ server: app.listen(8083) });

    global.currentClient = null;
    let adb;
    let canConnectToDaemon = null;

    if (isTV) {
        fetch('http://127.0.0.1:8001/api/v2/').then(res => res.json())
        .then(json => {
            canConnectToDaemon = (json.device.developerIP === '127.0.0.1' || json.device.developerIP === '1.0.0.127') && json.device.developerMode === '1';
        });
    }

    function createAdbConnection(ip) {
        if (adb) {
            if (adb._stream !== null || adb._stream !== undefined) {
                adb._stream.removeAllListeners('connect');
                adb._stream.removeAllListeners('error');
                adb._stream.removeAllListeners('close');
            }
        }

        adb = adbhost.createConnection({ host: ip, port: 26101 });

        adb._stream.on('connect', () => {
            console.log('ADB connection established');
            global.currentClient.send(JSON.stringify({ type: 'connectedToDaemon' }));
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
                case 'canConnectToDaemon': {
                    if (isTV) {
                        fetch('http://127.0.0.1:8001/api/v2/').then(res => res.json())
                        .then(json => {
                            canConnectToDaemon = (json.device.developerIP === '127.0.0.1' || json.device.developerIP === '1.0.0.127') && json.device.developerMode === '1';
                        });
                    }
                    ws.send(JSON.stringify({ type: 'canConnectToDaemon', status: canConnectToDaemon }));
                    break;
                }
                case 'connectToDaemon': {
                    createAdbConnection(message.ip ? message.ip : '127.0.0.1');
                    break;
                }
                case 'isAppInstalled': {
                    const stream = adb.createStream('shell:0 vd_applist');
                    let appList = '';
                    stream.on('data', (data) => {
                        appList += data.toString();

                        if (appList.includes('spend time')) {
                            ws.send(JSON.stringify({ type: 'isAppInstalled', status: appList.includes('xvvl3S1bvH.TizenBrewStandalone') }));
                        }
                    });
                    break;
                }
                case 'updateAvailable': {
                    ghApi.getLatestReleaseTag().then((tag) => {
                        const installedApp = tizen.application.getAppInfo('xvvl3S1bvH.TizenBrewStandalone');
                        ws.send(JSON.stringify({ type: 'updateAvailable', available: tag.replace('v', '') !== installedApp.version }));
                    });
                    break;
                }
                case 'uninstallApp': {
                    uninstallApp();
                    break;
                }
                case 'installApp': {
                    let type = null;
                    if (isTV) {
                        const tvVersion = Number(tizen.systeminfo.getCapability('http://tizen.org/feature/platform.version').split('.')[0]);
                        if (tvVersion >= 8) {
                            type = 'New';
                        } else type = 'Old';
                    } else type = message.installType;

                    ghApi.downloadLatestRelease(type).then((data) => {
                        pushFile(adb, '/home/owner/share/tmp/sdk_tools', 'TizenBrewStandalone.wgt', data, () => installApp());
                    });
                    break;
                }
                default: {
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid message type.' }));
                    break;
                }
            }
        });
    });

    function installApp() {
        global.currentClient.send(JSON.stringify({ type: 'message', msg: 'Installing...' }));
        const stream = adb.createStream('shell:0 vd_appinstall xvvl3S1bvH.TizenBrewStandalone /home/owner/share/tmp/sdk_tools/TizenBrewStandalone.wgt');
        const installTimeout = setTimeout(() => {
            const stream = adb.createStream('shell:0 vd_appinstall xvvl3S1bvH /home/owner/share/tmp/sdk_tools/TizenBrewStandalone.wgt');
            const failedTimeout = setTimeout(() => global.currentClient.send(JSON.stringify({ type: 'error', message: 'Could not install app.' })), 2500);
            stream.on('data', (data) => {
                const string = data.toString();
                if (string.includes('installing')) {
                    clearTimeout(failedTimeout);
                } else if (string.includes('failed')) {
                    clearTimeout(failedTimeout);
                    global.currentClient.send(JSON.stringify({ type: 'error', message: `Could not install app. Reason: ${string}` }));
                } else if (string.includes('completed')) {
                    global.currentClient.send(JSON.stringify({ type: 'message', msg: 'App installed' }));
                }
            });
        }, 5000);
        stream.on('data', (data) => {
            const string = data.toString();
            if (string.includes('installing')) {
                clearTimeout(installTimeout);
            } else if (string.includes('failed')) {
                clearTimeout(installTimeout);
                global.currentClient.send(JSON.stringify({ type: 'error', message: `Could not install app. Reason: ${string}` }));
            } else if (string.includes('completed')) {
                global.currentClient.send(JSON.stringify({ type: 'message', msg: 'App installed' }));
            }
        });
    }

    function uninstallApp() {
        const stream = adb.createStream('shell:0 vd_appuninstall xvvl3S1bvH');
        const uninstallTimeout = setTimeout(() => {
            const stream = adb.createStream('shell:0 vd_appuninstall xvvl3S1bvH.TizenBrewStandalone');
            const failedTimeout = setTimeout(() => global.currentClient.send(JSON.stringify({ type: 'error', message: 'Could not uninstall app.' })), 1500);
            stream.on('data', (data) => {
                outputted = true;
                clearTimeout(failedTimeout);
                if (data.toString().includes('100')) {
                    global.currentClient.send(JSON.stringify({ type: 'message', msg: 'App uninstalled' }));
                }
            });
        }, 1500);
        stream.on('data', (data) => {
            clearTimeout(uninstallTimeout);
            if (data.toString().includes('100')) {
                global.currentClient.send(JSON.stringify({ type: 'message', msg: 'App uninstalled' }));
            }
        });
    }
}

if (!isTV) {
    module.exports.onStart();
    console.log('Please open up http://localhost:8083 in your browser.')
}