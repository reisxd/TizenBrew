# TizenBrew Build Script

This document explains how to use the automated build script to package and install TizenBrew on Samsung Smart TVs.

## Overview

The `build.sh` script automates the entire build process, eliminating the need to manually run `tizen build-web` which often hangs at 80%. This script provides a reliable alternative that:

- Cleans previous builds
- Copies only essential files (avoiding problematic files like `.DS_Store`)
- Packages the application with proper certificate signing
- Installs the app automatically

## Prerequisites

Before using the build script, ensure you have:

1. **Tizen Studio** installed and configured
2. **Valid certificates** set up in Tizen security profiles
3. **UI and Service built** (see sections below)

## Building Components

### 1. Build the Service (Required)

```bash
cd tizenbrew-app/TizenBrew/service-nextgen/service
npm install
npx @vercel/ncc build index.js
```

This creates `dist/index.js` which the build script will copy.

### 2. Build the UI (Required)

```bash
cd tizenbrew-app/TizenBrew/tizenbrew-ui
npm install --force
npm run build
```

This creates the `dist/` folder with the UI assets.

## Using the Build Script

### Quick Start

```bash
cd tizenbrew-app/TizenBrew
./build.sh
```

The script will:
1. Clean any previous build artifacts
2. Copy configuration files (`config.xml`, `icon.png`)
3. Copy UI build files from `tizenbrew-ui/dist/`
4. Copy service build files from `service-nextgen/service/dist/`
5. Remove problematic files (like `.DS_Store`)
6. Package the application as a `.wgt` file
7. Install the application to your connected Samsung TV

### Script Output

The script provides detailed output showing each step:

```
Starting TizenBrew build process...
Copying configuration files...
Copying UI files...
Copying service files...
Build structure created successfully!
Files in .buildResult:
.buildResult/icon.png
.buildResult/tizenbrew-ui/dist/index.html
...
Packaging application...
Package created successfully!
Installing application...
```

## Troubleshooting

### Common Issues

#### 1. Certificate Errors
If you see certificate-related errors:
```
app_id[xvvl3S1bvH.TizenBrewStandalone] install failed[118, -12], reason: Check certificate error
```

**Solution**: Create new certificates in Tizen Studio's Certificate Manager.

#### 2. UI Not Built
```
Error: UI not built. Run 'npm run build' in tizenbrew-ui first.
```

**Solution**: Build the UI components first (see Building Components section).

#### 3. Service Not Built
```
Error: Service not built. Run build process in service-nextgen/service first.
```

**Solution**: Build the service components first (see Building Components section).

#### 4. Connection Issues
If the TV is not connecting:
- Ensure TV is in Developer Mode
- Check TV IP address in Tizen Studio Device Manager
- Verify TV and computer are on the same network

### Manual Cleanup

If you need to manually clean build artifacts:

```bash
# Remove build directory
rm -rf .buildResult

# Remove any .DS_Store files (macOS)
find . -name ".DS_Store" -delete
```

Use automated script:

```bash
# USE THIS - Reliable and fast
./build.sh
```

## File Structure

The build script creates this structure in `.buildResult/`:

```
.buildResult/
├── config.xml                           # App configuration
├── icon.png                            # App icon
├── tizenbrew-ui/
│   └── dist/
│       ├── index.html                   # Main UI
│       └── assets/                      # UI assets
└── service-nextgen/
    └── service/
        └── dist/
            └── index.js                 # Service logic
```

## Technical Details

### Why This Works Better

The script avoids the `tizen build-web` hang by:
- Manually copying files instead of using Tizen's file processing
- Excluding problematic files and directories
- Using selective copying to avoid large/complex directory structures
- Implementing proper error handling

### Certificate Management

The script uses the active Tizen security profile. To check your profiles:

```bash
tizen security-profiles list
```

To set a specific profile:

```bash
tizen security-profiles set-active -n YOUR_PROFILE_NAME
```

## Version History

- **v1.0**: Initial build script with manual file copying
- **v1.1**: Added automatic .DS_Store cleanup
- **v1.2**: Improved error handling and validation
