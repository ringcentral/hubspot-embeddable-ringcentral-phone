/**
 * call log sync feature
 */

import {thirdPartyConfigs} from '../common/app-config'
import {createForm} from '../common/call-log-sync-form'
import extLinkSvg from '../common/link-external.svg'
import {
  showAuthBtn
} from './auth'
import _ from 'lodash'
import {getContacts} from './contacts'
import {
  notify,
  host,
  formatPhone,
  commonFetchOptions
} from '../common/helpers'
import fetch from '../common/fetch'

let {
  showCallLogSyncForm,
  serviceName,
  apiServerHS
} = thirdPartyConfigs

function getPortalId() {
  let dom = document.querySelector('.navAccount-portalId')
  return dom
    ? dom.textContent.trim()
    : ''
}

function notifySyncSuccess({
  id
}) {
  let type = 'success'
  let portalId = getPortalId()
  let url = `${host}/contacts/${portalId}/contact/${id}/?interaction=call`
  let msg = `
    <div>
      <div class="rc-pd1b">
        Call log synced to hubspot!
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

export async function syncCallLogToThirdParty(body) {
  let result = _.get(body, 'call.result')
  if (result !== 'Call connected') {
    return
  }
  let isManuallySync = !body.triggerType
  let isAutoSync = body.triggerType === 'callLogSync'
  if (!isAutoSync && !isManuallySync) {
    return
  }
  if (!window.rc.local.accessToken) {
    return isManuallySync ? showAuthBtn() : null
  }
  if (showCallLogSyncForm && isManuallySync) {
    return createForm(
      body.call,
      serviceName,
      (formData) => doSync(body, formData)
    )
  } else {
    doSync(body, {})
  }
}

async function getContactId(body) {
  if (body.call) {
    let obj = _.find(
      [
        ...body.call.toMatches,
        ...body.call.fromMatches
      ],
      m => m.type === serviceName
    )
    return obj ? obj.id : null
  }
  else {
    let n = body.direction === 'Outbound'
      ? body.to.phoneNumber
      : body.from.phoneNumber
    let fn = formatPhone(n)
    let contacts = await getContacts()
    let res = _.find(
      contacts,
      contact => {
        let {
          phoneNumbers
        } = contact
        return _.find(phoneNumbers, nx => {
          return fn === formatPhone(nx.phoneNumber)
        })
      }
    )

    return _.get(res, 'id')
  }
}

async function getOwnerId() {
  let emailDom = document.querySelector('.user-info-email')
  if (!emailDom) {
    return
  }
  let email = emailDom.textContent.trim()
  let url = `${apiServerHS}/owners/v2/owners/?email=${email}`
  let res = await fetch.get(url, commonFetchOptions())
  let ownerId = ''
  if (res && res.length) {
    ownerId = _.get(res, '[0].ownerId')
  } else {
    console.log('fetch ownerId error')
    console.log(res)
  }
  return ownerId
    ? parseInt(ownerId, 10)
    : ''
}

async function doSync(body, formData) {
  let contactId = await getContactId(body)
  if (!contactId) {
    return notify('no related contact', 'warn')
  }
  let ownerId = await getOwnerId()
  if (!ownerId) {
    return
  }
  let now = + new Date()
  let contactIds = [contactId]
  let toNumber = _.get(body, 'call.to.phoneNumber')
  let fromNumber = _.get(body, 'call.from.phoneNumber')
  let status = 'COMPLETED'
  let durationMilliseconds = body.call.duration * 1000
  let externalId = body.id || body.call.sessionId
  let data = {
    engagement: {
      active: true,
      ownerId,
      type: 'CALL',
      timestamp: now
    },
    associations: {
      contactIds,
      companyIds: [],
      dealIds: [],
      ownerIds: []
    },
    attachments: [],
    metadata: {
      externalId,
      body: formData.description,
      toNumber,
      fromNumber,
      status,
      durationMilliseconds
    }
  }
  let url = `${apiServerHS}/engagements/v1/engagements`
  let res = await fetch.post(url, data, commonFetchOptions())
  if (res && res.engagement) {
    notifySyncSuccess({id: contactId})
  } else {
    notify('call log sync to hubspot failed', 'warn')
    console.log('post engagements/v1/engagements error')
    console.log(res)
  }
}
