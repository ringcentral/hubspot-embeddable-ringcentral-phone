/**
 * third party activies related feature
 */

import _ from 'lodash'
import {
  notify,
  host
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import { commonFetchOptions, getPortalId } from './common'

export function showActivityDetail (body) {
  let { activity = {} } = body
  let {
    subject,
    body: notes
  } = activity
  let msg = `
    <div class="wordbreak">
      <div class="rc-pd1b">
        <b>Subject: ${subject}</b>
      </div>
      <div class="rc-pd1b">
        ${notes || 'no notes'}
      </div>
    </div>
  `
  notify(msg, 'info', 8000)
}

function formatEngagements (arr, contact) {
  return arr.map(item => {
    return {
      id: _.get(item, 'eventData.engagement.id') || _.get(item, 'eventData.id'),
      subject: _.get(item, 'eventData.engagement.type') || _.get(item, 'eventData.etype') || 'Unknown',
      time: _.get(item, 'eventData.engagement.createdAt') || _.get(item, 'eventData.timestamp'),
      body: _.get(item, 'eventData.metadata.body') || '',
      contact
    }
  })
    .filter(d => d.id)
    .sort((a, b) => {
      return b.time - a.time
    })
  /*
    [
      {
        id: '123',
        subject: 'Title',
        time: 1528854702472
      }
    ]
  */
}

export async function getActivities (body) {
  let id = _.get(body, 'contact.id')
  let tp = _.get(body, 'contact.isCompany') ? 'Companies' : 'Contacts'
  if (!id) {
    return []
  }
  // https://app.hubspot.com/api-passthrough/timeline/v2/Contacts/101/default?portalId=4920570&clienttimeout=5000&limit=5
  let url = `${host}/api-passthrough/timeline/v2/${tp}/${id}/default?portalId=${getPortalId()}&clienttimeout=5000&limit=10`
  let res = await fetch.get(url, commonFetchOptions())
  if (res && res.events) {
    return formatEngagements(res.events, body.contact)
  } else {
    console.log('fetch engagements error')
    console.log(res)
  }
  return []
}
