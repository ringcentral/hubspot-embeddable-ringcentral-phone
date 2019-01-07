/**
 * content config file
 * with proper config,
 * insert `call with ringcentral` button
 * or hover some elemet show call button tooltip
 * or convert phone number text to click-to-call link
 *
 */

///*
import _ from 'lodash'
import {
  RCBTNCLS2,
  checkPhoneNumber
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import {thirdPartyConfigs} from 'ringcentral-embeddable-extension-common/src/common/app-config'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import fetch, {jsonHeader} from 'ringcentral-embeddable-extension-common/src/common/fetch'
import {getCSRFToken} from './feat/common'
import {lsKeys} from './feat/common'
import {
  showActivityDetail,
  getActivities
} from './feat/activities'
import {
  hideAuthBtn,
  showAuthBtn,
  hideAuthPanel,
  doAuth,
  notifyRCAuthed,
  getRefreshToken,
  getAuthToken,
  unAuth,
  renderAuthButton,
  renderAuthPanel
} from './feat/auth'
import {
  syncCallLogToThirdParty
} from './feat/call-log-sync.js'
import {
  findMatchContacts,
  searchContacts,
  getContacts,
  hideContactInfoPanel,
  showContactInfoPanel
} from './feat/contacts.js'
//*/
let {
  apiServerHS
} = thirdPartyConfigs

let phoneTypeDict = {
  phone: 'phone number',
  company: 'company phone number',
  mobilephone: 'mobile phone number'
}


function formatNumbers(res) {
  return Object.keys(res).reduce((prev, k) => {
    let v = res[k]
    if (!v) {
      return prev
    }
    return [
      ...prev,
      {
        id: k,
        title: phoneTypeDict[k],
        number: v.formattedNumber
      }
    ]
  }, [])
    .filter(o => checkPhoneNumber(o.number))
}

function getIds(href = location.href) {
  let reg = /contacts\/(\d+)\/contact\/(\d+)/
  let arr = href.match(reg) || []
  let portalId = arr[1]
  let vid = arr[2]
  if (!portalId || !vid) {
    return null
  }
  return {
    portalId,
    vid
  }
}

async function getNumbers(ids = getIds()) {
  if (!ids) {
    return []
  }
  let {
    portalId,
    vid
  } = ids
  let url = `${apiServerHS}/twilio/v1/phonenumberinfo/contactPhoneNumbersByProperty?portalId=${portalId}&clienttimeout=14000&contactVid=${vid}`
  let csrf = getCSRFToken()
  let res = await fetch.get(url, {
    headers: {
      ...jsonHeader,
      'x-hubspot-csrf-hubspotapi': csrf
    }
  })
  return res ? formatNumbers(res) : []
}

export function getUserId() {
  let emailDom = document.querySelector('.user-info-email')
  if (!emailDom) {
    return ''
  }
  let email = emailDom.textContent.trim()
  return email
}

export const insertClickToCallButton = [
  {
    shouldAct: href => {
      return href.includes('?interaction=call')
    },
    getContactPhoneNumbers: getNumbers,
    parentsToInsertButton: [
      {
        getElem: () => {
          return document.querySelector('.start-call').parentNode
        },
        insertMethod: 'insertBefore',
        shouldInsert: () => {
          return !document.querySelector('.' + RCBTNCLS2)
        }
      },
      {
        getElem: () => {
          return document
            .querySelector('.panel-is-call button [data-key="twilio.notEnabled.skipOnboarding"]')
            .parentNode.parentNode
        },
        insertMethod: 'insertBefore',
        shouldInsert: () => {
          return !document.querySelector('.' + RCBTNCLS2)
        }
      }
    ]
  }
]

//hover contact node to show click to dial tooltip
export const hoverShowClickToCallButton = [
  {
    shouldAct: href => {
      return href.includes('contacts/list/') || href.includes('contacts/view/all/')
    },
    selector: 'table.table tbody tr',
    getContactPhoneNumbers: async elem => {
      let phoneNode = elem.querySelector('.column-phone span span')
      let txt = phoneNode
        ? phoneNode.textContent.trim()
        : ''
      if (checkPhoneNumber(txt)) {
        return [{
          id: '',
          title: 'phone number',
          number: txt
        }]
      }
      let linkElem = elem.querySelector('.name-cell a')
      let href = linkElem
        ? linkElem.getAttribute('href')
        : ''
      let ids = getIds(href)
      return await getNumbers(ids)
    }
  }
]

// modify phone number text to click-to-call link
export const phoneNumberSelectors = []

/**
 * thirdPartyService config
 * @param {*} serviceName
 */
export function thirdPartyServiceConfig(serviceName) {

  console.log(serviceName)

  let services = {
    name: serviceName,
    // show contacts in ringcentral widgets
    contactsPath: '/contacts',
    contactSearchPath: '/contacts/search',
    contactMatchPath: '/contacts/match',

    // show auth/auauth button in ringcentral widgets
    authorizationPath: '/authorize',
    authorizedTitle: 'Unauthorize',
    unauthorizedTitle: 'Authorize',
    authorized: false,

    // Enable call log sync feature
    callLoggerPath: '/callLogger',
    callLoggerTitle: `Log to ${serviceName}`,

    // show contact activities in ringcentral widgets
    activitiesPath: '/activities',
    activityPath: '/activity'
  }

  // handle ringcentral event
  // check https://github.com/zxdong262/pipedrive-embeddable-ringcentral-phone-spa/blob/master/src/config.js
  // as example
  // read our document about third party features https://github.com/ringcentral/ringcentral-embeddable/blob/master/docs/third-party-service-in-widget.md
  let handleRCEvents = async e => {
    console.log(e)
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
  return {
    services,
    handleRCEvents
  }
}

/**
 * init third party
 * could init dom insert etc here
 */
export async function initThirdParty() {
  //hanlde contacts events
  let userId = getUserId()
  window.rc.currentUserId = userId
  window.rc.cacheKey = 'contacts' + '_' + userId
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
