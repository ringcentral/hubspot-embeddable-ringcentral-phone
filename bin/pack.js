/**
 * pack dist folders to zip file for release
 */

const {
  exec,
  rm // ,
  // cp
} = require('shelljs')
const pack = require('../package.json')
// const replace = require('replace-in-file')
// const { resolve } = require('path')
// const options = {
//   files: resolve(__dirname, '../dist/content.js'),
//   from: /messageLoggerPath|callLoggerPath/g,
//   to: '// messageLoggerPath:'
// }

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
  rm('-rf', 'dist/*.map')
  rm('-rf', 'dist/manifest.js')
  for (const v of config) {
    const cmd = `zip -vr ${pack.name}-${v.name}-${pack.version}.zip ${v.folder}/ -x "*.DS_Store"`
    exec(cmd)
  }
  // cp('-r', 'dist', 'dist2')
  // Load the library and specify options
  // const replace = require('replace-in-file')
  // const options = {
  //   files: 'dist2/manifest.json',
  //   from: / {2}"key": "[^"]+",/,
  //   to: ''
  // }
  // replace.sync(options)
  // for (const v of config) {
  //   const cmd = `zip -vr ${pack.name}-${v.name}-${pack.version}.publish.zip ${v.folder}2/ -x "*.DS_Store"`
  //   exec(cmd)
  // }
}

run()
