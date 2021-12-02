const CopyWebpackPlugin = require('copy-webpack-plugin')
const { resolve } = require('path')

const from = resolve(
  __dirname,
  'node_modules/ringcentral-embeddable-extension-common/src/icons'
)
const to1 = resolve(
  __dirname,
  'dist/icons'
)
// const f2 = resolve(
//   __dirname,
//   'node_modules/jsstore/dist/jsstore.min.js'
// )
const f31 = resolve(
  __dirname,
  'node_modules/react/umd/react.production.min.js'
)
const f32 = resolve(
  __dirname,
  'node_modules/react-dom/umd/react-dom.production.min.js'
)
const to4 = resolve(
  __dirname,
  'dist'
)
const patterns = [{
  from,
  to: to1,
  force: true
}, /* {
  from: f2,
  to: to4,
  force: true
}, {
  from: f3,
  to: to4,
  force: true
},  {
  from: f2,
  to: to4f,
  force: true
}, */
{
  from: f31,
  to: to4,
  force: true
},
{
  from: f32,
  to: to4,
  force: true
}]
const copy = new CopyWebpackPlugin({
  patterns
})
module.exports = copy
