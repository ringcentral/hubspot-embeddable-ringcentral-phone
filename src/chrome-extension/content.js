

import main from './init'
import {ringCentralConfigs} from './app-config'

let {
  appKey,
  appServer
} = ringCentralConfigs

let appConfigQuery = ''
if (appKey || appServer) {
  appConfigQuery = `?appKey=${appKey}&appServer=${encodeURIComponent(appServer)}`
}

/* eslint-disable-next-line */
;(function() {
  console.log('import RingCentral Embeddable Voice to web page')
  var rcs = document.createElement('script')
  rcs.src = 'https://ringcentral.github.io/ringcentral-embeddable/adapter.js' + appConfigQuery
  var rcs0 = document.getElementsByTagName('script')[0]
  rcs0.parentNode.insertBefore(rcs, rcs0)
})()

window.addEventListener('load', main)
