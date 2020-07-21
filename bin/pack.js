/**
 * pack dist folders to zip file for release
 */

const {
  exec,
  rm,
  cp
} = require('shelljs')
const pack = require('../package.json')
const replace = require('replace-in-file')
const { resolve } = require('path')
const options = {
  files: resolve(__dirname, '../dist/content.js'),
  from: /messageLoggerPath/g,
  to: '// messageLoggerPath:'
}

// zip -vr folder.zip folder/ -x "*.DS_Store"
// hubspot-embeddable-ringcentral-phone-google-chrome-1.6.0.zip
// hubspot-embeddable-ringcentral-phone-mozilla-firefox-1.8.4.zip

const config = [
  {
    name: 'google-chrome',
    folder: 'dist'
  }
]

async function run () {
  rm('-rf', '*.zip')
  for (let v of config) {
    let cmd = `zip -vr ${pack.name}-${v.name}-${pack.version}.zip ${v.folder}/ -x "*.DS_Store"`
    exec(cmd)
    cp('dist/content.js', 'content.js.bak.js')
    await replace(options)
    let cmd1 = `zip -vr ${pack.name}-${v.name}-no-msg-log-sync-${pack.version}.zip ${v.folder}/ -x "*.DS_Store"`
    exec(cmd1)
    cp('content.js.bak.js', 'dist/content.js')
    rm('content.js.bak.js')
  }
}

run()
