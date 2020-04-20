/**
 * download adapter.js of embeddable
 */

const {
  exec,
  cp,
  rm
} = require('shelljs')
// const replace = require('replace-in-file')
// const _ = require('lodash')
// const from = 'https://ringcentral.github.io/ringcentral-embeddable'
// const id = 'mghgakfckjffpapcfagahoabncnoajpi'
// const options = {
//   files: 'dist/embeddable/*.*',
//   from: new RegExp(_.escapeRegExp(from), 'gm'),
//   to: `chrome-extension://${id}`
// }

async function run () {
  rm('-rf', 'dist/embeddable')
  rm('-rf', 'extension-build.zip')
  exec('wget https://github.com/ringcentral/ringcentral-embeddable/archive/extension-build.zip')
  exec('unzip -a extension-build.zip')
  cp('-r', 'ringcentral-embeddable-extension-build', 'dist/embeddable')
  rm('-rf', 'ringcentral-embeddable-extension-build')
  // const r = await replace(options)
  // console.log(r)
}

run()
