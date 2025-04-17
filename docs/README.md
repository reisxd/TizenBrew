# TizenBrew

Welcome to TizenBrew! TizenBrew is a way to experience modded websites (like [TizenTube](https://github.com/reisxd/TizenTube)) and you can install newer apps without having to deal with Tizen Studio multiple times.

TizenBrew is a modular system, meaning you can install new modded websites and apps without having to mess with Tizen Studio.

## Installation

To install TizenBrew, you need to have a Samsung TV (Tizen) device that has at least Tizen 3.0 (2017 or newer). There are four ways to install TizenBrew.

### Using TizenBrew Device Manager

This method is easier than any other method and works on all Tizen versions, unless you're on Tizen 7 or above, which you'll need to resign TizenBrew.

1. Change the Host PC IP address to your PC's IP address by following [this](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

2. Download the latest TizenBrew Device Manager for your OS from the [releases page](https://github.com/reisxd/tizenbrew-device-manager/releases/latest).

3. Install / Run TizenBrew Device Manager, go into "Connect Device" page and connect to your TV.

4. Download the latest TizenBrew widget package from the [releases page](https://github.com/reisxd/TizenBrew/releases/latest).

5. After connecting to your TV, go into "Apps" page and click "Install App" button, select the widget package you've selected and then click "Install". You should see an alert showing the logs. The logs should say that the app has been installed now.

6. Change the Host PC IP address to `127.0.0.1` by following [this](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

7. You can now launch the TizenBrew app on your TV.

### Using TizenBrew Installer

This method is easier than the USB Demo Package method, but it works only on Tizen 3.0 to 6.0 (2017 to 2021). If you have a newer TV, use the TizenBrew Device Manager or the USB Demo Package method or the Command Line method.

1. Change the Host PC IP address to `127.0.0.1` by following [this](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

2. Open up https://tizentube.vercel.app/installer on your TV's browser.

3. Click on the "Install TizenBrew" button.

4. You can now launch the TizenBrew app on your TV.

### Using USB Demo Package

Note that if you want to install TizenBrew using this method, the app will be installed for only 30 days. If you want to have TizenBrew permanently installed, use the command line method. This method is the 2nd easiest way to install TizenBrew.

1. Download the latest TizenBrew USB Demo Package from the [releases page](https://github.com/reisxd/TizenBrew/releases/latest).

2. Extract the contents of the zip file to a USB drive.

3. Connect the USB drive to your TV.

4. Wait for the TV to recognize the USB drive and it'll automatically install TizenBrew.

5. Change the Host PC IP address to `127.0.0.1` by following [this](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

6. You can now launch the TizenBrew app on your TV.

### Using The Command Line

1. Install Tizen Studio by following the instructions [here](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html).

2. Connect to your TV using this [guide](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html).

3. Download the latest TizenBrew Widget from the [releases page](https://github.com/reisxd/TizenBrew/releases).

4. Check if the TV is connected by running:
```bash
sdb devices
```

Note that sdb is in `C:\tizen-studio\tools` on Windows and in `~/tizen-studio/tools` on Linux.

5. Install the TizenBrew Widget by running:
```bash
tizen install -n path/to/TizenBrewStandalone.wgt 
```

Note that tizen is in `C:\tizen-studio\tools\ide\bin` on Windows and in `~/tizen-studio/tools/ide/bin` on Linux.

6. Set the Host PC IP address to `127.0.0.1` by following [this](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

7. You can now launch the TizenBrew app on your TV.


## Resigning TizenBrew

To resign TizenBrew, you need to have Tizen Studio installed on your system. You can install Tizen Studio from [here](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html). 

You also need to have a Samsung certificate. First connect to your TV by following [this](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html).

You can create a Samsung certificate by following [this](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html). 

You'll also need to have the TizenBrew package. You can download the TizenBrew package from the [releases page](https://github.com/reisxd/TizenBrew/releases/latest).

After you have all the requirements, you can resign TizenBrew by following these steps:

1. Run the following command to resign TizenBrew:
```bash
tizen package -t wgt -s <profile name> -o ./resigned -- path/to/TizenBrewStandalone.wgt

# Example
# tizen package -t wgt -s MyProfile -o ./resigned -- path/to/TizenBrewStandalone.wgt
```

Note that tizen is in `C:\tizen-studio\tools\ide\bin` on Windows and in `~/tizen-studio/tools/ide/bin` on Linux.

2. Install the resigned TizenBrew by running:
```bash
tizen install -n ./resigned/TizenBrewStandalone.wgt
```

3. Set the Host PC IP address to `127.0.0.1` by following [this](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

4. You can now launch the TizenBrew app on your TV.

## Rebuilding TizenBrew

To rebuild TizenBrew, you need to have Node.js installed on your system. You can install Node.js from [here](https://nodejs.org/). You also need to have Tizen Studio installed on your system. You can install Tizen Studio from [here](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html).

1. Download the source code from the [releases page](https://github.com/reisxd/TizenBrew/releases/latest) (zip file) or clone the repository by running:
```bash
git clone https://github.com/reisxd/TizenBrew.git
```

2. Open up the `tizenbrew-app/TizenBrew/service-nextgen/service` folder in a terminal and run:

```bash
npm install
npx @vercel/ncc build index.js
```

3. Open up the `tizenbrew-app/TizenBrew/tizenbrew-ui` folder in a terminal and run:

```bash
npm install --force
npm run build
```

4. Open up Certificate Manager by going to `Tools > Certificate Manager` and create a new Samsung certificate. See [this](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html) for more information.

5. Change the Host PC IP address to your PCs IP by following [this](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

6. Open up the `tizenbrew-app/TizenBrew` folder in a terminal and run:

```bash
sdb connect <TV IP>
tizen build-web -e ".*" -e "node_modules/*" -e "package*.json" -e "yarn.lock"
tizen package -t wgt -o ./release -- .buildResult
tizen install -n ./release/TizenBrewStandalone.wgt
```

Note that tizen is in `C:\tizen-studio\tools\ide\bin` on Windows and in `~/tizen-studio/tools/ide/bin` on Linux. Add it to your PATH or run it using `C:\tizen-studio\tools\ide\bin\tizen` on Windows and `~/tizen-studio/tools/ide/bin/tizen` on Linux. sdb is in `C:\tizen-studio\tools` on Windows and in `~/tizen-studio/tools` on Linux. Do the same for sdb as you did for tizen.

7. Change the Host PC IP address to `127.0.0.1` by following [this](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

8. You can now launch the TizenBrew app on your TV.