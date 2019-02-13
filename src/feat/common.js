import _ from 'lodash'
import {jsonHeader, handleErr} from 'ringcentral-embeddable-extension-common/src/common/fetch'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'

export function getCSRFToken() {
  return _.get(
    document.cookie.match(/hubspotapi-csrf=([^=;]+);/),
    '[1]'
  )
}

export const lsKeys = {
  accessTokenLSKey: 'third-party-access-token',
  refreshTokenLSKey: 'third-party-refresh-token',
  expireTimeLSKey: 'third-party-expire-time'
}

export const rc = {
  local: {
    refreshToken: null,
    accessToken: null,
    expireTime: null
  },
  postMessage: data => {
    document.querySelector('#rc-widget-adapter-frame')
      .contentWindow
      .postMessage(data, '*')
  },
  currentUserId: '',
  rcLogined: false,
  cacheKey: 'contacts' + '_' + '',
  updateToken: async (newToken, type = 'apiKey') => {
    if (!newToken){
      await ls.clear()
      rc.local = {
        refreshToken: null,
        accessToken: null,
        expireTime: null
      }
    } else if (_.isString(newToken)) {
      rc.local[type] = newToken
      let key = lsKeys[`${type}LSKey`]
      await ls.set(key, newToken)
    } else {
      Object.assign(rc.local, newToken)
      let ext = Object.keys(newToken)
        .reduce((prev, key) => {
          prev[lsKeys[`${key}LSKey`]] = newToken[key]
          return prev
        }, {})
      await ls.set(ext)
    }
  }
}

export const commonFetchOptions = (headers) => ({
  headers: headers || {
    Authorization: `Bearer ${rc.local.accessToken}`,
    ...jsonHeader
  },
  handleErr: (res) => {
    let {status} = res
    if (status === 401) {
      rc.updateToken(null)
    }
    if (status > 304) {
      handleErr(res)
    }
  }
})
