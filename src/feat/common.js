import _ from 'lodash'
import {jsonHeader, handleErr} from 'ringcentral-embeddable-extension-common/src/common/fetch'

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
