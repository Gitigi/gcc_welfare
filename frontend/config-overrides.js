const {
  override,
  addDecoratorsLegacy,
  disableEsLint,
  addBundleVisualizer,
  addWebpackExternals,
  addWebpackAlias
} = require("customize-cra");
const path = require("path");

module.exports = override(
  addDecoratorsLegacy(),
  disableEsLint(),
  addWebpackAlias({'jquery': 'jquery/dist/jquery.slim.js'}),
  // addWebpackExternals({
  //   'react': 'React',
  //   'react-dom': 'ReactDom'
  // }),
  process.env.BUNDLE_VISUALIZE == 1 && addBundleVisualizer()
)