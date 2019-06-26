const {
  override,
  addDecoratorsLegacy,
  disableEsLint,
  addBundleVisualizer,
  addWebpackExternals
} = require("customize-cra");
const path = require("path");

module.exports = override(
  addDecoratorsLegacy(),
  disableEsLint(),
  // addWebpackExternals({
  //   'react': 'React',
  //   'react-dom': 'ReactDom'
  // }),
  process.env.BUNDLE_VISUALIZE == 1 && addBundleVisualizer()
)