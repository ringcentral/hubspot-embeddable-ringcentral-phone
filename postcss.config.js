const { replacer, presets } = require('postcss-rename-selector')

module.exports = {
  // parser: 'sugarss',
  plugins: [
    replacer(presets.antdReplacer)
  ]
}
