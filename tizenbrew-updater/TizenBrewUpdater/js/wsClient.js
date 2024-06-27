"use strict";

const isTV = navigator.userAgent.includes('Tizen');
let isTizen8 = false;
let client;

window.connect = function() {
    try {
        client = new WebSocket(`ws://127.0.0.1:8082`);
        client.onmessage = onMessage;
        client.onopen = onOpen;
        client.onerror = () => {
            window.location.reload();
        }
    } catch (e) {
        window.location.reload();
    }

}

window.send = (message) => {
    client.send(JSON.stringify(message));
}

function onMessage(msg) {
    const message = JSON.parse(msg.data);
    switch (message.type) {
        case 'canConnectToDaemon': {
            if (message.status === null) {
                setTimeout(() => {
                    send({ type: 'canConnectToDaemon' });
                }, 1000);
                break;
            } else if (message.status) {
                hideError();
                send({ type: 'connectToDaemon' });
            } else {
                showError(`Error: Could not connect to the server. Are you sure you changed the Host PC IP to 127.0.0.1? If you have, hold the power button till you see the Samsung logo.`);
            }
            break;
        }
        case 'connectedToDaemon': {
            isTizen8 = document.getElementById('tizen8').checked;
            document.getElementById('wsText').innerText = 'Connected to Daemon';
            try {
                if (isTV) {
                    tizen.application.getAppInfo('xvvl3S1bvH.TizenBrewStandalone');
                    send({ type: 'updateAvailable' });
                } else {
                    send({ type: 'isAppInstalled' })
                }
            } catch {
                addButtons(false);
            }
            break;
        }
        case 'updateAvailable': {
            if (message.available) {
                addButtons(true);
            } else alert('TizenBrew is already up to date.');
            break;
        }
        case 'isAppInstalled': {
            addButtons(message.status);
            break;
        }
        case 'error': {
            showError(message.message);
            break;
        }
        case 'message': { 
            document.getElementById('wsText').innerText = message.msg;
            if (message.msg === 'App installed') {
                alert('TizenBrew has been installed. You can find TizenBrew by going into the app store and clicking the settings icon.');
            }
            break;
        }
    }
}

function addButtons(installed) {
    document.getElementById('appList').innerHTML = `
    <div class="card selected" tabindex="0" onclick="window.manageTizenBrew(${installed})">
        <h1>${installed ? 'Update TizenBrew' : 'Install TizenBrew'}</h1>
        <h3>${installed ? 'Get access to a newer version of TizenBrew.' : 'Get access to your favorite TizenBrew modules.' }</h3>
    </div>
    `

    window.selectedItem = document.querySelector(".selected");

    window.currentRow = selectedItem.parentElement.parentElement;

}

function onOpen() {
    if (navigator.userAgent.includes('Tizen')) {
        send({ type: 'canConnectToDaemon' });
    } else {
        // Add TV IP input
        document.getElementById('header').innerHTML += `
        <input type="text" class="form-input" placeholder="TV IP" id="tvIp" tabindex="0">
        <input type="checkbox" id="tizen8" tabindex="0"> My TV is Tizen 8 or higher (2024+)</input>
        `
        document.getElementById('appList').innerHTML = `
            <div class="card selected" tabindex="0" onclick="window.send({ type: 'connectToDaemon', ip: document.getElementById('tvIp').value })">
                <h1>Connect to your TV</h1>
                <h3>Enter your TVs IP address above and click here.</h3>
            </div>
        `;
    }
}

window.manageTizenBrew = function(isUpdate) {
 /*  if (isUpdate) {
        const uninstallDialog = confirm('TizenBrew cannot be updated normally, so TizenBrew has to get uninstalled first. This means that your data will be erased!\nAre you sure?');
        if (uninstallDialog) {
            send({ type: 'uninstallApp' });
            setTimeout(() => send({ type: 'installApp' }), 2500);
        } else alert('Canceled.')
    } else {
        send({ type: 'installApp' });
    }*/
    send({ type: 'installApp', type: isTizen8 ? 'New' : 'Old' });
}