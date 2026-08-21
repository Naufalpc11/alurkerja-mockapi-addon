#!/bin/bash
set -e

# MinIO Configuration
MINIO_ENDPOINT="${MINIO_ENDPOINT:-minio.merapi.javan.id}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-javan2}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-asdf1234}"
MINIO_BUCKET_NAME="${MINIO_BUCKET_NAME:-javan-cli}"
MINIO_USE_SSL="${MINIO_USE_SSL:-true}"

# Read addon metadata from index.json
ADDON_KEY=$(python3 -c "import json; d=json.load(open('index.json')); print(d['addon_key'])")
VERSION=$(python3 -c "import json; d=json.load(open('index.json')); print(d['version'])")
ZIP_NAME="main.zip"

echo "Building addon: ${ADDON_KEY} v${VERSION}"

# Create zip excluding .git folder and views/node_modules
echo "Creating zip: ${ZIP_NAME}"
zip -r "${ZIP_NAME}" . -x "*.git*" -x ".git/*" -x ".git" -x "views/node_modules/*"

echo "Zip created: ${ZIP_NAME}"

# Setup MinIO client alias
if [ "${MINIO_USE_SSL}" = "true" ]; then
    MC_SCHEME="https"
else
    MC_SCHEME="http"
fi

MC_ALIAS="minio_build"
mc alias set "${MC_ALIAS}" "${MC_SCHEME}://${MINIO_ENDPOINT}" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}"

# Upload to MinIO
DEST_PATH="${MC_ALIAS}/${MINIO_BUCKET_NAME}/template/addons/${ZIP_NAME}"
echo "Uploading ${ZIP_NAME} to ${DEST_PATH}..."
mc cp "${ZIP_NAME}" "${DEST_PATH}"

echo "Upload complete: ${DEST_PATH}"

# Cleanup local zip
rm -f "${ZIP_NAME}"
echo "Done."
