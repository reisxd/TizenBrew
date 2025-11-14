#!/bin/bash
echo "Starting TizenBrew build process..."

# Clean previous build
rm -rf .buildResult
mkdir -p .buildResult

# Copy essential files
echo "Copying configuration files..."
cp config.xml .buildResult/
cp icon.png .buildResult/

# Copy UI build (ensure it's built first)
echo "Copying UI files..."
if [ -d "tizenbrew-ui/dist" ]; then
    mkdir -p .buildResult/tizenbrew-ui/dist
    cp -r tizenbrew-ui/dist/* .buildResult/tizenbrew-ui/dist/
else
    echo "Error: UI not built. Run 'npm run build' in tizenbrew-ui first."
    exit 1
fi

# Copy service build (ensure it's built first)
echo "Copying service files..."
if [ -f "service-nextgen/service/dist/index.js" ]; then
    mkdir -p .buildResult/service-nextgen/service/dist
    cp service-nextgen/service/dist/index.js .buildResult/service-nextgen/service/dist/
else
    echo "Error: Service not built. Run build process in service-nextgen/service first."
    exit 1
fi

# Remove any .DS_Store files
find .buildResult -name ".DS_Store" -delete

echo "Build structure created successfully!"
echo "Files in .buildResult:"
find .buildResult -type f

# Package the app
echo "Packaging application..."
tizen package -t wgt -o ./release -- .buildResult

if [ $? -eq 0 ]; then
    echo "Package created successfully!"
    echo "Installing application..."
    tizen install -n ./release/TizenBrewNextGeneration.wgt
else
    echo "Packaging failed!"
    exit 1
fi
