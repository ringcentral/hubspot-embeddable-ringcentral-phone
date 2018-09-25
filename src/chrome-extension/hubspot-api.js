/**
 * hubspot api related
 */

import {formatNumber} from 'libphonenumber-js'
import {HSConfig} from './custom-app-config'
import * as ls from './ls'
import {
  createElementFromHTML,
  findParentBySel,
  callWithRingCentral
} from './helpers'
import fetch, {jsonHeader, handleErr} from '../common/fetch'
import _ from 'lodash'
import logo from './rc-logo'
window.localStorage.setItem('sfd', 'sdfsdf')
let {
  appKeyHS,
  appSecretHS,
  appServerHS,
  apiServerHS,
  appRedirectHS
} = HSConfig

let lsKeys = {
  accessTokenLSKey: 'third-party-access-token',
  refreshTokenLSKey: 'third-party-refresh-token',
  expireTimeLSKey: 'third-party-expire-time'
}
let local = {
  refreshToken: null,
  accessToken: null,
  expireTime: null
}

let rcLogined = false
let tokenHandler
let cache = {}
let cacheKey = 'contacts'
const phoneFormat = 'National'
const cacheTime = 10 * 1000 //10 seconds cache

const appRedirectHSCoded = encodeURIComponent(appRedirectHS)
const authUrl = `${appServerHS}/oauth/authorize?` +
`client_id=${appKeyHS}` +
`&redirect_uri=${appRedirectHSCoded}&scope=contacts`
const blankUrl = 'about:blank'
const serviceName = 'HubSpot'

async function updateToken(newToken, type = 'accessToken') {
  if (!newToken){
    await ls.remove(_.values(lsKeys))
  } else if (_.isString(newToken)) {
    local[type] = newToken
    let key = lsKeys[`${type}LSKey`]
    await ls.set(key, newToken)
  } else {
    Object.assign(local, newToken)
    await ls.set(newToken)
  }
}

function formatPhone(phone) {
  return formatNumber(phone, phoneFormat)
}

function hideContactInfoPanel() {
  let dom = document
    .querySelector('.rc-contact-panel')
  dom && dom.classList.add('rc-hide-contact-panel')
}

/**
 * click contact info panel event handler
 * @param {Event} e
 */
function onClickContactPanel (e) {
  let {target} = e
  let {classList} = target
  if (classList.contains('rc-close-contact')) {
    document
      .querySelector('.rc-contact-panel')
      .classList.add('rc-hide-contact-panel')
  } else if (
    classList.contains('rc-phone-span')
  ) {
    callWithRingCentral(
      (target.textContent || '').trim()
    )
  }
}

/**
 * show caller/callee info
 * @param {Object} call
 */
async function showContactInfoPanel(call) {
  if (call.telephonyStatus === 'NoCall') {
    return
  }
  let isInbound = call.direction === 'Inbound'
  let phone = isInbound
    ? _.get(
      call,
      'from.phoneNumber'
    )
    : _.get(call, 'to.phoneNumber')
  if (!phone) {
    return
  }
  phone = formatPhone(phone)
  let contacts = await getContacts()
  let contact = _.find(contacts, c => {
    return _.find(c.phoneNumbers, p => {
      return formatPhone(p.phoneNumber) === phone
    })
  })
  if (!contact) {
    return
  }
  let title = isInbound
    ? 'Inbound call from:'
    : 'Calling contact:'
  let {
    name,
    phoneNumbers
  } = contact
  let phoneNumbersText = phoneNumbers.map(
    p => {
      return `
        <span class="rc-phone-span">
          ${p.phoneNumber}
        </span>
      `
    }
  )
    .join(', ')
  let elem = createElementFromHTML(
    `<div class="rc-contact-panel animate rc-hide-contact-panel">
      <div class="rc-pd2">
        <div class="rc-contact-header rc-pd1y">
          <span title="close" class="rc-close-contact">
          &times
          </span>
        </div>
        <h2>${title}</h2>
        <div class="rc-contact-body">
          <div class="rc-item-label">
            name:
          </div>
          <div class="rc-item-value">
            ${name}
          </div>
          <div class="rc-item-label">
          phone:
        </div>
        <div class="rc-item-value">
          ${phoneNumbersText}
        </div>
      </div>
    </div>
    `
  )
  elem.onclick = onClickContactPanel
  let old = document
    .querySelector('.rc-contact-panel')
  old && old.remove()

  document.body.appendChild(elem)
  elem.classList.remove('rc-hide-contact-panel')
}

/**
 * build name from contact info
 * @param {object} contact
 * @return {string}
 */
function buildName(contact) {
  let firstname = _.get(
    contact,
    'properties.firstname.value'
  ) || 'noname'
  let lastname = _.get(
    contact,
    'properties.firstname.value'
  ) || 'noname'
  return firstname + ' ' + lastname
}

/**
 * build phone numbers from contact info
 * @param {object} contact
 * @return {array}
 */
function buildPhone(contact) {
  let phoneNumber = _.get(contact, 'properties.phone.value')
  return phoneNumber
    ? [
      {
        phoneNumber,
        phoneType: 'directPhone'
      }
    ]
    : []
}

/**
 * search contacts by number match
 * @param {array} contacts
 * @param {string} keyword
 */
function findMatchContacts(contacts, numbers) {
  let {formatedNumbers, formatNumbersMap} = numbers.reduce((prev, n) => {
    let nn = formatPhone(n)
    prev.formatedNumbers.push(nn)
    prev.formatNumbersMap[nn] = n
    return prev
  }, {
    formatedNumbers: [],
    formatNumbersMap: {}
  })
  let res = contacts.filter(contact => {
    let {
      phoneNumbers
    } = contact
    return _.find(phoneNumbers, n => {
      return formatedNumbers
        .includes(
          formatPhone(n.phoneNumber)
        )
    })
  })
  return res.reduce((prev, it) => {
    let phone = _.find(it.phoneNumbers, n => {
      return formatedNumbers.includes(
        formatPhone(n.phoneNumber)
      )
    })
    let num = phone.phoneNumber
    let key = formatNumbersMap[
      formatPhone(num)
    ]
    console.log(key, 'key')
    if (!prev[key]) {
      prev[key] = []
    }
    let res = {
      entityType: it.type,
      name: it.name,
      phoneNumbers: it.phoneNumbers
    }
    prev[key].push(res)
    return prev
  }, {})
}


/**
 * search contacts by keyword
 * @param {array} contacts
 * @param {string} keyword
 */
function searchContacts(contacts, keyword) {
  return contacts.filter(contact => {
    let {
      name,
      phoneNumbers
    } = contact
    return name.includes(keyword) ||
      _.find(phoneNumbers, n => {
        return n.phoneNumber.includes(keyword)
      })
  })
}

/**
 * convert hubspot contacts to ringcentral contacts
 * @param {array} contacts
 * @return {array}
 */
function formatContacts(contacts) {
  return contacts.map(contact => {
    return {
      id: contact.vid,
      name: buildName(contact),
      type: 'HubSpot',
      phoneNumbers: buildPhone(contact)
    }
  })
}
/**
 * get contact list, one single time
 */
async function getContact(
  vidOffset = 0,
  count = 100
) {
  //https://api.hubapi.com/contacts/v1/lists/all/contacts/all
  let url =`${apiServerHS}/contacts/v1/lists/all/contacts/all?count=${count}&vidOffset=${vidOffset}&property=firstname&property=phone&property=lastname`
  let res = await fetch.get(url, {
    headers: {
      Authorization: `Bearer ${local.accessToken}`,
      ...jsonHeader
    },
    handleErr: (res) => {
      let {status} = res
      if (status === 401) {
        return {
          error: 'unauthed'
        }
      } else if (status > 304) {
        handleErr(res)
      }
    }
  })
  if (res && res.error === 'unauthed') {
    await updateToken(null)
  }
  if (res && res.contacts) {
    return res
  } else {
    console.log('fetch contacts error')
    console.log(res)
    return {
      contacts: [],
      'has-more': false,
      'vid-offset': vidOffset
    }
  }
}

/**
 * get all contacts
 */
async function getContacts() {
  if (!rcLogined) {
    return []
  }
  if (!local.accessToken) {
    showAuthBtn()
    return []
  }
  let now = + new Date()
  let cacheLastTime = _.get(cache, `${cacheKey}.time`)
  if (cacheLastTime && now - cacheLastTime < cacheTime) {
    console.log('return cache')
    return cache[cacheKey].value
  }
  let contacts = []
  let res = await getContact()
  contacts = [
    ...contacts,
    ...res.contacts
  ]
  while (res['has-more']) {
    res = await getContact(res['vid-offset'])
    contacts = [
      ...contacts,
      ...res.contacts
    ]
  }
  let final = formatContacts(contacts)
  cache[cacheKey] = {
    time: + new Date(),
    value: final
  }
  return final
}

function getRefreshToken() {
  getAuthToken({
    refresh_token: local.refreshToken
  })
}

function notifyRCAuthed(authorized = true) {
  document
    .querySelector('#rc-widget-adapter-frame')
    .contentWindow
    .postMessage({
      type: 'rc-adapter-update-authorization-status',
      authorized
    }, '*')
}

async function getAuthToken({
  code,
  refresh_token
}) {
  let url = `${apiServerHS}/oauth/v1/token`
  let data = (
    code
      ? 'grant_type=authorization_code'
      : 'grant_type=refresh_token'
  ) +
  `&client_id=${appKeyHS}&` +
  `client_secret=${appSecretHS}&` +
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
    await updateToken({
      [lsKeys.accessTokenLSKey]: res.access_token,
      [lsKeys.refreshTokenLSKey]: res.refresh_token,
      [lsKeys.expireTimeLSKey]: expireTime
    })
    notifyRCAuthed()
    tokenHandler = setTimeout(
      getRefreshToken,
      Math.floor(res.expires_in * .8)
    )
  }
}

async function unAuth() {
  await updateToken(null)
  clearTimeout(tokenHandler)
  notifyRCAuthed(false)
}

function doAuth() {
  if (local.accessToken) {
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

function hideAuthPanel() {
  let frameWrap = document.getElementById('rc-auth-hs')
  let frame = document.getElementById('rc-auth-hs-frame')
  if (frame) {
    frame.src = blankUrl
  }
  frameWrap && frameWrap.classList.add('rc-hide-to-side')
}

function hideAuthBtn() {
  let dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.add('rc-hide-to-side')
}

function showAuthBtn() {
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

function renderAuthButton() {
  let btn = createElementFromHTML(
    `
      <div class="rc-auth-button-wrap animate rc-hide-to-side">
        <span class="rc-auth-btn">
          <span class="rc-iblock">Auth</span>
          <img class="rc-iblock" src="${logo}" />
          <span class="rc-iblock">access HubSpot data</span>
        </span>
        <div class="rc-auth-desc rc-pd1t">
          After auth, you can access hubspot contacts from RingCentral phone's contacts list.
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

function renderAuthPanel() {
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

/**
 * handle ringcentral widgets contacts list events
 * @param {Event} e
 */
async function handleRCEvents(e) {
  let {data} = e
  console.log('======data======')
  console.log(data, data.type, data.path)
  console.log('======data======')
  if (!data) {
    return
  }
  let {type, loggedIn, path, call} = data
  if (type ===  'rc-login-status-notify') {
    console.log('rc logined', loggedIn)
    rcLogined = loggedIn
  }
  if (
    type === 'rc-route-changed-notify' &&
    path === '/contacts' &&
    !local.accessToken
  ) {
    showAuthBtn()
  } else if (
    type === 'rc-active-call-notify' ||
    type === 'rc-call-start-notify'
  ) {
    showContactInfoPanel(call)
  } else if ('rc-call-end-notify' === type) {
    hideContactInfoPanel()
  }
  if (type !== 'rc-post-message-request') {
    return
  }
  let rc = document.querySelector('#rc-widget-adapter-frame').contentWindow

  if (data.path === '/authorize') {
    if (local.accessToken) {
      unAuth()
    } else {
      doAuth()
    }
    rc.postMessage({
      type: 'rc-post-message-response',
      responseId: data.requestId,
      response: { data: 'ok' }
    }, '*')
  }
  else if (path === '/contacts') {
    let contacts = await getContacts()
    rc.postMessage({
      type: 'rc-post-message-response',
      responseId: data.requestId,
      response: {
        data: contacts,
        nextPage: null
      }
    }, '*')
  }
  else if (path === '/contacts/search') {
    let contacts = await getContacts()
    let keyword = _.get(data, 'body.searchString')
    if (keyword) {
      contacts = searchContacts(contacts, keyword)
    }
    rc.postMessage({
      type: 'rc-post-message-response',
      responseId: data.requestId,
      response: {
        data: contacts
      }
    }, '*')
  }
  else if (path === '/contacts/match') {
    let contacts = await getContacts()
    let phoneNumbers = _.get(data, 'body.phoneNumbers') || []
    let res = findMatchContacts(contacts, phoneNumbers)
    console.log('matches', res)
    rc.postMessage({
      type: 'rc-post-message-response',
      responseId: data.requestId,
      response: {
        data: res
      }
    }, '*')
  }
}

/**
 * init auth event, dom render etc
 */
let authEventInited = false
export async function initHubSpotAPI() {
  if (authEventInited) {
    return
  }
  authEventInited = true
  //hanlde contacts events
  window.addEventListener('message', handleRCEvents)
  let refreshToken = await ls.get(lsKeys.refreshTokenLSKey) || null
  let accessToken = await ls.get(lsKeys.accessTokenLSKey) || null
  let expireTime = await ls.get(lsKeys.expireTimeLSKey) || null
  if (expireTime && expireTime < (+new Date())) {
    local = {
      refreshToken,
      accessToken
    }
  }

  //get the html ready
  renderAuthPanel()
  renderAuthButton()

  if (local.refreshToken) {
    notifyRCAuthed()
    getRefreshToken()
  }

  //wait for auth token
  window.addEventListener('message', function (e) {
    const data = e.data
    if (data && data.hsAuthCode) {
      getAuthToken({
        code: data.hsAuthCode
      })
      hideAuthPanel()
      hideAuthBtn()
    }
  })

  let rcFrame = document.querySelector('#rc-widget-adapter-frame')
  if (!rcFrame || !rcFrame.contentWindow) {
    return
  }

  //register service to rc-widgets
  rcFrame
    .contentWindow.postMessage({
      type: 'rc-adapter-register-third-party-service',
      service: {
        name: serviceName,
        contactsPath: '/contacts',
        contactSearchPath: '/contacts/search',
        contactMatchPath: '/contacts/match',
        authorizationPath: '/authorize',
        authorizedTitle: 'Unauthorize',
        unauthorizedTitle: 'Authorize',
        authorized: false
      }
    }, '*')

}

