/**
 * common cross domain request with cookie
 */

import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import { ringCentralConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import _ from 'lodash'
import logout from './logout'

const {
  authServer
} = ringCentralConfigs

export default (path, data) => {
  const url = `${authServer}${path}`
  return fetch.post(url, data, {
    credentials: 'include',
    handleErr: async (res) => {
      console.log(res)
      const text = _.isFunction(res.text)
        ? await res.text()
        : _.isPlainObject(res) ? JSON.stringify(res) : res
      if (text.includes('invalid token')) {
        console.log('token invalid, should relogin')
        logout()
      }
    }
  })
}
