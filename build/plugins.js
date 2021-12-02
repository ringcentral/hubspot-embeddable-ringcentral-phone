require('dotenv').config()
const webpack = require('webpack')

exports.stylusSettingPlugin = new webpack.LoaderOptionsPlugin({
  test: /\.styl$/,
  stylus: {
    preferPathResolver: 'webpack'
  },
  'resolve url': false
})
