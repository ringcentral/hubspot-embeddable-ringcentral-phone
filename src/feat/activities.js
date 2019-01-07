/**
 * third party activies related feature
 */

import {thirdPartyConfigs} from 'ringcentral-embeddable-extension-common/src/common/app-config'
import _ from 'lodash'
import {
  notify
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import {commonFetchOptions} from './common'

let {
  apiServerHS
} = thirdPartyConfigs

export function showActivityDetail(body) {
  let {activity = {}} = body
  let {
    subject,
    body: notes
  } = activity
  let msg = `
    <div>
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

function formatEngagements(arr, contact) {
  return arr.map(item => {
    return {
      id: item.engagement.id,
      subject: item.engagement.type,
      time: item.engagement.createdAt,
      body: item.metadata.body,
      contact
    }
  })
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

export async function getActivities(body) {
  ///engagements/v1/engagements/associated/:objectType/:objectId/paged
  let id = _.get(body, 'contact.id')
  if (!id) {
    return []
  }
  let url = `${apiServerHS}/engagements/v1/engagements/associated/contact/${id}/paged`
  let res = await fetch.get(url, commonFetchOptions())
  if (res && res.results) {
    return formatEngagements(res.results, body.contact)
  } else {
    console.log('fetch engagements error')
    console.log(res)
  }
  return []
}

