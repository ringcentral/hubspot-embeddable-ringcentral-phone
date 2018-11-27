import {parseNumber} from 'libphonenumber-js'
import _ from 'lodash'
import {jsonHeader, handleErr} from'./fetch'
import RCLOGOSVG from './rc-logo'
import {formatNumber} from 'libphonenumber-js'

export const RCBTNCLS = 'call-with-ringccentral-btn'
export const RCBTNCLS2 = 'call-with-rc-btn'
export const RCTOOLTIPCLS = 'rc-tooltip'
export const RCLOADINGCLS = 'rc-loading-wrap'
export const lsKeys = {
  accessTokenLSKey: 'third-party-access-token',
  refreshTokenLSKey: 'third-party-refresh-token',
  expireTimeLSKey: 'third-party-expire-time'
}
export const host = getHost()
export const commonFetchOptions = (headers) => ({
  headers: headers || {
    Authorization: `Bearer ${window.rc.local.accessToken}`,
    ...jsonHeader
  },
  handleErr: (res) => {
    let {status} = res
    if (status === 401) {
      window.rc.updateToken(null)
    }
    if (status > 304) {
      handleErr(res)
    }
  }
})

const phoneFormat = 'National'

function getHost() {
  let {host, protocol} = location
  return `${protocol}//${host}`
}

export function formatPhone(phone) {
  return formatNumber(phone, phoneFormat)
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

export function createPhoneList(phoneNumbers, cls = 'rc-call-dds') {
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
  <div class="${cls}">
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
      ${createPhoneList(phoneNumbers)}
    </span>
  `
}

export function onClickPhoneNumber(e) {
  let {target} = e
  let p = findParentBySel(target, '.rc-call-dd')
  if (!p) {
    return
  }
  let n = p.querySelector('b').textContent.trim()
  callWithRingCentral(n)
}
