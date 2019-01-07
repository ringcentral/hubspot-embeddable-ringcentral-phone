/**
 * auth related feature
 */

import {thirdPartyConfigs} from 'ringcentral-embeddable-extension-common/src/common/app-config'
import logo from 'ringcentral-embeddable-extension-common/src/common/rc-logo'
import {
  createElementFromHTML,
  findParentBySel,
  lsKeys
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import _ from 'lodash'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'

const blankUrl = 'about:blank'
let tokenHandler
let {
  serviceName,
  appServerHS,
  clientIDHS,
  appRedirectHS,
  apiServerHS,
  clientSecretHS
} = thirdPartyConfigs
const appRedirectHSCoded = encodeURIComponent(appRedirectHS)
const authUrl = `${appServerHS}/oauth/authorize?` +
`client_id=${clientIDHS}` +
`&redirect_uri=${appRedirectHSCoded}&scope=contacts`

window.rc = {
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
      window.rc.local = {
        refreshToken: null,
        accessToken: null,
        expireTime: null
      }
    } else if (_.isString(newToken)) {
      window.rc.local[type] = newToken
      let key = lsKeys[`${type}LSKey`]
      await ls.set(key, newToken)
    } else {
      Object.assign(window.rc.local, newToken)
      let ext = Object.keys(newToken)
        .reduce((prev, key) => {
          prev[lsKeys[`${key}LSKey`]] = newToken[key]
          return prev
        }, {})
      await ls.set(ext)
    }
  }
}

export function hideAuthBtn() {
  let dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.add('rc-hide-to-side')
}

export function showAuthBtn() {
  let dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.remove('rc-hide-to-side')
}

function handleAuthClick(e) {
  let {target} = e
  let {classList}= target
  if (findParentBySel(target, '.rc-auth-btn')) {
    doAuth()
  } else if (classList.contains('rc-dismiss-auth')) {
    hideAuthBtn()
  }
}

export function hideAuthPanel() {
  let frameWrap = document.getElementById('rc-auth-hs')
  let frame = document.getElementById('rc-auth-hs-frame')
  if (frame) {
    frame.src = blankUrl
  }
  frameWrap && frameWrap.classList.add('rc-hide-to-side')
}

export function doAuth() {
  if (window.rc.local.accessToken) {
    return
  }
  hideAuthBtn()
  let frameWrap = document.getElementById('rc-auth-hs')
  let frame = document.getElementById('rc-auth-hs-frame')
  if (frame) {
    frame.src = authUrl
  }
  frameWrap && frameWrap.classList.remove('rc-hide-to-side')
}

export function notifyRCAuthed(authorized = true) {
  window.rc.postMessage({
    type: 'rc-adapter-update-authorization-status',
    authorized
  })
}

export function getRefreshToken() {
  getAuthToken({
    refresh_token: window.rc.local.refreshToken
  })
}

export async function getAuthToken({
  code,
  refresh_token
}) {
  let url = `${apiServerHS}/oauth/v1/token`
  let data = (
    code
      ? 'grant_type=authorization_code'
      : 'grant_type=refresh_token'
  ) +
  `&client_id=${clientIDHS}&` +
  `client_secret=${clientSecretHS}&` +
  `redirect_uri=${appRedirectHSCoded}&` +
    (
      code
        ? `code=${code}`
        : `refresh_token=${refresh_token}`
    )

  let res = await fetch.post(url, data, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    body: data
  })

  /**
{
  "access_token": "xxxx",
  "refresh_token": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
  "expires_in": 21600
}
   */
  if (!res || !res.access_token) {
    console.log('get token failed')
    console.log(res)
  } else {
    let expireTime = res.expires_in * .8 + (+new Date)
    await window.rc.updateToken({
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      expireTime: expireTime
    })
    notifyRCAuthed()
    tokenHandler = setTimeout(
      getRefreshToken,
      Math.floor(res.expires_in * .8)
    )
  }
}

export async function unAuth() {
  await window.rc.updateToken(null)
  clearTimeout(tokenHandler)
  notifyRCAuthed(false)
}

export function renderAuthButton() {
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

export function renderAuthPanel() {
  let pop = createElementFromHTML(
    `
    <div id="rc-auth-hs" class="animate rc-auth-wrap rc-hide-to-side" draggable="false">
      <div class="rc-auth-frame-box">
        <iframe class="rc-auth-frame" sandbox="allow-same-origin allow-scripts allow-forms allow-popups" allow="microphone" src="${blankUrl}" id="rc-auth-hs-frame">
        </iframe>
      </div>
    </div>
    `
  )
  if (
    !document.getElementById('rc-auth-hs')
  ) {
    document.body.appendChild(pop)
  }
}
