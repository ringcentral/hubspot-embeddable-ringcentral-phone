/**
 * handle login event
 */

import { ringCentralConfigs, appVersion } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import { rc, getPortalId } from './common'

const {
  clientID,
  appServer,
  authServer,
  installUrl
} = ringCentralConfigs

const params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=500,height=528,right=20,bottom=20'

export function onTriggerLogin (data) {
  const pid = getPortalId()
  const authUrl = authServer + '/rc-ext-oauth'
  console.log('pid', pid)
  window.open(`${appServer}/restapi/oauth/authorize?redirect_uri=${authUrl}&client_id=${clientID}&response_type=code&state=pid:${pid}:ver:${appVersion}&brand_id=&display=&prompt=`, '_blank', params)
}

export function onLoginCallback ({ callbackUri }) {
  rc.postMessage({
    type: 'rc-adapter-authorization-code',
    callbackUri
  })
}

export function install () {
  window.open(installUrl, '_blank', params)
}
