import _ from 'lodash'
import { jsonHeader, handleErr } from 'ringcentral-embeddable-extension-common/src/common/fetch'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import { sendMsgToRCIframe, formatPhone } from 'ringcentral-embeddable-extension-common/src/common/helpers'

export function getCSRFToken () {
  return _.get(
    document.cookie.match(/hubspotapi-csrf=([^=;]+);/),
    '[1]'
  )
}

export function getPortalId () {
  return _.get(
    document.cookie.match(/hubspot\.hub\.id=([^=;]+);/),
    '[1]'
  )
}

export const rc = {
  local: {
    accessToken: null
  },
  postMessage: sendMsgToRCIframe,
  currentUserId: '',
  rcLogined: false,
  cacheKey: 'contacts' + '_' + '',
  updateToken: async (newToken, type = 'accessToken') => {
    if (!newToken) {
      await ls.clear()
      rc.local = {
        accessToken: null
      }
    } else {
      rc.local[type] = newToken
      await ls.set(type, newToken)
    }
  }
}

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
  let reg = /contacts\/(\d+)\/(contact|deal|company)\/(\d+)/
  let arr = href.match(reg) || []
  let portalId = arr[1]
  let vid = arr[3]
  if (!portalId || !vid) {
    return null
  }
  return {
    portalId,
    vid
  }
}

export function formatPhoneLocal (number) {
  return formatPhone(number, undefined, 'formatNational')
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
