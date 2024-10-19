"use strict";

const isTV = navigator.userAgent.includes('Tizen');
let isTizen8 = false;
let client;

window.connect = function () {
    try {
        client = new WebSocket(`ws://127.0.0.1:8083`);
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
            if (!isTV) {
                isTizen8 = document.getElementById('tizen8').checked;
                if (isTizen8) {
                    const shouldOpenGuide = confirm('Tizen 8 or higher requires TizenBrew to be rebuilt. Please follow the guide to rebuild TizenBrew.\n\nDo you want to open the guide?');
                    if (shouldOpenGuide) {
                        window.open('https://tizentube.vercel.app/documentation#/./docs/README?id=rebuilding-tizenbrew');
                    }
                    return;
                }
            }
            document.getElementById('wsText').innerText = 'Connected to Daemon';
            try {
                if (isTV) {
                    tizen.application.getAppInfo('xvvl3S1bvH.TizenBrewStandalone');
                    send({ type: 'updateAvailable' });
                } else {
                    send({ type: 'isAppInstalled' })
                }
            } catch (_) {
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
                const sponsor = confirm('TizenBrew has been installed. You can find TizenBrew by going into the app store and clicking the settings icon..\n\nYou can support the development of TizenBrew by sponsoring reisxd.\nWould you like to do it?');
                if (sponsor) {
                    window.open('https://github.com/sponsors/reisxd');
                }
            }
            break;
        }
    }
}

function addButtons(installed) {
    document.getElementById('appList').innerHTML = `
    <div class="card selected" tabindex="0" onclick="window.manageTizenBrew(${installed})">
        <h1>${installed ? 'Update TizenBrew' : 'Install TizenBrew'}</h1>
        <h3>${installed ? 'Get access to a newer version of TizenBrew.' : 'Get access to your favorite TizenBrew modules.'}</h3>
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

window.manageTizenBrew = function (isUpdate) {
    send({ type: 'installApp', installType: isTizen8 ? 'New' : 'Old' });
}