

import initThirdPartyApi from './features/third-party-api'
import insertClickToCall from './features/insert-click-to-call-button'
import addHoverEvent from './features/hover-to-show-call-button'
import convertPhoneLink from './features/make-phone-number-clickable'
import {
  popup
} from './common/helpers'
import './common/style.styl'
import './common/custom.styl'

function registerService() {

  // handle contacts sync feature
  initThirdPartyApi()

  // insert click-to-call button
  insertClickToCall()

  // add event handler to developer configed element, show click-to-dial tooltip to the elements
  addHoverEvent()

  // convert phonenumber text to click-to-dial link
  convertPhoneLink()

  // Listen message from background.js to open app window when user click icon.
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action === 'openAppWindow') {
        popup()
      }
      sendResponse('ok')
    }
  )
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
