/**
 * update call log after call updated
 */

/**
https://api.hubspot.com/engagements/v2/engagements/7716693999?portalId=6879799&clienttimeout=14000

{"properties":[{"name":"hs_at_mentioned_owner_ids","value":""},{"name":"hs_call_disposition","value":"f240bbac-87c9-4f6e-bf70-924b57d47db7"}]}

 */
import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import { getPortalId, commonFetchOptions, getEmail } from '../common/common'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
// import _ from 'lodash'

const {
  apiServerHS
} = thirdPartyConfigs

export default async function (eid, statusId) {
  if (!statusId) {
    return
  }
  const portalId = getPortalId()
  const email = getEmail()
  const url = `${apiServerHS}/engagements/v2/engagements/${eid}?portalId=${portalId}&clienttimeout=14000`
  const body = {
    properties: [
      {
        name: 'hs_at_mentioned_owner_ids',
        value: ''
      }, {
        name: 'hs_call_disposition',
        value: statusId
      }
    ]
  }
  await fetchBg(url, {
    body,
    method: 'put',
    headers: {
      ...commonFetchOptions().headers,
      'X-Source': 'CRM_UI',
      'X-SourceId': email
    }
  })
}
