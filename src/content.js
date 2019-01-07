
/**
 * content.js for chrome extension
 */

import createApp from 'ringcentral-embeddable-extension-common/src/spa/init'
import * as config from './config'
import {ringCentralConfigs} from 'ringcentral-embeddable-extension-common/src/common/app-config'
import 'ringcentral-embeddable-extension-common/src/spa/style.styl'
import './custom.styl'

let {
  clientID,
  appServer
} = ringCentralConfigs

let appConfigQuery = ''
if (clientID || appServer) {
  appConfigQuery = `?clientID=${clientID}&appServer=${encodeURIComponent(appServer)}`
}

/* eslint-disable-next-line */
;(function() {
  console.log('import RingCentral Embeddable Voice to web page')
  var rcs = document.createElement('script')
  rcs.src = 'https://ringcentral.github.io/ringcentral-embeddable/adapter.js' + appConfigQuery
  var rcs0 = document.getElementsByTagName('script')[0]
  rcs0.parentNode.insertBefore(rcs, rcs0)
})()

window.addEventListener('load', createApp(config))

