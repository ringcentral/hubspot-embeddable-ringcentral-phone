/**
 * call/message log sync feature
 */

import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import { getContactInfo } from './log-sync-form'
import extLinkSvg from 'ringcentral-embeddable-extension-common/src/common/link-external.svg'
import {
  showAuthBtn
} from './auth'
import _ from 'lodash'
import {
  notify,
  host,
  formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import { commonFetchOptions, rc, getPortalId, formatPhoneLocal, getEmail, autoLogPrefix } from './common'
import { getDeals } from './deal'
import {
  match
} from 'ringcentral-embeddable-extension-common/src/common/db'
import getOwnerId from './get-owner-id'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import copy from 'json-deep-copy'
import dayjs from 'dayjs'
import updateLog from './update-call-log'

let {
  showCallLogSyncForm,
  serviceName,
  apiServerHS
} = thirdPartyConfigs

// function getPortalId() {
//   let dom = document.querySelector('.navAccount-portalId')
//   return dom
//     ? dom.textContent.trim()
//     : ''
// }

export function notifySyncSuccess ({
  id,
  logType,
  interactionType,
  isCompany
}) {
  let type = 'success'
  let portalId = getPortalId()
  let cat = isCompany ? 'company' : 'contact'
  let url = `${host}/contacts/${portalId}/${cat}/${id}`
  let msg = `
    <div>
      <div class="rc-pd1b">
        ${logType} log synced to hubspot!
      </div>
      <div class="rc-pd1b">
        <a href="${url}" target="_blank">
          <img src="${extLinkSvg}" width=16 height=16 class="rc-iblock rc-mg1r" />
          <span class="rc-iblock">
            Check contact activities
          </span>
        </a>
      </div>
    </div>
  `
  notify(msg, type, 9000)
}

let prev = {
  time: Date.now(),
  sessionId: '',
  body: {}
}

function checkMerge (body) {
  const maxDiff = 100
  const now = Date.now()
  const sid = _.get(body, 'conversation.conversationId')
  const type = _.get(body, 'conversation.type')
  if (type !== 'SMS') {
    return body
  }
  if (prev.sessionId === sid && prev.time - now < maxDiff) {
    let msgs = [
      ...body.conversation.messages,
      ...prev.body.conversation.messages
    ]
    msgs = _.uniqBy(msgs, (e) => e.id)
    body.conversation.messages = msgs
    prev.body = copy(body)
    return body
  } else {
    prev.time = now
    prev.sessionId = sid
    prev.body = copy(body)
    return body
  }
}

function buildId (body) {
  return body.id ||
  _.get(body, 'call.sessionId') ||
  _.get(body, 'conversation.conversationLogId')
}

export async function syncCallLogToThirdParty (body) {
  // let result = _.get(body, 'call.result')
  // if (result !== 'Call connected') {
  //   return
  // }
  let isManuallySync = !body.triggerType || body.triggerType === 'manual'
  let isAutoSync = body.triggerType === 'callLogSync' || body.triggerType === 'auto'
  if (!isAutoSync && !isManuallySync) {
    return
  }
  if (_.get(body, 'sessionIds')) {
    // todo: support voicemail
    return
  }
  if (!rc.local.accessToken) {
    return isManuallySync ? showAuthBtn() : null
  }
  const id = buildId(body)
  if (showCallLogSyncForm && isManuallySync) {
    body = checkMerge(body)
    let contactRelated = await getContactInfo(body, serviceName)
    if (
      !contactRelated ||
      (!contactRelated.froms && !contactRelated.tos)
    ) {
      const b = copy(body)
      b.type = 'rc-show-add-contact-panel'
      return window.postMessage(b, '*')
    }
    window.postMessage({
      type: 'rc-init-call-log-form',
      isManuallySync,
      callLogProps: {
        id,
        isManuallySync,
        body
      }
    }, '*')
  } else {
    window.postMessage({
      type: 'rc-init-call-log-form',
      isManuallySync,
      callLogProps: {
        id,
        isManuallySync,
        body
      }
    }, '*')
  }
}

async function getSyncContacts (body) {
  // let objs = _.filter(
  //   [
  //     ..._.get(body, 'call.toMatches') || [],
  //     ..._.get(body, 'call.fromMatches') || [],
  //     ...(_.get(body, 'correspondentEntity') ? [_.get(body, 'correspondentEntity')] : [])
  //   ],
  //   m => m.type === serviceName
  // )
  // if (objs.length) {
  //   return objs
  // }
  let all = []
  if (body.call) {
    let nf = _.get(body, 'to.phoneNumber') ||
      _.get(body, 'call.to.phoneNumber')
    let nt = _.get(body, 'from.phoneNumber') ||
      _.get(body.call, 'from.phoneNumber')
    all = [nt, nf]
  } else {
    all = [
      _.get(body, 'conversation.self.phoneNumber'),
      ...body.conversation.correspondents.map(d => d.phoneNumber)
    ]
  }
  all = all.map(s => formatPhone(s))
  let contacts = await match(all)
  let arr = Object.keys(contacts).reduce((p, k) => {
    return [
      ...p,
      ...contacts[k]
    ]
  }, [])
  return _.uniqBy(arr, d => d.id)
}

export async function getUserId () {
  let pid = getPortalId()
  let url = `${apiServerHS}/login-verify/hub-user-info?early=true&portalId=${pid}`
  let res = await fetchBg(url, {
    headers: commonFetchOptions().headers
  })
  // let res = await fetch.get(url, commonFetchOptions())
  let ownerId = ''
  if (res && res.user) {
    ownerId = _.get(res, 'user.user_id')
  } else {
    console.log('fetch ownerId error')
    console.log(res)
  }
  return ownerId
}

export async function getCompanyId (contactId) {
  const pid = getPortalId()
  let url = `${apiServerHS}/crm-meta/v1/meta?portalId=${pid}&clienttimeout=15000`
  let res = await fetchBg(url, {
    headers: commonFetchOptions().headers,
    method: 'post',
    body: {
      vid: Number(contactId),
      objectIds: {
        CONTACT: Number(contactId)
      },
      timeoutMillis: 5000,
      types: [
        'CONTACT',
        'CONTACT_ASSOCIATIONS_FIRST_PAGE'
      ]
    }
  })
  // let res = await fetch.get(url, commonFetchOptions())
  let companyId = ''
  if (res && res.data) {
    companyId = _.get(res, 'data.CONTACT.properties.associatedcompanyid.value') + ''
  } else {
    console.log('fetch company error')
    console.log(res)
  }
  return companyId
}

/**
 * sync call log action
 * todo: need you find out how to do the sync
 * you may check the CRM site to find the right api to do it
 * @param {*} body
 * @param {*} formData
 */
export async function doSync (body, formData, isManuallySync) {
  let contacts = await getSyncContacts(body)
  if (!contacts.length) {
    return notify('No related contacts')
  }
  for (let contact of contacts) {
    await doSyncOne(contact, body, formData, isManuallySync)
  }
}

function buildMsgs (body) {
  let msgs = _.get(body, 'conversation.messages')
  const arr = []
  for (const m of msgs) {
    const fromN = _.get(m, 'from.phoneNumber') ||
      _.get(m, 'from[0].phoneNumber') || ''
    const fromName = _.get(m, 'from.name') ||
      (_.get(m, 'from') || []).map(d => d.name).join(', ') || ''
    const toN = _.get(m, 'to.phoneNumber') ||
      _.get(m, 'to[0].phoneNumber') || ''
    const toName = _.get(m, 'to.name') ||
      (_.get(m, 'to') || []).map(d => d.name).join(', ') || ''
    const from = fromN +
      (fromName ? `(${fromName})` : '')
    const to = toN +
      (toName ? `(${toName})` : '')
    arr.push({
      body: `<p>SMS: <b>${m.subject}</b> - from <b>${from}</b> to <b>${to}</b> - ${dayjs(m.creationTime).format('MMM DD, YYYY HH:mm')}</p>`,
      id: m.id
    })
  }
  return arr
}

function buildVoiceMailMsgs (body) {
  let msgs = _.get(body, 'conversation.messages')
  const arr = []
  for (const m of msgs) {
    let isOut = m.direction === 'Outbound'
    let desc = isOut
      ? 'to'
      : 'from'
    let n = isOut
      ? m.to
      : [m.from]
    n = n.map(m => formatPhoneLocal(m.phoneNumber || m.extensionNumber)).join(', ')
    let links = m.attachments.map(t => t.link).join(', ')
    arr.push({
      body: `<p>Voice mail: ${links} - ${n ? desc : ''} <b>${n}</b> ${dayjs(m.creationTime).format('MMM DD, YYYY HH:mm')}</p>`,
      id: m.id
    })
  }
  return arr
}

function buildKey (id, email) {
  return `rc-log-${email}-${id}`
}

async function saveLog (id, email, engageId) {
  const key = buildKey(id, email)
  await ls.set(key, engageId)
}

function getCallInfo (contact, toNumber, fromNumber) {
  const cnums = contact.phoneNumbers.map(n => formatPhone(n.phoneNumber))
  const fn = formatPhone(fromNumber)
  const tn = formatPhone(toNumber)
  if (cnums.includes(tn)) {
    return {
      calleeObjectType: 'CONTACT',
      calleeObjectId: contact.id
    }
  } else if (cnums.includes(fn)) {
    return {
      callerObjectType: 'CONTACT',
      callerObjectId: contact.id
    }
  }
  return {}
}

async function filterLoggered (arr, email) {
  const res = []
  for (const m of arr) {
    const key = buildKey(m.id, email)
    const ig = await ls.get(key)
    if (!ig) {
      res.push(m)
    }
  }
  return res
}

async function doSyncOne (contact, body, formData, isManuallySync) {
  let { id: contactId, isCompany } = contact
  if (isCompany) {
    return
  }
  if (!contactId) {
    return notify('No related contact', 'warn')
  }
  let desc = formData.description
  const sid = _.get(body, 'call.telephonySessionId') || 'not-exist'
  const sessid = autoLogPrefix + sid
  if (!isManuallySync) {
    desc = await ls.get(sessid) || ''
  }
  const type = isCompany ? 'COMPANY' : 'CONTACT'
  let ownerId = await getOwnerId(contact.id, type)
  if (!ownerId) {
    return
  }
  let email = getEmail()
  let now = +new Date()
  let contactIds = isCompany ? [] : [Number(contactId)]
  let toNumber = _.get(body, 'call.to.phoneNumber')
  let fromNumber = _.get(body, 'call.from.phoneNumber')
  let fmtime = dayjs(_.get(body, 'call.startTime')).format('MMM DD, YYYY h:mm A')
  let status = 'COMPLETED'
  let durationMilliseconds = _.get(body, 'call.duration')
  durationMilliseconds = durationMilliseconds
    ? durationMilliseconds * 1000
    : undefined
  let externalId = buildId(body)
  let recording = _.get(body, 'call.recording')
    ? `<p>Recording link: ${body.call.recording.link}</p>`
    : ''
  let dealIds = await getDeals(contactId)
  let mainBody = ''
  let ctype = _.get(body, 'conversation.type')
  let isVoiceMail = ctype === 'VoiceMail'
  if (body.call) {
    mainBody = `${fmtime}: [${_.get(body, 'call.direction')} ${_.get(body, 'call.result')}] CALL from <b>${body.call.fromMatches.map(d => d.name).join(', ')}</b>(<b>${formatPhoneLocal(fromNumber)}</b>) to <b>${body.call.toMatches.map(d => d.name).join(', ')}</b>(<b>${formatPhoneLocal(toNumber)}</b>)`
  } else if (ctype === 'SMS') {
    mainBody = buildMsgs(body)
  } else if (isVoiceMail) {
    mainBody = buildVoiceMailMsgs(body)
  }
  let interactionType = 'CALL' // body.call || isVoiceMail ? 'CALL' : 'NOTE'
  let logType = body.call || isVoiceMail ? 'Call' : ctype
  if (!_.isArray(mainBody)) {
    mainBody = [{
      body: mainBody,
      id: externalId
    }]
  }
  if (!(isManuallySync && logType === 'Call')) {
    mainBody = await filterLoggered(mainBody, email)
  }
  let bodyAll = mainBody.map(mm => {
    return {
      id: mm.id,
      body: `<p>${desc || ''}</p><p>${mm.body}</p>${recording}`
    }
  })
  for (const uit of bodyAll) {
    let companyId = isCompany
      ? contactId
      : await getCompanyId(contactId)
    let data = {
      engagement: {
        active: true,
        ownerId,
        type: interactionType,
        timestamp: now
      },
      associations: {
        contactIds,
        companyIds: companyId ? [Number(companyId)] : [],
        dealIds,
        ownerIds: []
      },
      attachments: [],
      metadata: {
        externalId: uit.id,
        body: uit.body,
        toNumber,
        fromNumber,
        status,
        durationMilliseconds,
        ...getCallInfo(contact, toNumber, fromNumber)
      }
    }
    let portalId = getPortalId()
    let url = `${apiServerHS}/engagements/v1/engagements/?portalId=${portalId}&clienttimeout=14000`
    let res = await fetchBg(url, {
      method: 'post',
      body: data,
      headers: {
        ...commonFetchOptions().headers,
        'X-Source': 'CRM_UI',
        'X-SourceId': email
      }
    })
    // let res = await fetch.post(url, data, commonFetchOptions())
    if (res && res.engagement) {
      await saveLog(uit.id, email, res.engagement.id)
      await updateLog(res.engagement.id, formData.callResult)
      notifySyncSuccess({
        id: contactId,
        logType,
        interactionType,
        isCompany
      })
    } else {
      notify('call log sync to hubspot failed', 'warn')
      console.log('post engagements/v1/engagements error')
      console.log(res)
    }
    window.postMessage({
      type: 'rc-call-log-form-hide'
    }, '*')
  }
}

export async function findMatchCallLog (data) {
  let portalId = getPortalId()
  let url = `${apiServerHS}/contacts/search/v1/search/engagements?portalId=${portalId}&clienttimeout=14000`
  let body = {
    query: '',
    count: 100,
    offset: 0,
    filterGroups: [
      {
        filters: [
          {
            property: 'engagement.createdAt',
            operator: 'HAS_PROPERTY'
          }
        ]
      }
    ],
    sorts: [
      {
        property: 'engagement.createdAt',
        order: 'DESC'
      }
    ],
    properties: []
  }
  let sessionIds = _.get(data, 'body.sessionIds') || _.get(data, 'body.conversationLogIds') || []
  let res = await fetchBg(url, {
    method: 'post',
    body,
    headers: {
      ...commonFetchOptions().headers
    }
  })
  if (!res || !res.engagements) {
    return
  }
  let x = res.engagements.reduce((prev, en) => {
    let sid = _.get(en, 'metadata.externalId')
    let id = _.get(en, 'engagement.id')
    let note = _.get(en, 'engagement.bodyPreview')
    if (!sessionIds.includes(sid)) {
      return prev
    }
    prev[sid] = prev[sid] || []
    prev[sid].push({
      id,
      note
    })
    return prev
  }, {})
  return x
}

/**
Contact to engagement 9
get
/crm-associations/v1/associations/:objectId/HUBSPOT_DEFINED/:definitionId?limit=100&offset=0
{
  "results": [
    259674,
    259727
  ],
  "hasMore": false,
  "offset": 259727
}
 */
