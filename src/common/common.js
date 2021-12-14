import _ from 'lodash'
import { sendMsgToRCIframe, formatPhone } from 'ringcentral-embeddable-extension-common/src/common/helpers'

import {
  parsePhoneNumberFromString
} from 'libphonenumber-js'

export const callResultListKey = 'rc-call-result-list'

export function getPortalId () {
  let pid = _.get(
    document.cookie.match(/hubspot\.hub\.id=([^=;]+);/),
    '[1]'
  )
  if (!pid) {
    pid = _.get(
      window.location.href.match(/https:\/\/app([-\w\d]+)?\.hubspot\.com\/[^/]+\/(\d+)/), '[2]'
    )
  }
  return pid
}
window.rc = {
  local: {
    accessToken: 1
  },
  postMessage: sendMsgToRCIframe,
  currentUserId: '',
  rcLogined: false
}
export const rc = window.rc

export function getIds (href = window.location.href) {
  const reg = /[^/]+\/(\d+)(\/[^/]+\/(\d+))?/
  const arr = href.match(reg) || []
  const portalId = arr[1]
  const vid = arr[3]
  if (!portalId && !vid) {
    return null
  }
  return {
    portalId,
    vid
  }
}
export const autoLogPrefix = 'rc-auto-log-id:'
export function formatPhoneLocal (number) {
  return formatPhone(number, undefined)
}

export function delay (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function getEmail () {
  const emailDom = document.querySelector('.user-info-email')
  if (!emailDom) {
    return ''
  }
  return emailDom.textContent.trim()
}

export function getFullNumber (numberObj) {
  if (!numberObj) {
    return ''
  } else if (_.isString(numberObj)) {
    return numberObj
  }
  const {
    extensionNumber,
    phoneNumber = ''
  } = numberObj
  return phoneNumber +
    (extensionNumber ? '#' + extensionNumber : '')
}

export function format164 (
  phone = '',
  country = window.rc.countryCode || 'US'
) {
  const res = parsePhoneNumberFromString(phone, country)
  if (!res) {
    return false
  }
  return res.number + (res.ext ? '#' + res.ext : '')
}

export const START_CHECK_CALL_LOG = 'rc-start-call-log'
