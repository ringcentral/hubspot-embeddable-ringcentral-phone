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
import { searchPhone } from '../common/search'
import { upgrade } from 'ringcentral-embeddable-extension-common/src/feat/upgrade-notification'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import { rc } from '../common/common'
import '../funcs/on-unload'
import {
  syncCallLogToThirdParty
} from '../funcs/log-sync'
import {
  findMatchCallLog
} from '../funcs/match-log'
import {
  showContactInfoPanel, afterCallEnd
} from '../funcs/contacts.js'
import copy from 'json-deep-copy'
import { onRCMeetingCreate, onMeetingPanelOpen } from '../funcs/meeting'
// import { initMeetingSelect } from '../funcs/meeting-sync'
import initReact from '../lib/main-entry'
import initCallHistory from '../lib/call-history-entry.js'
import initInner from '../lib/inner-entry'
import initInnerCallLog from '../lib/call-log-entry.js'
import initSyncContactsSelect from '../lib/sync-contacts-select-entry.js'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'

const {
  extensionName
} = thirdPartyConfigs

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
export async function thirdPartyServiceConfig () {
  console.log(extensionName)
  const logTitle = 'Log to HubSpot'
  const services = {
    name: extensionName,
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
    settingsPath: '/settings'
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
    const {
      type,
      path,
      call,
      requestId,
      sessionIds,
      telephonyStatus,
      ready
    } = data
    if (type === 'rc-dialer-status-notify') {
      window.rc.ready = ready
    }
    if (type === 'rc-sync-log-success') {
      // response to widget
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: requestId,
        response: { data: 'ok' }
      })
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
        window.postMessage({
          type: 'rc-is-ringing'
        }, '*')
      } else if (telephonyStatus === 'NoCall') {
        if (window.rc.calling) {
          afterCallEnd()
          window.postMessage({
            type: 'rc-is-call-end'
          }, '*')
        }
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
    if (path === '/contacts/match') {
      const phoneNumbers = _.get(data, 'body.phoneNumbers') || []
      const res = await searchPhone(phoneNumbers, false)
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: {
          data: res
        }
      })
    } else if (path === '/messageLogger' || path === '/callLogger') {
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
  rc.countryCode = await ls.get('rc-country-code') || undefined
  console.log('rc.countryCode:', rc.countryCode)
  upgrade()
  onMeetingPanelOpen()
  // initMeetingSelect()
  initReact()
  initInner()
  initInnerCallLog()
  initSyncContactsSelect()
  initCallHistory()
}
