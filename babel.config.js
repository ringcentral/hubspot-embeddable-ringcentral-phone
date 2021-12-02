module.exports = {
  presets: [
    '@babel/preset-react',
    ['@babel/env', {
      targets: {
        chrome: 87,
        node: 'current'
      }
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    'babel-plugin-lodash',
    [
      'import',
      {
        libraryName: 'antd',
        style: true
      }
    ],
    '@babel/plugin-transform-runtime'
  ]
}
