/**
 * auth related feature
 */

import { rc } from './common'

let tokenHandler

export function hideAuthBtn () {
  let dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.add('rc-hide-to-side')
}

export function showAuthBtn () {
  window.postMessage({
    type: 'rc-show-auth-panel'
  }, '*')
}

export function doAuth () {
  if (rc.local.accessToken) {
    return
  }
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
