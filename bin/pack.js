/**
 * pack dist folders to zip file for release
 */

const {
  exec,
  rm
} = require('shelljs')
const pack = require('../package.json')

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
  }
}

run()
