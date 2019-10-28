/**
 * auth related feature
 */

import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import logo from 'ringcentral-embeddable-extension-common/src/common/rc-logo'
import {
  createElementFromHTML,
  findParentBySel
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { rc } from './common'

let tokenHandler
let {
  serviceName
} = thirdPartyConfigs

export function hideAuthBtn () {
  let dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.add('rc-hide-to-side')
}

export function showAuthBtn () {
  let dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.remove('rc-hide-to-side')
}

function handleAuthClick (e) {
  let { target } = e
  let { classList } = target
  if (findParentBySel(target, '.rc-auth-btn')) {
    doAuth()
  } else if (classList.contains('rc-dismiss-auth')) {
    hideAuthBtn()
  }
}

export function doAuth () {
  if (rc.local.accessToken) {
    return
  }
  hideAuthBtn()
  notifyRCAuthed()
  rc.updateToken('authed')
}

export function notifyRCAuthed (authorized = true) {
  rc.postMessage({
    type: 'rc-adapter-update-authorization-status',
    authorized
  })
}

export async function unAuth () {
  await rc.updateToken(null)
  clearTimeout(tokenHandler)
  notifyRCAuthed(false)
}

export function renderAuthButton () {
  let btn = createElementFromHTML(
    `
      <div class="rc-auth-button-wrap animate rc-hide-to-side">
        <span class="rc-auth-btn">
          <span class="rc-iblock">Auth</span>
          <img class="rc-iblock" src="${logo}" />
          <span class="rc-iblock">access ${serviceName} data</span>
        </span>
        <div class="rc-auth-desc rc-pd1t">
          After auth, you can access ${serviceName} contacts from RingCentral phone's contacts list. You can revoke access from RingCentral phone's setting.
        </div>
        <div class="rc-pd1t">
          <span class="rc-dismiss-auth" title="dismiss">&times;</span>
        </div>
      </div>
    `
  )
  btn.onclick = handleAuthClick
  if (
    !document.querySelector('.rc-auth-button-wrap')
  ) {
    document.body.appendChild(btn)
  }
}
