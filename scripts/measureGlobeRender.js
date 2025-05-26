// scripts/measureGlobeRender.js
const { renderToString } = require('react-native-render-html/server');
const React = require('react');
const { GlobeRenderer } = require('../src/components/globe/GlobeRenderer').default;
const RegionContext = require('../src/context/RegionContext');

async function main() {
  // Shim a minimal context provider
  const state = Object.keys(require('../src/data/RegionMapSchema').RegionMap)
    .reduce((acc, key) => { acc[key] = { unlocked: true, bloomLevel: 2 }; return acc; }, {});
  RegionContext.useRegionState = () => state;

  const start = Date.now();
  renderToString(React.createElement(GlobeRenderer, { onRegionPress: () => {} }));
  const ms = Date.now() - start;
  console.log(`🌐 GlobeRenderer server‐rendered in ${ms}ms`);
}

main();
