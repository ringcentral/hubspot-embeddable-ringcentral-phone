import {parseNumber} from 'libphonenumber-js'
import _ from 'lodash'
import RCLOGOSVG from './rc-logo'

export const RCBTNCLS = 'call-with-ringccentral-btn'
export const RCBTNCLS2 = 'call-with-rc-btn'
export const RCTOOLTIPCLS = 'rc-tooltip'

export function checkPhoneNumber(phone, country = 'US') {
  return !_.isEqual(
    {},
    parseNumber(phone, country)
  )
}

export function createElementFromHTML(htmlString) {
  var div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstChild
}

export function popup() {
  document.querySelector('#rc-widget-adapter-frame').contentWindow.postMessage({
    type: 'rc-adapter-syncMinimized',
    minimized: false
  }, '*')
  window.postMessage({
    type: 'rc-adapter-syncMinimized',
    minimized: false
  }, '*')
}

export function callWithRingCentral(phoneNumber, callAtOnce = true) {
  popup()
  document.querySelector('#rc-widget-adapter-frame').contentWindow.postMessage({
    type: 'rc-adapter-new-call',
    phoneNumber,
    toCall: callAtOnce
  }, '*')

}

let events = []
setInterval(() => {
  events.forEach(ev => {
    if (ev.checker(window.location.href)) {
      ev.callback()
    }
  })
}, 1000)

export function dirtyLoop(checker, callback) {
  events.push({
    checker, callback
  })
}

/**
 * find the target parentNode
 * @param {Node} node
 * @param {String} className
 * @return {Boolean}
 */
export function findParentBySel(node, sel) {
  if (!node) {
    return false
  }
  let parent = node
  if (!parent || !parent.matches) {
    return false
  }
  if (parent.matches(sel)) {
    return parent
  }
  let res = false
  while (parent !== document.body) {
    parent = parent.parentNode
    if (!parent || !parent.matches) {
      break
    }
    if (parent.matches(sel)) {
      res = parent
      break
    }
  }
  return res
}

export const createCallBtnHtml = (cls = '') => `
<span class="${RCBTNCLS} rc-mg1r ${cls}">
  <span class="rc-iblock rc-mg1r">Call with</span>
  <img src="${RCLOGOSVG}" class="rc-iblock" />
</span>
`
