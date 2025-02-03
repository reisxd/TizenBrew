"use strict";

const CDP = require('chrome-remote-interface');
const fetch = require('node-fetch');
const { Events } = require('./wsCommunication.js');
const { readConfig } = require('./configuration.js');
const WebSocket = require('ws');

const modulesCache = new Map();

function startDebugging(port, queuedEvents, clientConn, ip, mdl, inDebug, appControlData, isAnotherApp, attempts) {
    if (!attempts) attempts = 1;
    if (!isAnotherApp) inDebug.tizenDebug = true;
    try {
        CDP({ port, host: ip, local: true }, (client) => {
            client.Runtime.enable();
            client.Debugger.enable();

            client.on('Runtime.executionContextCreated', (msg) => {
                if (mdl.name !== '') {
                    const cache = modulesCache.get(mdl.fullName);
                    if (cache) {
                        client.Runtime.evaluate({ expression: cache, contextId: msg.context.id });
                    } else {
                        fetch(`https://cdn.jsdelivr.net/${mdl.fullName}/${mdl.mainFile}`).then(res => res.text()).then(modFile => {
                            modulesCache.set(mdl.fullName, modFile);
                            client.Runtime.evaluate({ expression: modFile, contextId: msg.context.id });
                        }).catch(e => {
                            client.Runtime.evaluate({ expression: `alert("Failed to load module: '${mdl.fullName}'. Please relaunch TizenBrew to try again.")`, contextId: msg.context.id });
                        });
                    }
                }
            });

            client.on('disconnect', () => {
                if (isAnotherApp) return;

                inDebug.tizenDebug = false;
                inDebug.webDebug = false;
                inDebug.rwiDebug = false;

                mdl.fullName = '';
                mdl.name = '';
                mdl.appPath = '';
                mdl.moduleType = '';
                mdl.packageType = '';
                mdl.serviceFile = '';
                mdl.mainFile = '';
            });

            if (!isAnotherApp) {
                const clientConnenction = clientConn.get('wsConn');
                if (appControlData.module) {
                    const data = clientConnenction.Event(Events.CanLaunchModules, {
                        type: 'appControl',
                        module: appControlData.module,
                        args: appControlData.args
                    });
                    clientConnenction.connection.readyState === WebSocket.OPEN ? clientConnenction.send(data) : queuedEvents.push(data);
                } else {
                    const config = readConfig();
                    if (config.autoLaunchModule) {
                        const data = clientConnenction.Event(Events.CanLaunchModules, {
                            type: 'autolaunch',
                            module: config.autoLaunchModule
                        })
                        clientConnenction.connection.readyState === WebSocket.OPEN ? clientConnenction.send(data) : queuedEvents.push(data);
                    } else {
                        const data = clientConnenction.Event(Events.CanLaunchModules, null);
                        clientConnenction.connection.readyState === WebSocket.OPEN ? clientConnenction.send(data) : queuedEvents.push(data);
                    }
                }
            }
            if (!isAnotherApp) inDebug.webDebug = true;
            appControlData = null;
        }).on('error', (err) => {
            if (attempts >= 15) {
                if (!isAnotherApp) {
                    clientConn.send(clientConn.Event(Events.Error, 'Failed to connect to the debugger'));
                    inDebug.tizenDebug = false;
                    return;
                } else return;
            }
            attempts++;
            setTimeout(() => startDebugging(port, queuedEvents, clientConn, ip, mdl, inDebug, appControlData, isAnotherApp, attempts), 750)
        });
    } catch (e) {
        if (attempts >= 15) {
            if (!isAnotherApp) {
                clientConn.send(clientConn.Event(Events.Error, 'Failed to connect to the debugger'));
                inDebug.tizenDebug = false;
                return;
            } else return;
        }
        attempts++;
        setTimeout(() => startDebugging(port, queuedEvents, clientConn, ip, mdl, inDebug, appControlData, isAnotherApp, attempts), 750)
        return;
    }
}

module.exports = startDebugging;