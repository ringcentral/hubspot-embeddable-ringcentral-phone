/**
 * call/message log sync feature
 */

import { thirdPartyConfigs, ringCentralConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
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
import { getFullNumber, commonFetchOptions, rc, getPortalId, formatPhoneLocal, getEmail, autoLogPrefix } from '../common/common'
import { getDeals } from './deal'
import {
  match
} from 'ringcentral-embeddable-extension-common/src/common/db'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import copy from 'json-deep-copy'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid/non-secure'
import { createCallLog, updateCallLogStatus, checkCallLog } from '../common/log-call'
import logSMS from '../common/log-sms'

const {
  showCallLogSyncForm,
  serviceName,
  apiServerHS
} = thirdPartyConfigs

const filterTime = 5 * 60 * 1000

function filterSMS (arr) {
  // console.log('old---====', arr)
  if (!rc.filterSMSThread) {
    return arr
  }
  const now = Date.now()
  const base = arr[0].stamp || now
  const res = arr.filter(d => {
    return base - (d.stamp || now) < filterTime
  })
  // console.log('new---====', res)
  return res
}

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
  isCompany,
  requestId,
  sessionIds
}) {
  const type = 'success'
  const portalId = getPortalId()
  const cat = isCompany ? 'company' : 'contact'
  const url = `${host}/contacts/${portalId}/${cat}/${id}`
  const msg = `
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
  window.postMessage({
    type: 'rc-sync-log-success',
    requestId,
    sessionIds
  }, '*')
}

const prev = {
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
    console.log('trigger merger')
    let msgs = [
      ...body.conversation.messages,
      ...prev.body.conversation.messages
    ]
    msgs = _.uniqBy(msgs, (e) => e.id)
    body.conversation.messages = msgs
    prev.body = copy(body)
    return body
  } else {
    console.log('not trigger merger')
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
  const isManuallySync = !body.triggerType || body.triggerType === 'manual'
  const isAutoSync = body.triggerType === 'callLogSync' || body.triggerType === 'auto'
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
    console.log('bbbb', body)
    const contactRelated = await getContactInfo(body, serviceName)
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
    const nf = getFullNumber(_.get(body, 'to')) ||
      getFullNumber(_.get(body, 'call.to'))
    const nt = getFullNumber(_.get(body, 'from')) ||
      getFullNumber(_.get(body.call, 'from'))
    all = [nt, nf]
  } else {
    all = [
      getFullNumber(_.get(body, 'conversation.self')),
      ...body.conversation.correspondents.map(d => getFullNumber(d))
    ]
  }
  all = all.map(s => formatPhone(s))
  const contacts = await match(all)
  const arr = Object.keys(contacts).reduce((p, k) => {
    return [
      ...p,
      ...contacts[k]
    ]
  }, [])
  return _.uniqBy(arr, d => d.id)
}

export async function getUserId () {
  const pid = getPortalId()
  const url = `${apiServerHS}/login-verify/hub-user-info?early=true&portalId=${pid}`
  const res = await fetchBg(url, {
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
  const url = `${apiServerHS}/crm-meta/v1/meta?portalId=${pid}&clienttimeout=15000`
  const res = await fetchBg(url, {
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
    companyId = _.get(res, 'data.CONTACT.properties.associatedcompanyid.value')
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
export async function doSync (body, formData, isManuallySync, contactList) {
  const contacts = contactList || await getSyncContacts(body)
  if (!contacts.length) {
    return notify('No related contacts')
  } else if (contacts.length > 1 && !contactList && !window.rc.autoSyncToAll) {
    return window.postMessage({
      inst: {
        id: nanoid(),
        formData,
        body,
        contacts,
        isManuallySync
      },
      type: 'rc-select-sync-contacts'
    }, '*')
  }
  for (const contact of contacts) {
    await doSyncOne(contact, body, formData, isManuallySync)
  }
}

function buildMsgs (body, contactId, logSMSAsThread) {
  const msgs = _.get(body, 'conversation.messages')
  const arr = []
  const arrMd = []
  for (const m of msgs) {
    const fromN = formatPhoneLocal(
      getFullNumber(_.get(m, 'from')) ||
      getFullNumber(_.get(m, 'from[0]')) || ''
    )
    const fromName = _.get(m, 'from.name') || _.get(m, 'from.phoneNumber') ||
      (_.get(m, 'from') || []).map(d => d.name).join(', ') || ''
    const toN = formatPhoneLocal(
      getFullNumber(_.get(m, 'to')) ||
      getFullNumber(_.get(m, 'to[0]')) || ''
    )
    const toName = _.get(m, 'to.name') ||
      (_.get(m, 'to') || []).map(d => d.name).join(', ') || ''
    const from = fromN +
      (fromName ? `(${fromName})` : '')
    const to = toN +
      (toName ? `(${toName})` : '')
    const stamp = dayjs(m.creationTime).valueOf()
    let attachments = (m.attachments || [])
      .filter(d => d.type !== 'Text')
      .map(d => {
        const url = encodeURIComponent(d.uri)
        return `<p><a href="https://ringcentral.github.io/ringcentral-media-reader/?media=${url}">attachment: ${d.fileName || d.id}</a><p>`
      }).join('')
    attachments = attachments ? `<p>attachments: </p>${attachments}` : ''
    const attachmentsMd = (m.attachments || [])
      .filter(d => d.type !== 'Text')
      .map(d => {
        const url = encodeURIComponent(d.uri)
        return `[attachment: ${d.fileName || d.id}](https://ringcentral.github.io/ringcentral-media-reader/?media=${url})`
      }).join(' ')
    arrMd.push({
      id: m.id,
      stamp,
      time: dayjs(m.creationTime).format('MMM DD, YYYY HH:mm'),
      content: `**${m.subject}** ${attachmentsMd} - from **${from}** to **${to}**`
    })
    if (logSMSAsThread) {
      arr.push({
        text: `<div><b>${m.subject}</b> ${attachments} - from <b>${from}</b> to <b>${to}</b>  - ${dayjs(m.creationTime).format('MMM DD, YYYY HH:mm')}</div>`,
        stamp
      })
    } else {
      arr.push({
        body: `<div>SMS: <b>${m.subject}</b> - from <b>${from}</b> to <b>${to}</b> - ${dayjs(m.creationTime).format('MMM DD, YYYY HH:mm')}${attachments}</div>`,
        id: m.id,
        stamp,
        isSMS: true,
        contactId
      })
    }
  }
  if (logSMSAsThread) {
    const bd = filterSMS(arr).map(d => d.text).join(' ')
    const ms = filterSMS(arrMd)
    return [{
      body: bd,
      mds: filterSMS(arrMd),
      isSMS: true,
      stamp: arr[0].stamp,
      id: ms.map(s => s.id).join(','),
      contactId
    }]
  }
  return arr.map((obj, i) => {
    return {
      ...obj,
      mds: [arrMd[i]]
    }
  })
}

function buildVoiceMailMsgs (body, contactId) {
  const msgs = _.get(body, 'conversation.messages')
  const arr = []
  for (const m of msgs) {
    const isOut = m.direction === 'Outbound'
    const desc = isOut
      ? 'to'
      : 'from'
    let n = isOut
      ? m.to
      : [m.from]
    n = n.map(m => formatPhoneLocal(getFullNumber(m))).join(', ')
    const links = m.attachments.map(t => t.link).join(', ')
    arr.push({
      body: `<p>Voice mail: ${links} - ${n ? desc : ''} <b>${n}</b> ${dayjs(m.creationTime).format('MMM DD, YYYY HH:mm')}</p>`,
      id: m.id,
      stamp: dayjs(m.creationTime).valueOf(),
      contactId
    })
  }
  return arr
}

function buildKey (id, cid, email) {
  return `rc-log-${email}-${cid}-${id}`
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
    const key = buildKey(m.id, m.contactId, email)
    const ig = await ls.get(key)
    if (!ig) {
      res.push(m)
    }
  }
  return res
}

function getStamp (body) {
  const t = _.get(body, 'call.startTime') || _.get(body, 'conversation.messages[0].creationTime') || Date.now()
  // console.log('call.startTime', _.get(body, 'call.startTime'))
  // console.log('conversation.messages[0].creationTime', _.get(body, 'conversation.messages[0].creationTime'))
  // console.log('Date.now', Date.now())
  return dayjs(t).valueOf()
}

/**
 * for current contact, only one contact name is enough,
 * need search for matched number to confirm if the contact is caller or callee
 * @param {array} list from or to list
 * @param {*} contact current hubspot contact to sync to
 */
function parseLogName (list, contact) {
  const inList = list.map(d => d.id).includes(contact.id)
  return inList ? contact.name : list.map(d => d.name).join(', ')
}

async function doSyncOne (contact, body, formData, isManuallySync) {
  const { id: contactId, isCompany } = contact
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
  const { ownerId } = window.rc
  if (!ownerId) {
    return
  }
  const email = getEmail()
  // let now = +new Date()
  const contactIds = isCompany ? [] : [Number(contactId)]
  const toNumber = getFullNumber(_.get(body, 'call.to'))
  const fromNumber = getFullNumber(_.get(body, 'call.from'))
  const fmtime = dayjs(_.get(body, 'call.startTime')).format('MMM DD, YYYY h:mm A')
  const stamp = getStamp(body)
  const status = 'COMPLETED'
  let durationMilliseconds = _.get(body, 'call.duration')
  durationMilliseconds = durationMilliseconds
    ? durationMilliseconds * 1000
    : undefined
  const externalId = buildId(body)
  const recording = _.get(body, 'call.recording')
    ? `<p>Recording link: ${body.call.recording.link}</p>`
    : ''
  const recordingUrl = _.get(body, 'call.recording')
    ? ringCentralConfigs.mediaPlayUrl + encodeURIComponent(body.call.recording.contentUri)
    : undefined
  const dealIds = await getDeals(contactId)
  let mainBody = ''
  const ctype = _.get(body, 'conversation.type')
  const isVoiceMail = ctype === 'VoiceMail'
  const logSMSAsThread = await ls.get('rc-logSMSAsThread') || false
  if (body.call) {
    const direction = _.get(body, 'call.direction')
    mainBody = `${fmtime}: [${direction} ${_.get(body, 'call.result')}] CALL from <b>${parseLogName(body.call.fromMatches, contact)}</b>(<b>${formatPhoneLocal(fromNumber)}</b>) to <b>${parseLogName(body.call.toMatches, contact)}</b>(<b>${formatPhoneLocal(toNumber)}</b>)`
  } else if (ctype === 'SMS') {
    mainBody = buildMsgs(body, contactId, logSMSAsThread)
  } else if (isVoiceMail) {
    mainBody = buildVoiceMailMsgs(body, contactId)
  }
  const interactionType = body.call || isVoiceMail ? 'CALL' : rc.logSMSType
  const logType = body.call || isVoiceMail ? 'Call' : ctype
  if (!_.isArray(mainBody)) {
    mainBody = [{
      body: mainBody,
      id: externalId,
      contactId
    }]
  }
  if (!isManuallySync) {
    mainBody = await filterLoggered(mainBody, email)
  }
  const descFormatted = (desc || '')
    .split('\n')
    .map(d => `<p>${d}</p>`)
    .join('')
  const bodyAll = mainBody.map(mm => {
    return {
      ...mm,
      id: mm.id,
      body: `<div>${descFormatted}</div><p>${mm.body}</p>${recording}`
    }
  })
  for (const uit of bodyAll) {
    let res = null
    if (uit.isSMS) {
      res = await logSMS(uit, contact.id)
    }
    if (!res) {
      // const companyId = isCompany
      //   ? contactId
      //   : await getCompanyId(contactId)
      const data = {
        engagement: {
          active: true,
          ownerId,
          type: interactionType,
          timestamp: uit.stamp || stamp
        },
        associations: {
          contactIds,
          companyIds: [],
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
          recordingUrl,
          ...getCallInfo(contact, toNumber, fromNumber)
        }
      }
      res = await createCallLog({
        data,
        isManuallySync,
        id: uit.id
      })
    } else {
      res = {
        result: {
          engagement: copy(res)
        }
      }
    }
    // let res = await fetch.post(url, data, commonFetchOptions())
    const engagement = _.get(
      res,
      'result.engagement'
    )
    if (engagement) {
      await updateCallLogStatus(formData.callResult, engagement.id)
      notifySyncSuccess({
        id: contactId,
        logType,
        interactionType,
        isCompany,
        requestId: body.requestId,
        sessionIds: bodyAll.map(t => t.id)
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
  const sessionIds = _.get(data, 'body.sessionIds') || _.get(data, 'body.conversationLogIds') || []
  if (!sessionIds.length) {
    return {}
  }
  let r = await checkCallLog(sessionIds)
  if (r && r.result) {
    r = r.result.reduce((p, d) => {
      const sid = d.sessionId
      prev[sid] = prev[sid] || []
      prev[sid].push({
        id: d.id,
        note: ''
      })
    }, {})
  }
  return r
}
