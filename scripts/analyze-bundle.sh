#!/ scripts/analyze-bundle.sh
#!/usr/bin/env bash
set -e
react-native bundle \
  --platform ios \
  --entry-file index.js \
  --bundle-output dist/main.jsbundle \
  --sourcemap-output dist/main.jsbundle.map \
  --dev false \
  --minify false

source-map-explorer dist/main.jsbundle dist/main.jsbundle.map
