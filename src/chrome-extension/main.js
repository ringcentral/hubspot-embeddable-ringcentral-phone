/**
 * init start
 */
import {
  isCallTab,
  checkPhoneNumber,
  contactHasPhoneNumber,
  createElementFromHTML,
  callWithRingCentral,
  registerOnPathChange,
  popup,
  findParentBySel,
  isContactsListTab
} from './helpers'
import {initHubSpotAPI} from './hubspot-api'
import './style.styl'
import _ from 'lodash'

import RCLOGOSVG from './rc-logo'

const RCBTNCLS = 'call-with-ringccentral-btn'
const RCBTNCLS2 = 'call-with-rc-btn'
const RCTOOLTIPCLS = 'rc-tooltip'
const callBtnHtml = (cls = '') => `
<span class="${RCBTNCLS} rc-mg1r ${cls}">
  <span class="rc-iblock rc-mg1r">Call with</span>
  <img src="${RCLOGOSVG}" class="rc-iblock" />
</span>
`


function addCallWithRingCentralButton(phoneNumber) {
  let callBtn = document.querySelector('.start-call')
  //no user phone register
  let startCallBtn = document.querySelector('.panel-is-call button [data-key="twilio.notEnabled.skipOnboarding"]')
  if (!callBtn && !startCallBtn) {
    return
  }
  let callByRingCentralBtn = createElementFromHTML(callBtnHtml(RCBTNCLS2))

  callByRingCentralBtn.onclick = () => {
    callWithRingCentral(phoneNumber)
  }
  let callBtnParent = callBtn
    ? callBtn.parentNode
    : startCallBtn.parentNode.parentNode
  callBtnParent.insertBefore(callByRingCentralBtn, callBtnParent.childNodes[0])

}

//in contact call tab try add call with ringcentral button
function tryAddCallBtn() {
  let {href} = location
  if (!isCallTab(href)) {
    return
  }
  let callWithRingCentralBtn = document.querySelector('.' + RCBTNCLS2)
  if (callWithRingCentralBtn) {
    return
  }
  let phoneNumber = contactHasPhoneNumber()
  if (phoneNumber) {
    addCallWithRingCentralButton(phoneNumber)
  }
}

function syncCallLogToHubspot(call) {
  //todo
  console.log(call, 'call log get')
}

/**
 * get ringcentral contact button wrap dom
 * if not created, just create and append to body
 */
function getRCTooltip(phoneNumber) {
  let tooltip = document.querySelector('.' + RCTOOLTIPCLS)
  let isShowing = tooltip
    ? tooltip.style.display === 'block'
    : false
  if (!tooltip) {
    tooltip = createElementFromHTML(`
      <div class="${RCTOOLTIPCLS}">
        ${callBtnHtml()}
      </div>
    `)
  }
  tooltip.onclick = () => {
    callWithRingCentral(phoneNumber)
  }
  document.body.appendChild(tooltip)
  return {tooltip, isShowing}
}

/**
 * build tooltip postition style from event
 * @param {*} e
 */
function buildStyle(e) {
  let {clientX, clientY} = e
  if (clientX > window.innerWidth - 120) {
    clientX = window.innerWidth - 120
  }
  if (clientY > window.innerHeight - 34) {
    clientX = window.innerHeight - 34
  }
  return `left:${clientX + 3}px;top:${clientY - 34}px;display:block;`
}

/**
 * when mouseover contact list table row, show buttons for contact
 * only when contact has valid phone number
 * @param {DomEvent} e
 */
let currentRow = null
const handleAddRCBtn = (e) => {
  let {target} = e
  let dom = findParentBySel(target, 'table.table tbody tr')
  let isToolTip = findParentBySel(target, '.' + RCTOOLTIPCLS)
  if (!dom && !isToolTip && currentRow) {
    hideRCBtn()
  }
  if (!dom || currentRow === dom) {
    return
  }
  let phoneNumberNode = dom.querySelector('.column-phone span span')
  let text = phoneNumberNode
    ? (phoneNumberNode.textContent || '').trim()
    : ''
  if (!checkPhoneNumber(text)) {
    return
  }
  currentRow = dom
  let {tooltip, isShowing} = getRCTooltip(text)
  if (!isShowing) {
    tooltip.setAttribute('style', buildStyle(e))
  }
}

/**
 * when mouseleave contact list table row, hide buttons for contact
 * only when contact has valid phone number
 * @param {DomEvent} e
 */
const hideRCBtn = _.throttle(() => {
  currentRow = null
  let {tooltip} = getRCTooltip()
  tooltip.setAttribute('style', 'display:none')
}, 200)

//in contact list, show click to dial button
//when hover contact list
function tryAddContactsBtn() {
  let {href} = location
  if (!isContactsListTab(href)) {
    return
  }
  document.addEventListener('mouseenter', handleAddRCBtn, true)
}

function tryRMEvents () {
  document.removeEventListener('mouseenter', handleAddRCBtn, true)
}

function registerService() {
  registerOnPathChange(isCallTab, tryAddCallBtn)
  registerOnPathChange(isContactsListTab, tryAddContactsBtn, tryRMEvents)
  initHubSpotAPI()
  // Listen message from background.js to open app window when user click icon.
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action === 'openAppWindow') {
        popup()
      }
      sendResponse('ok')
    }
  )

  // Interact with RingCentral Embeddable Voice:
  window.addEventListener('message', (e) => {
    const data = e.data
    if (data) {
      switch (data.type) {
        case 'rc-call-end-notify':
          syncCallLogToHubspot(data.call)
          break
        default:
          break
      }
    }
  })
}

export default () => {
  var registered = false
  window.addEventListener('message', function (e) {
    const data = e.data
    if (data && data.type === 'rc-adapter-pushAdapterState' && registered === false) {
      registered = true
      registerService()
    }
  })
}

