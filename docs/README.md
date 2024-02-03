# TizenBrew

Welcome to TizenBrew! TizenBrew is a way to experience modded websites (like [TizenTube](https://github.com/reisxd/TizenTube)) and you can install newer apps without having to deal with Tizen Studio multiple times.

TizenBrew is a modular system, meaning you can install new modded websites and apps without having to mess with Tizen Studio.

## Installation

To install TizenBrew, you need to have a Samsung TV (Tizen) device that has at least Tizen 3.0 (2017 or newer). You can install TizenBrew by following the instructions below:

1. Install Node.js and NPM. You can download Node.js from [here](https://nodejs.org/en/download/).

2. Install Tizen Studio by following the instructions [here](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html).

3. Connect to your TV using this [guide](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#:~:text=Connect%20the%20TV%20to%20the%20SDK%3Al).

4. Create a Samsung Certificate by following the instructions [here](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html).

5. Clone the repository to your computer:
```bash
git clone https://github.com/reisxd/TizenBrew.git
```

6. Open Tizen Studio and open the TizenBrew application by going to `File > Import > Tizen > Tizen Project > Next > Browse > tizenbrew-app/TizenBrew > Next > Finish`.

7. You can now run the application by pressing the play button.

8. You'll have to set the server up. First, install modules by running:
```bash
npm install
```

9. Change the config.json file to your server's (can be your PC, your SBC, etc.) IP address.

10. You can now run the server by running:
```bash
node .
```

11. Launch the TizenBrew app on your TV and enter the server's IP address.

12. Everything is set up! You can now install modules and adding them to the config.json file. Here's an example of how to add a module to the config.json file:
```json
{
    "appId": "UMkYeZBOqz.TizenBrew",
    "tvIP": "192.168.1.8",
    "debug": false,
    "modules": [
        "@reisxd/tizentube", // Add the module like this
        "@reisxd/some-other-module"
    ]
}
```

13. After adding a module to the config.json file, restart the server.