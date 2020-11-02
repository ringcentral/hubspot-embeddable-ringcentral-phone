
/**
 * content.js for chrome extension
 */

import createApp from 'ringcentral-embeddable-extension-common/src/spa/init'
import * as config from './config'
import { ringCentralConfigs, thirdPartyConfigs, appVersion } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import 'ringcentral-embeddable-extension-common/src/spa/style.styl'
import './custom.styl'

let {
  clientID,
  appServer,
  clientSecret,
  authUrl
} = ringCentralConfigs

let appConfigQuery = ''
let { serviceName } = thirdPartyConfigs
if (clientID || appServer) {
  appConfigQuery = `?appVersion=${appVersion}&zIndex=2222&prefix=${serviceName}-rc&newAdapterUI=1&disconnectInactiveWebphone=1&userAgent=${serviceName}_extension%2F${appVersion}&disableActiveCallControl=false&appKey=${clientID}&appSecret=${clientSecret}&appServer=${encodeURIComponent(appServer)}&disableConferenceCall=false&redirectUri=${authUrl}`
}

/* eslint-disable-next-line */
;(function() {
  console.log('import RingCentral Embeddable Voice to web page')
  var rcs = document.createElement('script')
  var u = chrome.runtime.getURL('embeddable/adapter.js') + appConfigQuery
  rcs.src = u
  var rcs0 = document.getElementsByTagName('script')[0]
  rcs0.parentNode.insertBefore(rcs, rcs0)
})()

window.addEventListener('load', createApp(config))
