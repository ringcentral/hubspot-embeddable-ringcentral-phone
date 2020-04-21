
const webpack = require('webpack')
const sysConfigDefault = require('./config.default')
const ExtraneousFileCleanupPlugin = require('webpack-extraneous-file-cleanup-plugin')
const path = require('path')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const pack = require('./package.json')

const stylusSettingPlugin = new webpack.LoaderOptionsPlugin({
  test: /\.styl$/,
  stylus: {
    preferPathResolver: 'webpack'
  }
})

const from = path.resolve(
  __dirname,
  'node_modules/ringcentral-embeddable-extension-common/src/icons'
)
const to1 = path.resolve(
  __dirname,
  'dist/icons'
)
// const f2 = path.resolve(
//   __dirname,
//   'node_modules/jsstore/dist/jsstore.min.js'
// )
const f31 = path.resolve(
  __dirname,
  'node_modules/react/umd/react.production.min.js'
)
const f32 = path.resolve(
  __dirname,
  'node_modules/react-dom/umd/react-dom.production.min.js'
)
const f3 = path.resolve(
  __dirname,
  'node_modules/jsstore/dist/jsstore.worker.min.js'
)
const to4 = path.resolve(
  __dirname,
  'dist'
)
const opts = {
  extensions: ['.map', '.js'],
  minBytes: 3900
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
    content: './src/content.js',
    background: './src/background.js',
    manifest: './src/manifest.json'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: '[name].[hash].js',
    libraryTarget: 'var'
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  resolveLoader: {
    modules: [
      path.join(process.cwd(), 'loaders'),
      path.join(process.cwd(), 'node_modules')
    ]
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  optimization: {
    minimize: sysConfigDefault.minimize
  },
  module: {
    rules: [
      {
        test: /manifest\.json$|manifest-firefox\.json$/,
        use: [
          'manifest-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules\/(?!(ringcentral-embeddable-extension-common)\/).*/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                '@babel/react',
                ['@babel/env', {
                  targets: {
                    chrome: 58,
                    node: 'current'
                  }
                }]
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                'babel-plugin-lodash',
                '@babel/plugin-syntax-dynamic-import',
                [
                  '@babel/plugin-proposal-decorators',
                  {
                    legacy: true
                  }
                ],
                [
                  '@babel/plugin-transform-runtime',
                  {
                    regenerator: true
                  }
                ],
                [
                  'import',
                  {
                    libraryName: 'antd',
                    libraryDirectory: 'es',
                    style: true
                  }
                ]
              ]
            }
          }
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
    stylusSettingPlugin,
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true
    }),
    new CopyWebpackPlugin([{
      from,
      to: to1,
      force: true
    }, /* {
      from: f2,
      to: to4,
      force: true
    }, */ {
      from: f3,
      to: to4,
      force: true
    }, /* {
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
    }], {}),
    new ExtraneousFileCleanupPlugin(opts),
    new webpack.DefinePlugin({
      'process.env.ringCentralConfigs': JSON.stringify(sysConfigDefault.ringCentralConfigs),
      'process.env.thirdPartyConfigs': JSON.stringify(sysConfigDefault.thirdPartyConfigs),
      'process.env.version': JSON.stringify(pack.version)
    })
  ]
}

module.exports = config
