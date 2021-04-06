/**
 * content config file
 * with proper config,
 * insert `call with ringcentral` button
 * or hover some elemet show call button tooltip
 * or convert phone number text to click-to-call link
 *
 */

/// *
import _ from 'lodash'
import {
  RCBTNCLS2,
  checkPhoneNumber,
  formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { upgrade } from 'ringcentral-embeddable-extension-common/src/feat/upgrade-notification'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import { jsonHeader } from 'ringcentral-embeddable-extension-common/src/common/fetch'
import { getCSRFToken, getIds, rc } from './feat/common'
import { getDeals } from './feat/deal'
import './feat/on-unload'
import {
  getCompanyById
} from './feat/company'
import {
  showActivityDetail,
  getActivities
} from './feat/activities'
import {
  showAuthBtn,
  doAuth,
  notifyRCAuthed,
  unAuth
} from './feat/auth'
import {
  syncCallLogToThirdParty,
  findMatchCallLog
} from './feat/log-sync.js'
import {
  fetchAllContacts,
  getContacts,
  formatContacts,
  showContactInfoPanel
} from './feat/contacts.js'
import {
  search,
  match,
  getByPage
} from 'ringcentral-embeddable-extension-common/src/common/db'
import copy from 'json-deep-copy'
import { onRCMeetingCreate, onMeetingPanelOpen, openRCMeeting } from './feat/meeting'
import { initMeetingSelect } from './feat/meeting-sync'
import initReact from './lib/react-entry'
import initInner from './lib/inner-entry'
import initInnerCallLog from './lib/call-log-entry.js'
import initSyncContactsSelect from './lib/sync-contacts-select-entry.js'
import { resyncCheck } from './lib/auto-resync'
import { onTriggerLogin, onLoginCallback } from './feat/handle-login'
import { onSMSlogEnabled } from './feat/create-custom-sms-event'
// import run from './feat/add-contacts'
// import run1 from './feat/add-companies'
// run()
// run1()
let {
  apiServerHS,
  pageSize
} = thirdPartyConfigs

// let phoneTypeDict = {
//   phone: 'Phone number',
//   company: 'Company phone number',
//   mobilephone: 'Mobile phone number'
// }

function formatNumbers (res) {
  const r = formatContacts([res])[0]
  return r.phoneNumbers.map(p => {
    return {
      id: p.phoneNumber,
      title: p.phoneType,
      number: formatPhone(p.phoneNumber.replace('*', '#')).replace(' ext. ', '#')
    }
  })
}

async function getNumbers (ids = getIds()) {
  if (!ids) {
    return []
  }
  let {
    portalId,
    vid
  } = ids
  let url = `${apiServerHS}/contacts/v1/contact/vid/${vid}/profile?resolveOwner=false&showSourceMetadata=false&identityProfileMode=all&showPastListMemberships=false&formSubmissionMode=none&showPublicToken=false&propertyMode=value_only&showAnalyticsDetails=false&resolveAssociations=true&portalId=${portalId}&clienttimeout=14000&property=mobilephone&property=phone&property=email&property=hubspot_owner_id`
  let csrf = getCSRFToken()
  let res = await fetchBg(url, {
    headers: {
      ...jsonHeader,
      'x-hubspot-csrf-hubspotapi': csrf
    }
  })
  return res ? formatNumbers(res) : []
}

async function getDealNumbers (ids = getIds()) {
  if (!ids) {
    return []
  }
  let deal = await getDeals('', Number(ids.vid))
  if (!deal) {
    return []
  }
  let vids = _.get(deal, 'associations.associatedVids') || []
  let numbers = []
  for (let vid of vids) {
    let ids0 = {
      portalId: ids.portalId,
      vid
    }
    let ns = await getNumbers(ids0)
    numbers = [
      ...numbers,
      ...ns
    ]
  }
  return numbers
}

async function getCompanyPhoneNumbers () {
  let ids = getIds(window.location.href)
  if (!ids) {
    return []
  }
  let company = await getCompanyById(ids.vid)
  return company.phoneNumbers.map((p, i) => {
    return {
      id: i + '#' + company.companyId,
      title: 'Company phone number',
      number: p.phoneNumber
    }
  }).filter(o => checkPhoneNumber(o.number))
}

export function getUserId () {
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
      return /contacts\/\d+\/contact\/\d+/.test(href)
    },
    getContactPhoneNumbers: getNumbers,
    onClickMeeting: function () {
      document.querySelector('[data-icon-name="meetings"]').click()
      openRCMeeting()
    },
    parentsToInsertButton: [
      {
        getElem: () => {
          let p = document.querySelector('[data-unit-test="highlightSubtitle"]') || document.querySelector('[data-selenium-test="contact-highlight-details"]')
          return p
            ? p.parentNode.parentNode : null
        },
        insertMethod: 'append'
      }
    ]
  },
  {
    shouldAct: href => {
      return /contacts\/\d+\/deal\/\d+/.test(href)
    },
    getContactPhoneNumbers: getDealNumbers,
    parentsToInsertButton: [
      {
        getElem: () => {
          let p = document.querySelector('[class*="ProfileHighlightContainer__Wrapper"]')
          return p
        },
        insertMethod: 'append',
        shouldInsert: () => {
          let all = document.querySelectorAll('[class*="ProfileHighlightContainer__Wrapper"] .' + RCBTNCLS2)
          if (all.length > 1) {
            let arr = Array.from(all)
            let i = 0
            for (let ele of arr) {
              if (i !== 0) {
                ele.remove()
              }
              i++
            }
          }
          return !all.length
        }
      }
    ]
  },
  {
    shouldAct: href => {
      return /contacts\/\d+\/company\/\d+/.test(href)
    },
    getContactPhoneNumbers: getCompanyPhoneNumbers,
    onClickMeeting: function () {
      document.querySelector('[data-icon-name="meetings"]').click()
      openRCMeeting()
    },
    parentsToInsertButton: [
      {
        getElem: () => {
          let p = document.querySelector('[data-selenium-test="company-highlight-details"] div') || document.querySelector('[class*="CompanyContactEditableTitle"]')
          return p
            ? p.parentNode.parentNode.parentNode : null
        },
        insertMethod: 'append',
        shouldInsert: () => {
          let all = document.querySelectorAll('.text-center .' + RCBTNCLS2)
          if (all.length > 1) {
            let arr = Array.from(all)
            let i = 0
            for (let ele of arr) {
              if (i !== 0) {
                ele.remove()
              }
              i++
            }
          }
          return !all.length
        }
      }
    ]
  }
]

// hover contact node to show click to dial tooltip
export const hoverShowClickToCallButton = [
  {
    shouldAct: href => {
      return href.includes('contacts/list/') || href.includes('contacts/view/all/')
    },
    selector: 'table.table tbody tr',
    getContactPhoneNumbers: async elem => {
      let linkElem = elem.querySelector('[href*="/contacts"]')
      let href = linkElem
        ? linkElem.getAttribute('href')
        : ''

      let ids = getIds(href)
      return getNumbers(ids)
    }
  },
  {
    shouldAct: href => {
      return href.includes('companies/list/') || href.includes('companies/view/all/')
    },
    selector: 'table.table tbody tr',
    getContactPhoneNumbers: async elem => {
      let linkElem = elem.querySelector('.name-cell a')
      let href = linkElem
        ? linkElem.getAttribute('href')
        : ''
      let ids = getIds(href)
      if (!ids) {
        return []
      }
      let company = await getCompanyById(ids.vid)
      return company.phoneNumbers.map((p, i) => {
        return {
          id: i + '#' + company.companyId,
          title: 'Company phone number',
          number: p.phoneNumber
        }
      }).filter(o => checkPhoneNumber(o.number))
    }
  }
]

// modify phone number text to click-to-call link
export const phoneNumberSelectors = [{
  shouldAct: (href) => {
    return href.includes('/contacts')
  },
  selector: '[data-selenium-test="timeline-editable-section"] b'
}, {
  shouldAct: (href) => {
    return href.includes('/contacts')
  },
  selector: '[data-measured-element="timeline-participant-details-right-content"] span'
}]

/**
 * thirdPartyService config
 * @param {*} serviceName
 */
export async function thirdPartyServiceConfig (serviceName) {
  const logSMSType = await ls.get('rc-logSMSType') || 'CALL'
  const logSMSAsThread = await ls.get('rc-logSMSAsThread') || false
  const logSMSAsCustomEvent = await ls.get('rc-logSMSAsCustomEvent') || false
  const filterSMSThread = await ls.get('rc-filterSMSThread') || false
  const autoSyncToAll = await ls.get('rc-autoSyncToAll') || false
  console.log(serviceName)
  const logTitle = `Log to ${serviceName}`
  let services = {
    name: serviceName,
    // show contacts in ringcentral widgets
    contactsPath: '/contacts',
    contactIcon: 'https://github.com/ringcentral/hubspot-embeddable-ringcentral-phone/blob/master/src/hubspot.png?raw=true',
    contactSearchPath: '/contacts/search',
    contactMatchPath: '/contacts/match',

    // show auth/auauth button in ringcentral widgets
    authorizationPath: '/authorize',
    authorizedTitle: 'Unauthorize',
    unauthorizedTitle: 'Authorize',
    authorized: false,

    // Enable call log sync feature
    callLoggerPath: '/callLogger',
    callLoggerTitle: logTitle,

    messageLoggerPath: '/messageLogger',
    messageLoggerTitle: logTitle,

    // show contact activities in ringcentral widgets
    activitiesPath: '/activities',
    activityPath: '/activity',
    callLogEntityMatcherPath: '/callLogger/match',
    messageLogEntityMatcherPath: '/messageLogger/match',

    // meeting
    meetingInvitePath: '/meeting/invite',
    meetingInviteTitle: `Schedule meeting`,
    meetingLoggerPath: '/meetingLogger',
    meetingLoggerTitle: logTitle,
    settingsPath: '/settings',
    settings: [
      {
        name: 'Log SMS as note',
        value: logSMSType === 'NOTE'
      },
      {
        name: 'Log SMS thread as one log',
        value: logSMSAsThread
      },
      {
        name: 'Log SMS as RingCentral SMS event',
        value: logSMSAsCustomEvent
      },
      {
        name: 'For SMS thread Only show SMS in 5 minutes',
        value: filterSMSThread
      },
      {
        name: 'Auto sync call/message log to all matched contact(do not show selection)',
        value: autoSyncToAll
      }
    ]
  }

  // handle ringcentral event
  // check https://github.com/zxdong262/pipedrive-embeddable-ringcentral-phone-spa/blob/master/src/config.js
  // as example
  // read our document about third party features https://github.com/ringcentral/ringcentral-embeddable/blob/master/docs/third-party-service-in-widget.md
  let handleRCEvents = async e => {
    let { data } = e
    if (!data) {
      return
    }
    console.debug(data)
    let { type, loggedIn, path, call, requestId, sessionIds, callbackUri, telephonyStatus } = data
    if (callbackUri) {
      return onLoginCallback(callbackUri)
    }
    if (type === 'rc-login-status-notify') {
      console.debug('rc logined', loggedIn)
      rc.rcLogined = loggedIn
    } else if (type === 'rc-login-popup-notify') {
      onTriggerLogin(data)
    }
    if (type === 'rc-sync-log-success') {
      // response to widget
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: requestId,
        response: { data: 'ok' }
      })
      setTimeout(() => {
        rc.postMessage({
          type: 'rc-adapter-trigger-call-logger-match',
          sessionIds
        })
      }, 8000)
    }
    if (
      type === 'rc-route-changed-notify' &&
      path === '/contacts' &&
      !rc.local.accessToken
    ) {
      showAuthBtn()
    } else if (
      type === 'rc-route-changed-notify' &&
      path === '/history'
    ) {
      rc.postMessage({
        type: 'rc-adapter-trigger-call-logger-match',
        sessionIds
      })
    } else if (
      type === 'rc-active-call-notify'
    ) {
      showContactInfoPanel(call)
    } else if (type === 'rc-region-settings-notify') {
      const prevCountryCode = rc.countryCode || 'US'
      console.debug('prev country code:', prevCountryCode)
      const newCountryCode = data.countryCode
      console.debug('new country code:', newCountryCode)
      if (prevCountryCode !== newCountryCode) {
        fetchAllContacts()
      }
      rc.countryCode = newCountryCode
      ls.set('rc-country-code', newCountryCode)
    } else if (type === 'rc-call-end-notify') {
      const dd = copy(data)
      dd.type = 'rc-show-add-contact-panel'
      window.postMessage(dd, '*')
    } else if (type === 'UI_ADDON_INTEGRATIONS_DIRECTORY_APP_LOADED') {
      onMeetingPanelOpen()
    } else if (type === 'rc-adapter-syncPresence') {
      if (telephonyStatus === 'Ringing') {
        window.rc.calling = true
      } else if (telephonyStatus === 'NoCall') {
        window.rc.calling = false
      }
    }
    // if (type === 'rc-inbound-message-notify') {
    //   return console.log('rc-inbound-message-notify:', data.message, data)
    // } else if (type === 'rc-message-updated-notify') {
    //   return console.log('rc-message-updated-notify:', data.message, data)
    // }
    if (type !== 'rc-post-message-request') {
      return
    }
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
    } else if (data.path === '/settings') {
      const arr = data.body.settings
      const logSMSASNote = arr[0].value
      rc.logSMSType = logSMSASNote ? 'NOTE' : 'CALL'
      ls.set('rc-logSMSType', rc.logSMSType)
      const logSMSAsThread = arr[1].value
      rc.logSMSAsThread = logSMSAsThread
      ls.set('rc-logSMSAsThread', rc.logSMSAsThread)
      const logSMSAsCustomEvent = arr[2].value
      const prevLogSMSAsCustomEvent = rc.logSMSAsCustomEvent
      rc.logSMSAsCustomEvent = logSMSAsCustomEvent
      ls.set('rc-logSMSAsCustomEvent', rc.logSMSAsCustomEvent)
      if (!prevLogSMSAsCustomEvent && rc.logSMSAsCustomEvent) {
        onSMSlogEnabled()
      }
      const filterSMSThread = arr[3].value
      rc.filterSMSThread = filterSMSThread
      ls.set('rc-filterSMSThread', rc.filterSMSThread)
      const autoSyncToAll = arr[4].value
      rc.autoSyncToAll = autoSyncToAll
      ls.set('rc-autoSyncToAll', rc.autoSyncToAll)
    } else if (path === '/contacts') {
      let isMannulSync = _.get(data, 'body.type') === 'manual'
      let page = _.get(data, 'body.page') || 1
      if (isMannulSync && page === 1) {
        window.postMessage({
          type: 'rc-show-sync-menu'
        }, '*')
        return rc.postMessage({
          type: 'rc-post-message-response',
          responseId: data.requestId,
          response: {
            data: []
          }
        })
      }
      const now = Date.now()
      window.postMessage({
        type: 'rc-transferring-data',
        transferringData: true
      }, '*')
      let contacts = await getContacts(page)
      let nextPage = ((contacts.count || 0) - page * pageSize > 0) || contacts.hasMore
        ? page + 1
        : null
      const no2 = Date.now()
      console.debug(no2 - now)
      window.postMessage({
        type: 'rc-transferring-data',
        transferringData: false
      }, '*')
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: {
          data: contacts.result,
          nextPage,
          syncTimeStamp: rc.syncTimeStamp
        }
      })
    } else if (path === '/contacts/search') {
      if (!rc.local.accessToken) {
        return showAuthBtn()
      }
      let contacts = []
      let keyword = _.get(data, 'body.searchString')
      if (keyword) {
        contacts = await search(keyword)
      }
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: {
          data: contacts
        }
      })
    } else if (path === '/contacts/match') {
      if (!rc.local.accessToken) {
        return showAuthBtn()
      }
      let phoneNumbers = _.get(data, 'body.phoneNumbers') || []
      let res = await match(phoneNumbers)
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: {
          data: res
        }
      })
    } else if (path === '/meetingLogger') {
      e.data.path = '/meetingLoggerForward'
      window.postMessage(e.data, '*')
    } else if (path === '/callLogger' || path === '/messageLogger') {
      syncCallLogToThirdParty({
        ...data.body,
        requestId: data.requestId
      })
    } else if (path === '/callLogger/match' || data.path === '/messageLogger/match') {
      let matchRes = await findMatchCallLog(data)
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: { data: matchRes }
      })
      // data: {
      //   '214705503020': [{ // call session id from request
      //     id: '88888', // call log entity id from your platform
      //     note: 'Note', // Note of this call log entity
      //   }]
      // }
    } else if (path === '/activities') {
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
    } else if (path === '/activity') {
      // response to widget
      showActivityDetail(data.body)
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: { data: 'ok' }
      })
    } else if (path === '/meeting/invite') {
      // add your codes here to handle meeting invite data
      onRCMeetingCreate(data)
      // response to widget
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
export async function initThirdParty () {
  // hanlde contacts events
  let userId = getUserId()
  rc.currentUserId = userId
  rc.cacheKey = 'contacts' + '_' + userId
  rc.logSMSType = await ls.get('rc-logSMSType') || 'CALL'
  rc.logSMSAsThread = await ls.get('rc-logSMSAsThread') || false
  rc.logSMSAsCustomEvent = await ls.get('rc-logSMSAsCustomEvent') || false
  rc.filterSMSThread = await ls.get('rc-filterSMSThread') || false
  rc.autoSyncToAll = await ls.get('rc-autoSyncToAll') || false
  let accessToken = await ls.get('accessToken') || null
  rc.countryCode = await ls.get('rc-country-code') || undefined
  const syncTimeStamp = await ls.get('rc-sync-timestamp')
  if (syncTimeStamp) {
    rc.syncTimeStamp = syncTimeStamp
  }
  console.log('rc.countryCode:', rc.countryCode)
  if (accessToken) {
    rc.local = {
      accessToken
    }
  }

  if (rc.local.accessToken) {
    notifyRCAuthed()
  }

  upgrade()
  onMeetingPanelOpen()
  initMeetingSelect()
  initReact()
  initInner()
  initInnerCallLog()
  initSyncContactsSelect()
  const db = await getByPage(1, 1)
  resyncCheck(db && db.count)
}
