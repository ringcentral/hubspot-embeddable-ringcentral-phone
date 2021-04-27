/**
 * common cross domain request with cookie
 */

import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import { ringCentralConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'

const {
  authServer
} = ringCentralConfigs

export default (path, data) => {
  const url = `${authServer}${path}`
  return fetch.post(url, data, {
    credentials: 'include'
  })
}
