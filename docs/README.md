# TizenBrew

Welcome to TizenBrew! TizenBrew is a way to experience modded websites (like [TizenTube](https://github.com/reisxd/TizenTube)) and you can install newer apps without having to deal with Tizen Studio multiple times.

TizenBrew is a modular system, meaning you can install new modded websites and apps without having to mess with Tizen Studio.

## Installation

To install TizenBrew, you need to have a Samsung TV (Tizen) device that has at least Tizen 3.0 (2017 or newer). There are four ways to install TizenBrew.

### PREFERRED: Using TizenBrew Installer

This is the easiest method and works on every Samsung TV released since 2017.

#### 1. Set the Host PC IP Address to `127.0.0.1`
1. Open **Apps** or **App Settings** on your Samsung TV.
2. In the **Apps** panel, enter `12345` using your remote control or the on-screen keypad.
3. A *Developer Mode* configuration popup will appear:
   - Switch **Developer mode** to **On**.
   - Under **Host PC IP**, enter `127.0.0.1`.
4. Click **OK**.
5. Reboot your TV.

For more details, see [Step 1 here under “Connecting the TV and SDK”](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK).

#### 2. Install TizenBrew Installer from a USB Drive
1. Download the [latest `userwidget.zip` file](https://github.com/reisxd/TizenBrewInstaller/releases/latest) from the TizenBrewInstaller repository.
2. Extract `userwidget.zip` to the **root** of your USB drive.  
   Example: If your USB is drive **D:**, the path should look like:  
`D:/userwidget/app.tmg`
3. Insert the USB drive into your Samsung TV.  
The TV will automatically install the demo version of TizenBrew Installer and display a notification when the app is installing.

#### 3. Install the Full Version
1. Launch **TizenBrew Installer** on your TV.
2. Click **Install TizenBrew** to upgrade to the full version.

> **Note:** If you're on **Tizen 7 or above**, you’ll be prompted to sign in to your Samsung account. Follow the on-screen instructions to create a Samsung certificate.

## Other Installation Methods

### Using USB Demo Package

Note that if you want to install TizenBrew using this method, the app will be installed for only 30 days. If you want to have TizenBrew permanently installed, use either the TizenBrew Installer or the Command Line method.

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
