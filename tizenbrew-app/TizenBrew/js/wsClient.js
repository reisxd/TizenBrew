"use strict";

let client;
const isTizen3 = navigator.userAgent.includes('Tizen 3.0');
let canLaunchModules = false;
let canAutoLaunch = true;
let loadedModules = false;

function connect() {
    const ip = localStorage.getItem('ip');
    try {
        if (ip.includes(':')) {
            client = new WebSocket(`ws://${ip}`);
        } else {
            client = new WebSocket(`ws://127.0.0.1:8081`);
        }
        client.onmessage = onMessage;
        client.onopen = onOpen;
        client.onerror = () => {
            localStorage.removeItem('ip');
            window.location.reload();
        }
    } catch (e) {
        localStorage.removeItem('ip');
        window.location.reload();
    }

}

window.send = (message) => {
    const msg = JSON.stringify(message);
    try {
        JSON.parse(msg);
        client.send(msg);
    } catch (e) {
        showError(`Error: Invalid JSON: ${msg}\nMessage: ${message}\nThis has been caused by the client. This should NOT be possible.`);
        return;
    }
}

function onMessage(msg) {
    const message = JSON.parse(msg.data);
    switch (message.type) {
        case 'launchAppControlFinished': {
            send({ type: 'getDebugStatus' });
            break;
        }
        case 'debugStatus': {
            if (message.inDebug.tizenDebug) {
                hideError();
                localStorage.setItem('failedStartupAttempts', '0');
                canLaunchModules = message.inDebug.webDebug;
                send({ type: 'loadModules', modules: JSON.parse(localStorage.getItem('modules')).map(item => `${item.type}/${item.name}`) });
                if (localStorage.getItem('autoLaunchService')) {
                    send({ type: 'startService', package: JSON.parse(localStorage.getItem('autoLaunchService')) });
                }
                send({ type: 'getServiceStatuses' });
            } else {
                send({ type: 'canLaunchInDebug' });
            }
            break;
        }
        case 'modules': {
            if (message.modules.length != 0) {
                let firstOne = true;
                document.getElementById('appList').innerHTML = '';
                for (const module of message.modules) {
                    document.getElementById('appList').innerHTML += `
                    <div data-packagename="${module.name}" data-appPath="${module.appPath}" class="card ${firstOne ? 'selected' : ''}" tabindex="0" data-keys="${module.keys.join(',')}" data-moddedTizenApp="${module.tizenAppId ? true : false}" data-packageType="${module.serviceFile && module.packageType === 'mods' ? 'service-mods' : module.packageType}" data-moduleType="${module.moduleType}">
                        <div>
                            <h1>${module.appName}</h1>
                            <h3>
                                ${module.description}
                            </h3>
                        </div>
                    </div>
                    `;
                    firstOne = false;
                }
                loadedModules = true;
                if (canLaunchModules && localStorage.getItem('autoLaunch')) {
                    autoLaunchModule();
                }
                window.selectedItem = document.querySelector(".selected");
                window.currentRow = selectedItem.parentElement.parentElement;
            } else {
                document.getElementById('navigateText').innerHTML = window.i18n.t('errors.noModules');
                window.selectedItem.style.display = 'none';
            }
            break;
        }
        case 'error': {
            showError(`Error: ${message.message}`)
            setTimeout(() => {
                hideError();
            }, 5000);
            break;
        }

        case 'canLaunchModules': {
            canLaunchModules = true;
            document.getElementById('wsText').innerText = t('service.connected');

            const autoLaunchService = JSON.parse(localStorage.getItem('autoLaunchService'));

            if (autoLaunchService) {
                send({ type: 'startService', package: `${autoLaunchService.type}/${autoLaunchService.name}` });
            }

            if (message.appControlData) {
                const moduleName = message.appControlData.module.name;
                const moduleType = message.appControlData.module.moduleType;
                const keys = message.appControlData.module.keys;
                const appPath = message.appControlData.module.appPath;
                const tizenAppId = message.appControlData.module.tizenAppId;
                const args = message.appControlData.args;

                if (keys.length > 0) {
                    keys.forEach(key => {
                        tizen.tvinputdevice.registerKey(key);
                    });
                }

                setTimeout(() => {
                    send({ type: 'launch', package: `${moduleType}/${moduleName}`, tvIp: webapis.network.getIp(), isTizen3 });
                    if (!tizenAppId) {
                        location.href = `${appPath}${args ? `?${args}` : ''}`;
                    }
                }, 250);
                return;
            }

            if (canAutoLaunch && localStorage.getItem('autoLaunch')) {
                if (!loadedModules) return;
                autoLaunchModule();
            }
            break;
        }
        case 'canLaunchInDebug': {
            if (message.status === null) {
                setTimeout(() => {
                    send({ type: 'canLaunchInDebug' });
                }, 1000);
                break;
            } else if (message.status) {
                send({ type: 'relaunchInDebug', isTizen3, tvIp: webapis.network.getIp() });
                tizen.application.getCurrentApplication().exit();
            } else {
                showError(window.i18n.t('errors.debuggingNotEnabled'));
            }
            break;
        }
        case 'serviceStatuses': {
            const crashedServices = message.services.filter(service => service.hasCrashed);
            if (crashedServices.length > 0) {
                showError(window.i18n.t('errors.crashedServices', { services: crashedServices.map(service => service.name).join(', ') }));
            }
            break;
        }
        default: {
            // This should never happen.
        }
    }
}

function onOpen() {
    document.getElementById('version').innerText = `v${tizen.application.getAppInfo().version}`;
    // We have to get the debug status to know if we need to relaunch in debug mode.
    const data = tizen.application.getCurrentApplication().getRequestedAppControl().appControl.data;
    if (data.length > 0 && data[0].value.length > 0) {
        // TizenBrew allows other apps to launch a specific module outside of the TizenBrew app.
        try {
            const parsedData = JSON.parse(data[0].value[0]);
            const moduleName = parsedData.moduleName;
            const moduleType = parsedData.moduleType;
            const args = parsedData.args;
            // Send the data to the server and launch it after TizenBrew relaunches.
            send({ type: 'launchAppControl', package: `${moduleType}/${moduleName}`, args });
        } catch (e) {
            send({ type: 'getDebugStatus' });
        }
    } else send({ type: 'getDebugStatus' });
}

function autoLaunchModule() {
    const autoLaunch = JSON.parse(localStorage.getItem('autoLaunch'));
    const app = document.querySelector(`[data-packagename="${autoLaunch.name}"]`);
    if (!app) {
        showError(window.i18n.t('errors.moduleNotFound', { moduleName: autoLaunch.name }));
        return;
    } else {
        const appPath = app.getAttribute('data-appPath');
        let keys = app.getAttribute("data-keys");
        if (keys.length > 0) {
            keys = selectedItem.getAttribute("data-keys").split(',');
            for (var i = 0; i < keys.length; i++) {
                tizen.tvinputdevice.registerKey(keys[i]);
            }
        }

        setTimeout(() => {
            send({ type: 'launch', package: `${autoLaunch.type}/${autoLaunch.name}`, tvIp: webapis.network.getIp(), isTizen3 });
            if (app.getAttribute('data-moddedTizenApp') === 'false') {
                location.href = appPath;
            }
        }, 250);
    }
}