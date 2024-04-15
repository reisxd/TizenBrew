"use strict";

let client;
const isTizen3 = navigator.userAgent.includes('Tizen 3.0');
let canLaunchModules = false;
let canAutoLaunch = true;

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
    } catch(e) {
        localStorage.removeItem('ip');
        window.location.reload();
    }
    
}

window.send = (message) => {
    client.send(JSON.stringify(message));
}

function onMessage(msg) {
    const message = JSON.parse(msg.data);
    switch (message.type) {
        case 'debugStatus': {
            if (message.inDebug.tizenDebug) {
                hideError();
                localStorage.setItem('failedStartupAttempts', '0');
                canLaunchModules = message.inDebug.webDebug;
                send({ type: 'loadModules', modules: JSON.parse(localStorage.getItem('modules')) });
            } else {
                send({ type: 'canLaunchInDebug', isTizen3, tvIp: webapis.network.getIp() });
                /*
                const failedStartupAttempts = parseInt(localStorage.getItem('failedStartupAttempts'));
                if (failedStartupAttempts < 2) {
                    localStorage.setItem('failedStartupAttempts', failedStartupAttempts + 1);
                    send({ type: 'relaunchInDebug', isTizen3, tvIp: webapis.network.getIp() });
                    tizen.application.getCurrentApplication().exit();
                } else {
                    showError(`Error: Could not connect to the server after 3 attempts. Are you sure you changed the Host PC IP to 127.0.0.1?`);
                    localStorage.setItem('failedStartupAttempts', '0');
                }*/
            }
            break;
        }
        case 'modules': {
            if (message.modules.length != 0) {
                let firstOne = true;
                document.getElementById('appList').innerHTML = '';
                for (const module of message.modules) {
                    document.getElementById('appList').innerHTML += `
                    <div data-packagename="${module.name}" data-appPath="${module.appPath}" class="card ${firstOne ? 'selected' : ''}" tabindex="0" data-keys="${module.keys.join(',')}>
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
                window.selectedItem = document.querySelector(".selected");
                window.currentRow = selectedItem.parentElement.parentElement;
            } else {
                document.getElementById('navigateText').innerHTML = "Seems like you haven't installed any modules yet. Use the [GREEN] button to access the module manager.";
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
            document.getElementById('wsText').innerText = 'Connected to server.';

            if (canAutoLaunch && localStorage.getItem('autoLaunch')) {
                const app = document.querySelector(`[data-packagename="${localStorage.getItem('autoLaunch')}"]`);
                if (!app) {
                    showError(`Error: Could not find the module ${localStorage.getItem('autoLaunch')}.`);
                    return;
                } else {
                    const appPath = app.getAttribute('data-appPath');
                    send({ type: 'launch', packageName: localStorage.getItem('autoLaunch') });
                    location.href = appPath;
                }
            }
            break;
        }
        case 'canLaunchInDebug': {
            if (message.status) {
                send({ type: 'relaunchInDebug', isTizen3, tvIp: webapis.network.getIp() });
                tizen.application.getCurrentApplication().exit();
            } else {
                showError(`Error: Could not connect to the server. Are you sure you changed the Host PC IP to 127.0.0.1? If you have, hold the power button till you see the Samsung logo.`);
            }
            break;
        }
        default: {
           // This should never happen.
        }
    }
}

function onOpen() {
    // We have to get the debug status to know if we need to relaunch in debug mode.
    send({ type: 'getDebugStatus' });
}