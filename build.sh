#!/bin/bash

# Note this is a simple build script the builds the frontend and then copies the built files to the backend's public directory before building the backend.
# It's made to test the build process and is not meant to be used in production. In production we will use docker to build the frontend and backend separately and then copy the built files to the backend's public directory.

echo "Building frontend..." 
cd frontend
pnpm install
pnpm build

echo "Copying files to backend..."
rm -rf ../backend/public
mkdir -p ../backend/public
cp -r dist/* ../backend/public/

echo "Building backend..."
cd ../backend
pnpm install
pnpm build

echo "Done."