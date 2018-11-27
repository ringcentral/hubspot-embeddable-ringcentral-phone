/**
 * third party api
 * you can do things like:
 * 1. sync thirdparty contacts to ringcentral contact list
 * 2. when calling or call inbound, show caller/callee info panel
 * 3. sync call log to third party system
 *
 * example script: https://github.com/zxdong262/hubspot-embeddable-ringcentral-phone/blob/master/src/chrome-extension/third-party-api.js
 */

import {thirdPartyConfigs} from '../common/app-config'
import {
  showAuthBtn,
  unAuth,
  doAuth,
  getRefreshToken,
  renderAuthButton,
  notifyRCAuthed,
  hideAuthPanel,
  hideAuthBtn,
  renderAuthPanel,
  getAuthToken
} from './auth'
import * as ls from '../common/ls'
import _ from 'lodash'
import {
  findMatchContacts,
  searchContacts,
  getContacts,
  hideContactInfoPanel,
  showContactInfoPanel
} from './contacts'
import {showActivityDetail, getActivities} from './activities'
import {syncCallLogToThirdParty} from './call-log-sync'
import {getUserId} from '../config'
import {lsKeys} from '../common/helpers'


let {
  serviceName
} = thirdPartyConfigs

let authEventInited = false

/**
 * handle ringcentral widgets contacts list events
 * @param {Event} e
 */
async function handleRCEvents(e) {
  let {data} = e
  if (!data) {
    return
  }
  let {type, loggedIn, path, call} = data
  if (type ===  'rc-login-status-notify') {
    console.log('rc logined', loggedIn)
    window.rc.rcLogined = loggedIn
  }
  if (
    type === 'rc-route-changed-notify' &&
    path === '/contacts' &&
    !window.rc.local.accessToken
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

  let {rc} = window

  if (data.path === '/authorize') {
    if (rc.local.accessToken) {
      unAuth()
    } else {
      doAuth()
    }
    rc.postMessage({
      type: 'rc-post-message-response',
      responseId: data.requestId,
      response: { data: 'ok' }
    })
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
    rc.postMessage({
      type: 'rc-post-message-response',
      responseId: data.requestId,
      response: {
        data: res
      }
    })
  }
  else if (path === '/callLogger') {
    // add your codes here to log call to your service
    syncCallLogToThirdParty(data.body)
    // response to widget
    rc.postMessage({
      type: 'rc-post-message-response',
      responseId: data.requestId,
      response: { data: 'ok' }
    })
  }
  else if (path === '/activities') {
    const activities = await getActivities(data.body)
    /*
    [
      {
        id: '123',
        subject: 'Title',
        time: 1528854702472
      }
    ]
    */
    // response to widget
    rc.postMessage({
      type: 'rc-post-message-response',
      responseId: data.requestId,
      response: { data: activities }
    })
  }
  else if (path === '/activity') {
    // response to widget
    showActivityDetail(data.body)
    rc.postMessage({
      type: 'rc-post-message-response',
      responseId: data.requestId,
      response: { data: 'ok' }
    })
  }
}


export default async function initThirdPartyApi () {
  if (authEventInited) {
    return
  }
  authEventInited = true

  //register service to rc-widgets

  window.rc.postMessage({
    type: 'rc-adapter-register-third-party-service',
    service: {
      name: serviceName,
      contactsPath: '/contacts',
      contactSearchPath: '/contacts/search',
      contactMatchPath: '/contacts/match',
      authorizationPath: '/authorize',
      authorizedTitle: 'Unauthorize',
      unauthorizedTitle: 'Authorize',
      callLoggerPath: '/callLogger',
      callLoggerTitle: `Log to ${serviceName}`,
      activitiesPath: '/activities',
      activityPath: '/activity',
      authorized: false
    }
  })

  //hanlde contacts events
  let userId = getUserId()
  window.rc.currentUserId = userId
  window.rc.cacheKey = 'contacts' + '_' + userId,
  window.addEventListener('message', handleRCEvents)
  let refreshToken = await ls.get(lsKeys.refreshTokenLSKey) || null
  let accessToken = await ls.get(lsKeys.accessTokenLSKey) || null
  let expireTime = await ls.get(lsKeys.expireTimeLSKey) || null
  if (expireTime && expireTime > (+new Date())) {
    window.rc.local = {
      refreshToken,
      accessToken,
      expireTime
    }
  }

  //get the html ready
  renderAuthPanel()
  renderAuthButton()

  if (window.rc.local.refreshToken) {
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

}

