require('dotenv').config()
const AntdDayjsWebpackPlugin = require('@electerm/antd-dayjs-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const { identity } = require('lodash')
const path = require('path')
const {
  stylusSettingPlugin
} = require('./plugins')
const rules = require('./rules')
const webpack = require('webpack')
const env = require('./config')
const {
  version
} = require('./common')

const config = {
  mode: 'production',
  entry: {
    content: './src/content.js',
    background: './src/background.js',
    manifest: './src/manifest.json'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: '[name].[hash].js',
    libraryTarget: 'var',
    library: 'RcForHubSpotChromeExt'
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  target: 'web',
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      'antd/dist/antd.less$': path.resolve(__dirname, '../src/lib/antd.less')
    }
  },
  resolveLoader: {
    modules: [
      path.join(process.cwd(), 'node_modules/ringcentral-embeddable-extension-common/loaders'),
      path.join(process.cwd(), 'node_modules')
    ]
  },
  module: {
    rules
  },
  devtool: 'source-map',
  optimization: {
    minimize: env.minimize
  },
  plugins: [
    stylusSettingPlugin,
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true
    }),
    new AntdDayjsWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.ringCentralConfigs': JSON.stringify(env.ringCentralConfigs),
      'process.env.thirdPartyConfigs': JSON.stringify(env.thirdPartyConfigs),
      'process.env.version': JSON.stringify(version)
    })
  ].filter(identity)
}

module.exports = config
