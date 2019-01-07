/**
 * loaders to output
 */

module.exports = function(source) {
  if (this.cacheable) this.cacheable()
  this.emitFile(
    'manifest.json',
    source
  )
  return '{}'
}

