
module.exports = [
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
    use: ['babel-loader?cacheDirectory']
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
  }
]
