
const webpack = require('webpack')
const sysConfigDefault = require('./config.default')
const ExtraneousFileCleanupPlugin = require('webpack-extraneous-file-cleanup-plugin')
const packThreadCount = sysConfigDefault.devCPUCount // number
const HappyPack = require('happypack')
const happyThreadPool = packThreadCount === 0 ? null : HappyPack.ThreadPool({ size: packThreadCount })
const path = require('path')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const express = require('express')

const happyConf = {
  loaders: ['babel-loader'],
  threadPool: happyThreadPool,
  verbose: true
}

const stylusSettingPlugin =  new webpack.LoaderOptionsPlugin({
  test: /\.styl$/,
  stylus: {
    preferPathResolver: 'webpack'
  }
})

const opts = {
  extensions: ['.map', '.js'],
  minBytes: 3789
}

const pug = {
  loader: 'pug-html-loader',
  options: {
    data: {
      _global: {}
    }
  }
}

var config = {
  mode: 'production',
  entry: {
    content: './src/chrome-extension/content.js',
    redirect: './src/redirect/redirect.pug',
    '../app/redirect': './src/redirect/redirect.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: '[name].[hash].js',
    libraryTarget: 'var'
  },
  watch: true,
  resolve: {
    extensions: ['.js', '.json']
  },
  resolveLoader: {
    modules: [
      path.join(process.cwd(), 'node_modules')
    ]
  },
  optimization: {
    // We no not want to minimize our code.
    minimize: sysConfigDefault.minimize
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          packThreadCount === 0
            ? 'babel-loader?cacheDirectory'
            : 'happypack/loader?cacheDirectory'
        ]
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.(png|jpg|svg)$/,
        use: ['url-loader?limit=10192&name=images/[hash].[ext]']
      },
      {
        test: /\.pug$/,
        use: [
          'file-loader?name=../app/redirect.html',
          'concat-loader',
          'extract-loader',
          'html-loader',
          pug
        ]
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    packThreadCount === 0 ? null : new HappyPack(happyConf),
    stylusSettingPlugin,
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true
    }),
    new ExtraneousFileCleanupPlugin(opts),
    new webpack.DefinePlugin({
      'process.env.ringCentralConfigs': JSON.stringify(sysConfigDefault.ringCentralConfigs),
      'process.env.thirdPartyConfigs': JSON.stringify(sysConfigDefault.thirdPartyConfigs)
    })
  ],
  devServer: {
    port: sysConfigDefault.devPort,
    contentBase: __dirname,
    setup: function(app) {
      app.use('/', express.static(__dirname))
    }
  }

}

module.exports = config

