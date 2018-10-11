import {parseNumber} from 'libphonenumber-js'
import _ from 'lodash'
import RCLOGOSVG from './rc-logo'

export const RCBTNCLS = 'call-with-ringccentral-btn'
export const RCBTNCLS2 = 'call-with-rc-btn'
export const RCTOOLTIPCLS = 'rc-tooltip'


export function getHost() {
  let {host, protocol} = location
  return `${protocol}//${host}`
}

export function getCSRFToken() {
  return _.get(
    document.cookie.match(/hubspotapi-csrf=([^=;]+);/),
    '[1]'
  )
}

let msgHandler1
let msgHandler2
export function notify(msg, type = 'info', timer = 5000) {
  clearTimeout(msgHandler1)
  clearTimeout(msgHandler2)
  let wrap = document.getElementById('rc-msg-wrap')
  if (wrap) {
    wrap.remove()
  }
  wrap = createElementFromHTML(
    `
      <div class="rc-msg-wrap animate rc-msg-type-${type}" id="rc-msg-wrap">
        ${msg}
      </div>
    `
  )
  document.body.appendChild(wrap)
  msgHandler1 = setTimeout(() => {
    wrap.classList.add('rc-msg-enter')
  }, 200)
  msgHandler2 = setTimeout(() => {
    wrap.classList.remove('rc-msg-enter')
  }, timer)
}

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

function createDropdown(phoneNumbers) {
  if (!phoneNumbers || phoneNumbers.length < 2) {
    return ''
  }
  let dds = phoneNumbers.reduce((prev, obj) => {
    let {
      number,
      title
    } = obj
    return prev +
    `
    <div class="rc-call-dd">
      <span>${title}:</span>
      <b>${number}</b>
    </div>
    `
  }, '')
  return `
  <div class="rc-call-dds">
    ${dds}
  </div>
  `
}

export const createCallBtnHtml = (cls = '', phoneNumbers) => {
  let cls2 = phoneNumbers && phoneNumbers.length > 1
    ? 'rc-has-dd'
    : ''
  return `
    <span class="${RCBTNCLS} rc-mg1r ${cls} ${cls2}">
      <span class="rc-iblock rc-mg1r">Call with</span>
      <img src="${RCLOGOSVG}" class="rc-iblock" />
      ${createDropdown(phoneNumbers)}
    </span>
  `
}

