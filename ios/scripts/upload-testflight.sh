#!/usr/bin/env bash
# Build + archive + upload the MTMap app to TestFlight.
# Uses the App Store Connect API key (same one as prowl/longway).
set -euo pipefail
cd "$(dirname "$0")/.."
KEY_ID="${ASC_KEY_ID:-888FXCKL7N}"
ISSUER="${ASC_ISSUER:-e6def670-96c8-4a8f-a235-66735bdbab0a}"
KEYPATH="$HOME/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8"
AUTH=(-allowProvisioningUpdates -authenticationKeyID "$KEY_ID" -authenticationKeyIssuerID "$ISSUER" -authenticationKeyPath "$KEYPATH")
rm -rf build/MTMap.xcarchive build/ipa
xcodegen generate
xcodebuild -project MTMap.xcodeproj -scheme MTMap -configuration Release \
  -archivePath build/MTMap.xcarchive -destination 'generic/platform=iOS' "${AUTH[@]}" archive
xcodebuild -exportArchive -archivePath build/MTMap.xcarchive \
  -exportOptionsPlist ExportOptions.plist -exportPath build/ipa "${AUTH[@]}"
xcrun altool --upload-app -f "$(ls build/ipa/*.ipa | head -1)" --type ios \
  --apiKey "$KEY_ID" --apiIssuer "$ISSUER"
echo "Uploaded to TestFlight. Processing takes a few minutes in App Store Connect."
