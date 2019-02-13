/**
 * loaders to output
 */

module.exports = function(source) {
  if (this.cacheable) this.cacheable()
  if (source.includes('"gecko"')) {
    this.emitFile(
      '../dist-firefox/manifest.json',
      source
    )
  } else {
    this.emitFile(
      'manifest.json',
      source
    )
  }

  return '{}'
}

