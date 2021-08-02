/**
 * call/message log sync feature
 */

import { ringCentralConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import extLinkSvg from 'ringcentral-embeddable-extension-common/src/common/link-external.svg'
import searchPhone from '../common/search'
import _ from 'lodash'
import {
  host,
  formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import {
  notify
} from '../common/notify'
import { getFullNumber, rc, getPortalId, formatPhoneLocal, autoLogPrefix } from '../common/common'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import copy from 'json-deep-copy'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid/non-secure'
import { createCallLog, updateCallLogStatus, autoCallLog } from '../common/log-call'
import logSMS from '../common/log-sms'
import { getContactInfo } from '../common/get-contact-info'
import { message } from 'antd'
import getCid from '../common/get-contact-id'
import md5 from 'blueimp-md5'

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

let msgShow = false

function showMatchingMessage () {
  if (msgShow) {
    return
  }
  msgShow = true
  message.loading({
    content: 'Matching contacts, please wait',
    duration: 3,
    onClose: () => {
      msgShow = false
    }
  })
}

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
  const msg = (
    <div>
      <div class='rc-pd1b'>
        {logType} log synced to hubspot!
      </div>
      <div class='rc-pd1b'>
        <a href={url} target='_blank' rel='noreferrer'>
          <img src={extLinkSvg} width={16} height={16} class='rc-iblock rc-mg1r' />
          <span class='rc-iblock'>
            Check contact activities
          </span>
        </a>
      </div>
    </div>
  )
  notify(msg, type, 9000)
  window.postMessage({
    type: 'rc-sync-log-success',
    requestId,
    sessionIds
  }, '*')
}

// const prev = {
//   time: Date.now(),
//   sessionId: '',
//   body: {}
// }

// function checkMerge (body) {
//   const maxDiff = 100
//   const now = Date.now()
//   const sid = _.get(body, 'conversation.conversationId')
//   const type = _.get(body, 'conversation.type')
//   if (type !== 'SMS') {
//     return body
//   }
//   if (prev.sessionId === sid && prev.time - now < maxDiff) {
//     console.log('trigger merger')
//     let msgs = [
//       ...body.conversation.messages,
//       ...prev.body.conversation.messages
//     ]
//     msgs = _.uniqBy(msgs, (e) => e.id)
//     body.conversation.messages = msgs
//     prev.body = copy(body)
//     return body
//   } else {
//     console.log('not trigger merger')
//     prev.time = now
//     prev.sessionId = sid
//     prev.body = copy(body)
//     return body
//   }
// }

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
  if (!window.rc.ownerId) {
    return null
  }
  const id = buildId(body)
  if (isAutoSync && body.call) {
    const sid = autoLogPrefix + id
    const autoLogged = await ls.get(sid)
    if (autoLogged) {
      return false
    }
  }
  // body = checkMerge(body)
  const info = getContactInfo(body)
  showMatchingMessage()
  const relatedContacts = await searchPhone(info.numbers)
  const obj = {
    type: 'rc-init-call-log-form',
    isManuallySync,
    callLogProps: {
      relatedContacts,
      info,
      id,
      isManuallySync,
      body
    }
  }
  if (isManuallySync) {
    if (
      !relatedContacts ||
      !relatedContacts.length
    ) {
      const b = copy(body)
      Object.assign(b, info)
      b.type = 'rc-show-add-contact-panel'
      return window.postMessage(b, '*')
    }
    window.postMessage(obj, '*')
  } else {
    window.postMessage(obj, '*')
  }
}

function getVoiceMailResultId () {
  const i = window.rc.callResultList.find(d => d.label.toLowerCase.includes('voicemail'))
  return i ? i.id : ''
}

function getDefaultResultId () {
  const i = window.rc.callResultList.find(d => d.label.toLowerCase.includes('connected'))
  return i ? i.id : ''
}

/**
 * sync call log action
 * todo: need you find out how to do the sync
 * you may check the CRM site to find the right api to do it
 * @param {*} body
 * @param {*} formData
 */
export async function doSync (
  body,
  formData,
  isManuallySync,
  contacts,
  info
) {
  if (!contacts || !contacts.length) {
    return false
  } else if (contacts.length > 1 && !window.rc.autoSyncToAll) {
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
      id: md5(ms.map(s => s.id).join(',')),
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
    const fromNumber = getFullNumber(_.get(m, 'from[0]') || _.get(m, 'from'))
    const toNumber = getFullNumber(
      _.get(m, 'to[0]') ||
      _.get(m, 'to')
    )
    arr.push({
      body: `<p>${m.direction} voicemail: ${links} - ${n ? desc : ''} <b>${n}</b> ${dayjs(m.creationTime).format('MMM DD, YYYY HH:mm')}</p>`,
      id: m.id,
      stamp: dayjs(m.creationTime).valueOf(),
      contactId,
      toNumber,
      fromNumber
    })
  }
  return arr
}

function getCallInfo (contact, toNumber, fromNumber, contactId) {
  const cnums = contact.phoneNumbers.map(n => formatPhone(n.phoneNumber))
  const fn = formatPhone(fromNumber)
  const tn = formatPhone(toNumber)
  if (cnums.includes(tn)) {
    return {
      calleeObjectType: 'CONTACT',
      calleeObjectId: contactId
    }
  } else if (cnums.includes(fn)) {
    return {
      callerObjectType: 'CONTACT',
      callerObjectId: contactId
    }
  }
  return {}
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

function buildVoicemailData (uit, status) {
  return {
    externalId: uit.id,
    body: uit.body,
    toNumber: formatPhone(uit.toNumber),
    fromNumber: formatPhone(uit.fromNumber),
    status,
    durationMilliseconds: 0,
    callerObjectType: 'CONTACT',
    callerObjectId: uit.contactId
  }
}

async function doSyncOne (contact, body, formData, isManuallySync) {
  const { id: contactIdPid, isCompany } = contact
  const contactId = getCid(contactIdPid)
  if (isCompany) {
    return
  }
  if (!contactId) {
    return notify('No related contact', 'warn')
  }
  let desc = formData.description
  const sid = _.get(body, 'call.sessionId') || 'not-exist'
  const sessid = autoLogPrefix + sid
  if (!isManuallySync) {
    desc = await ls.get(sessid) || ''
  }
  const { ownerId } = window.rc
  if (!ownerId) {
    return
  }
  // const email = getEmail()
  // let now = +new Date()
  const contactIds = isCompany ? [] : [Number(contactId)]
  const toNumber = getFullNumber(_.get(body, 'call.to'))
  const fromNumber = getFullNumber(_.get(body, 'call.from'))
  // const fmtime = dayjs(_.get(body, 'call.startTime')).format('MMM DD, YYYY h:mm A')
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
  const dealIds = []
  let mainBody = ''
  const ctype = _.get(body, 'conversation.type')
  const isVoiceMail = ctype === 'VoiceMail'
  const logSMSAsThread = await ls.get('rc-logSMSAsThread') || false
  if (body.call) {
    const direction = _.get(body, 'call.direction')
    mainBody = `[${direction} ${_.get(body, 'call.result')}] CALL from <b>${parseLogName(body.call.fromMatches, contact)}</b>(<b>${formatPhoneLocal(fromNumber)}</b>) to <b>${parseLogName(body.call.toMatches, contact)}</b>(<b>${formatPhoneLocal(toNumber)}</b>)`
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
      res = await logSMS(uit, contactId, isManuallySync)
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
        metadata: isVoiceMail
          ? buildVoicemailData(uit)
          : {
              externalId: uit.id,
              body: uit.body,
              toNumber,
              fromNumber,
              status,
              durationMilliseconds,
              recordingUrl,
              ...getCallInfo(contact, toNumber, fromNumber, contactId)
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
      if (!uit.isSMS) {
        const resultId = isVoiceMail
          ? getVoiceMailResultId()
          : formData.callResult || getDefaultResultId()
        await updateCallLogStatus(resultId, engagement.id)
      }
      if (!engagement.skipped) {
        notifySyncSuccess({
          id: contactId,
          logType,
          interactionType,
          isCompany,
          requestId: body.requestId,
          sessionIds: bodyAll.map(t => t.id)
        })
      }
    } else {
      notify('call log sync to hubspot failed', 'warn')
      console.log(res)
    }
    window.postMessage({
      type: 'rc-call-log-form-hide'
    }, '*')
  }
}

async function afterCallLogOne (data) {
  return autoCallLog(data)
}

export function setCallHandled (sessId) {
  const id = autoLogPrefix + sessId
  return ls.set(id, '1')
}

export async function afterCallLog (contacts, sessId, data) {
  message.success({
    content: 'Submitting, please wait',
    duration: 3
  })
  // await setCallHandled(sessId)
  const all = contacts.map(c => {
    return afterCallLogOne({
      oid: c.split('-')[1],
      sessId,
      note: data.description,
      callResult: data.callResult
    })
  })
  await Promise.all(all)
  message.success({
    content: 'Submitted, may take up to 30 seconds to show',
    duration: 3
  })
}
