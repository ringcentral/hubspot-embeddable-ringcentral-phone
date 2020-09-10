import _ from 'lodash'
import { jsonHeader, handleErr } from 'ringcentral-embeddable-extension-common/src/common/fetch'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import { sendMsgToRCIframe, formatPhone } from 'ringcentral-embeddable-extension-common/src/common/helpers'

export const callResultListKey = 'rc-call-result-list'
export function getCSRFToken () {
  return _.get(
    document.cookie.match(/hubspotapi-csrf=([^=;]+);/),
    '[1]'
  )
}

export function getPortalId () {
  let pid = _.get(
    document.cookie.match(/hubspgot\.hub\.id=([^=;]+);/),
    '[1]'
  )
  if (!pid) {
    pid = _.get(
      window.location.href.match(/https:\/\/app\.hubspot\.com\/[^/]+\/(\d+)/), '[1]'
    )
  }
  return pid
}
window.rc = {
  logSMSType: 'CALL',
  local: {
    accessToken: null
  },
  postMessage: sendMsgToRCIframe,
  currentUserId: '',
  rcLogined: false,
  cacheKey: 'contacts' + '_' + '',
  updateToken: async (newToken, type = 'accessToken') => {
    if (!newToken) {
      await ls.remove(type)
      rc.local = {
        accessToken: null
      }
    } else {
      rc.local[type] = newToken
      await ls.set(type, newToken)
    }
  }
}
export const rc = window.rc
export const commonFetchOptions = (headers) => ({
  headers: headers || {
    ...jsonHeader,
    'X-HubSpot-CSRF-hubspotapi': getCSRFToken()
  },
  handleErr: (res) => {
    let { status } = res
    if (status === 401) {
      rc.updateToken(null)
    }
    if (status > 304) {
      handleErr(res)
    }
  }
})

export function getIds (href = window.location.href) {
  let reg = /[^/]+\/(\d+)\/[^/]+\/(\d+)/
  let arr = href.match(reg) || []
  let portalId = arr[1]
  let vid = arr[2]
  if (!portalId || !vid) {
    return null
  }
  return {
    portalId,
    vid
  }
}

export function formatPhoneLocal (number) {
  return formatPhone(number, undefined)
}

export function delay (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function getEmail () {
  let emailDom = document.querySelector('.user-info-email')
  if (!emailDom) {
    return ''
  }
  return emailDom.textContent.trim()
}

export const autoLogPrefix = 'rc-auto-log-id:'

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
