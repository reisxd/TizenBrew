# 🍺 TizenBrew & TizenTube Full Install Guide

A reality‑tested install guide for TizenBrew & TizenTube on Samsung Smart TVs (2023–2025), with command‑line steps, certificates, and known failure fixes.

## ✅ Samsung Smart TVs (Tizen OS 6–8 / 2023–2025 Firmware)  
### Cross-platform (Windows, macOS, Linux)

This guide provides a **tested**, **real-world**, and **cross-platform** method to install **TizenBrew** and **TizenTube** on modern Samsung Smart TVs running **Tizen 6, 7, or 8**.

---

## ✅ What This Guide *Is* (and Is Not)

**This guide _is_:**
- Validated on 2023–2025 Samsung firmware
- Designed to **prevent silent failures**
- Focused on **practical install** with known quirks
- Includes full certificate + CLI steps

**This guide _is not_:**
- A jailbreak
- A USB sideloading guide
- A general Tizen app dev tutorial
- An IPTV replacement solution

---

## 🧰 Requirements

**Hardware**
- Samsung Smart TV with **Developer Mode**
- TV and computer on the **same local network**

**Software**
- Windows / macOS / Linux PC
- Internet access
- Administrator permissions on your PC

**Files**
- `TizenBrewStandalone.wgt` (from the **Releases** page — not source code)

---

## 🧱 Step-by-Step Instructions

### 1️⃣ Enable Developer Mode on the Samsung TV

- Open **Apps**
- Open Developer Mode (hidden menu — varies by model)
- Set:
  - Developer Mode: ON
  - Host PC IP: your computer’s local LAN IP (e.g. `192.168.1.25`)
- Reboot the TV when prompted

> ⚠️ **Do not use `127.0.0.1` at this stage** — that comes *after* first install.

---

### 2️⃣ Install Tizen Studio

- Download from the [Samsung Developer site](https://developer.samsung.com/tizen)
- Choose **Custom Install**
- Select:
  - Tizen SDK Tools
  - TV Extensions
  - Samsung Certificate Extension
  - Tizen Web App Development

---

### 3️⃣ Install Required Packages

In Tizen Studio:
- Tools → Package Manager

Install these packages:

**Mandatory**
- Tizen SDK Tools
- TV Extensions
- Samsung Certificate Extension
- Tizen Web App Development

**Strongly Recommended**
- Samsung TV Emulator
- CLI tools

Restart Tizen Studio.

---

### 4️⃣ Tool Locations (Critical)

#### Windows
```
C:\tizen-studio\tools\sdb.exe
C:\tizen-studio\tools\ide\bin\tizen.bat
```

#### macOS / Linux
```
~/tizen-studio/tools/sdb
~/tizen-studio/tools/ide/bin/tizen
```

> ⚠️ These tools are *not* added to PATH by default

---

### 5️⃣ CRITICAL: Correct Use of `sdb`

macOS / Linux:
```
cd ~/tizen-studio/tools
./sdb devices
```

Windows:
```
cd C:\tizen-studio\tools
sdb devices
```

---

### 6️⃣ Connect the TV to the PC

```
sdb connect <TV_IP>:26101
sdb devices
```

Expected output:

```
<TV_IP>:26101    device    <TV_MODEL>
```

If the TV does not appear as a device, stop here and fix this.

---

### 7️⃣ Create Samsung Certificates

In Tizen Studio:
- Tools → Certificate Manager
- Create a new Samsung certificate profile
- Create:
  - Author certificate
  - Distributor certificate
- Add the TV DUID
- Sign in with a Samsung account if required

---

### 8️⃣ Activate the Certificate Profile

Check profiles:
```
tizen security-profiles list
```

You must see:
```
myprofile   O
```

If not active:
```
tizen security-profiles set-active -n myprofile
```

---

### 9️⃣ Re-Sign the TizenBrew Package

You must re-sign the downloaded `.wgt` file:

```
tizen package -t wgt -s myprofile -o ./resigned -- TizenBrewStandalone.wgt
```

Confirm output file exists:
```
ls ./resigned
```

You should see:
```
TizenBrewStandalone.wgt
```

---

### 🔟 Install the Package (THE KEY STEP)

> ⚠️ Do NOT use `sdb install` — it does not register the app!

Install using:
```
tizen install -n ./resigned/TizenBrewStandalone.wgt -t <DEVICE_NAME>
```

You must see:
```
install completed
Tizen application is successfully installed.
```

---

### 1️⃣1️⃣ Launch TizenBrew

On the TV:
- Open Apps
- Look for the beer glass icon
- Launch TizenBrew once

---

### 1️⃣2️⃣ Final Developer Mode Configuration

After first launch:
- Open Developer Mode again
- Set Host PC IP to:
```
127.0.0.1
```
- Fully reboot the TV (long power press)

---

### 1️⃣3️⃣ Install TizenTube

- Open TizenBrew
- Install TizenTube
- Exit

TizenTube will now appear as a standalone app.

---

## ⚠️ Known Failure Points

| Issue                           | Explanation                                          |
|--------------------------------|------------------------------------------------------|
| `sdb install` used             | App pushed but not registered                        |
| USB install fails              | Code -6 error — blocked by firmware                  |
| `sdb` run from wrong directory | Silent failure                                       |
| Certificate not active         | App installs but never shows                         |
| Host PC IP set to `127.0.0.1`  | Breaks initial discovery if used too early           |

---

## 📈 Performance Notes

- 4K playback may stutter (software decoding)
- 1080p / 1440p recommended
- IPTV works best via external devices (Android TV / Chromecast)

---

## ✅ Summary

- TizenBrew works on modern Samsung TVs (2023–2025)
- CLI install with proper signing is **the only reliable method**
- Common issues are all covered above

---

## 🙌 Contributing

If you found undocumented behavior, firmware changes, or improved steps:

- Document them
- Submit them
- Save the next person the pain

> Guide written after hours of trial/error, scripting, failed USB attempts, silent CLI failures, and eventual success. 🍺

**Original TizenBrew project:** https://github.com/reisxd/TizenBrew
