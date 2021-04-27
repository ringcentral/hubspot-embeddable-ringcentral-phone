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
import searchPhone from '../common/search'
import { upgrade } from 'ringcentral-embeddable-extension-common/src/feat/upgrade-notification'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import { rc } from '../common/common'
import '../feat/on-unload'
import {
  syncCallLogToThirdParty,
  findMatchCallLog
} from '../feat/log-sync.js'
import {
  showContactInfoPanel
} from '../funcs/contacts.js'
import copy from 'json-deep-copy'
import { onRCMeetingCreate, onMeetingPanelOpen } from '../feat/meeting'
import { initMeetingSelect } from '../feat/meeting-sync'
import initReact from '../lib/main-entry'
import initInner from '../lib/inner-entry'
import initInnerCallLog from '../lib/call-log-entry.js'
import initSyncContactsSelect from '../lib/sync-contacts-select-entry.js'

export function getUserId () {
  const emailDom = document.querySelector('.user-info-email')
  if (!emailDom) {
    return ''
  }
  const email = emailDom.textContent.trim()
  return email
}

/**
 * thirdPartyService config
 * @param {*} serviceName
 */
export async function thirdPartyServiceConfig (serviceName) {
  const logSMSAsThread = await ls.get('rc-logSMSAsThread') || false
  const filterSMSThread = await ls.get('rc-filterSMSThread') || false
  const autoSyncToAll = await ls.get('rc-autoSyncToAll') || false
  console.log(serviceName)
  const logTitle = `Log to HubSpot`
  const services = {
    name: serviceName,
    // show contacts in ringcentral widgets
    // contactsPath: '/contacts',
    // contactIcon: 'https://github.com/ringcentral/hubspot-embeddable-ringcentral-phone/blob/master/src/hubspot.png?raw=true',
    // contactSearchPath: '/contacts/search',
    contactMatchPath: '/contacts/match',

    // show auth/auauth button in ringcentral widgets
    // authorizationPath: '/authorize',
    // authorizedTitle: 'Unauthorize',
    // unauthorizedTitle: 'Authorize',
    // authorized: false,

    // Enable call log sync feature
    callLoggerPath: '/callLogger',
    callLoggerTitle: logTitle,

    messageLoggerPath: '/messageLogger',
    messageLoggerTitle: logTitle,

    // show contact activities in ringcentral widgets
    // activitiesPath: '/activities',
    // activityPath: '/activity',
    callLogEntityMatcherPath: '/callLogger/match',
    messageLogEntityMatcherPath: '/messageLogger/match',

    // meeting
    meetingInvitePath: '/meeting/invite',
    meetingInviteTitle: 'Schedule meeting',
    settingsPath: '/settings',
    settings: [
      {
        name: 'Log SMS thread as one log',
        value: logSMSAsThread
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
  const handleRCEvents = async e => {
    const { data } = e
    if (!data) {
      return
    }
    console.debug(data)
    const { type, path, call, requestId, sessionIds, telephonyStatus } = data
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
    if (data.path === '/settings') {
      const arr = data.body.settings
      const logSMSAsThread = arr[1].value
      rc.logSMSAsThread = logSMSAsThread
      ls.set('rc-logSMSAsThread', rc.logSMSAsThread)
      const filterSMSThread = arr[3].value
      rc.filterSMSThread = filterSMSThread
      ls.set('rc-filterSMSThread', rc.filterSMSThread)
      const autoSyncToAll = arr[4].value
      rc.autoSyncToAll = autoSyncToAll
      ls.set('rc-autoSyncToAll', rc.autoSyncToAll)
    } else if (path === '/contacts/match') {
      const phoneNumbers = _.get(data, 'body.phoneNumbers') || []
      const res = await searchPhone(phoneNumbers)
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: {
          data: res
        }
      })
    } else if (path === '/callLogger' || path === '/messageLogger') {
      syncCallLogToThirdParty({
        ...data.body,
        requestId: data.requestId
      })
    } else if (path === '/callLogger/match' || data.path === '/messageLogger/match') {
      const matchRes = await findMatchCallLog(data)
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
  const userId = getUserId()
  rc.currentUserId = userId
  rc.cacheKey = 'contacts' + '_' + userId
  rc.logSMSAsThread = await ls.get('rc-logSMSAsThread') || false
  rc.filterSMSThread = await ls.get('rc-filterSMSThread') || false
  rc.autoSyncToAll = await ls.get('rc-autoSyncToAll') || false
  rc.countryCode = await ls.get('rc-country-code') || undefined
  console.log('rc.countryCode:', rc.countryCode)
  upgrade()
  onMeetingPanelOpen()
  initMeetingSelect()
  initReact()
  initInner()
  initInnerCallLog()
  initSyncContactsSelect()
}
