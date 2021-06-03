
const webpack = require('webpack')
const sysConfigDefault = require('./config.default')
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
const to4 = path.resolve(
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
const pug = {
  loader: 'pug-html-loader',
  options: {
    data: {
      _global: {}
    }
  }
}

const config = {
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
    libraryTarget: 'var',
    library: 'RcForHubSpotChromeExt'
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      'antd/dist/antd.less$': path.resolve(__dirname, 'src/lib/antd.less')
    }
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
          'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: {
          and: [/node_modules/], // Exclude libraries in node_modules ...
          not: [
            // Except for a few of them that needs to be transpiled because they use modern syntax
            /ringcentral-embeddable-extension-common/
          ]
        },
        use: ['babel-loader']
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
    new CopyWebpackPlugin({ patterns }),
    new webpack.DefinePlugin({
      'process.env.ringCentralConfigs': JSON.stringify(sysConfigDefault.ringCentralConfigs),
      'process.env.thirdPartyConfigs': JSON.stringify(sysConfigDefault.thirdPartyConfigs),
      'process.env.version': JSON.stringify(pack.version)
    })
  ]
}

module.exports = config
