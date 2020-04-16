/**
 * download adapter.js of embeddable
 */

const {
  exec,
  cp,
  rm
} = require('shelljs')

rm('-rf', 'dist/embeddable')
rm('-rf', 'ringcentral-embeddable-gh-pages')
exec('wget https://github.com/ringcentral/ringcentral-embeddable/archive/gh-pages.zip')
exec('unzip -a gh-pages.zip')
cp('-r', 'ringcentral-embeddable-gh-pages', 'dist/embeddable')
rm('-rf', 'ringcentral-embeddable-gh-pages')
