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
    [
      'import',
      {
        libraryName: 'antd',
        style: 'less'
      }
    ],
    '@babel/plugin-transform-runtime'
  ]
}
