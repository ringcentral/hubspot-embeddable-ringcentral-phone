

import initThirdPartyApi from './third-party-api'
import insertClickToCall from './insert-click-to-call-button'
import addHoverEvent from './hover-to-show-call-button'
import {
  popup
} from './helpers'
import './style.styl'

function registerService() {
  // Listen message from background.js to open app window when user click icon.
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action === 'openAppWindow') {
        popup()
      }
      sendResponse('ok')
    }
  )

  // handle contacts sync feature
  initThirdPartyApi()

  // insert click-to-call button
  insertClickToCall()

  // add event handler to developer configed element, show click-to-dial tooltip to the elements
  addHoverEvent()
}

let registered = false
export default () => {
  window.addEventListener('message', function (e) {
    const data = e.data
    if (data && data.type === 'rc-adapter-pushAdapterState' && registered === false) {
      registered = true
      registerService()
    }
  })
}
