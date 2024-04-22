# TizenBrew

Welcome to TizenBrew! TizenBrew is a way to experience modded websites (like [TizenTube](https://github.com/reisxd/TizenTube)) and you can install newer apps without having to deal with Tizen Studio multiple times.

TizenBrew is a modular system, meaning you can install new modded websites and apps without having to mess with Tizen Studio.

## Installation

To install TizenBrew, you need to have a Samsung TV (Tizen) device that has at least Tizen 3.0 (2017 or newer). There are three ways to install TizenBrew.

### Using TizenBrew Installer

This method is easier than the USB Demo Package method, but it works only on Tizen 3.0 to 6.0 (2017 to 2021). If you have a newer TV, use the USB Demo Package method or the Command Line method.

1. Change the Host PC IP address to `127.0.0.1` by following [this](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

2. Open up https://tizentube.live/installer on your TV's browser.

3. Click on the "Install TizenBrew" button.

4. You can now launch the TizenBrew app on your TV.

### Using USB Demo Package

Note that this method could be temporary. If you want to have TizenBrew permanently installed, use the command line method. This method is the 2nd easiest way to install TizenBrew.

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
