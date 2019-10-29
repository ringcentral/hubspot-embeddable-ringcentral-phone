/**
 * fetch deals linked to contact
 */
import _ from 'lodash'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import { commonFetchOptions, getPortalId, getEmail } from './common'

let {
  apiServerHS
} = thirdPartyConfigs

export async function getDeals (contactId, dealId) {
  let pid = getPortalId()
  let email = getEmail()
  let url = `${apiServerHS}/contacts/search/v1/search/deals?portalId=${pid}&clienttimeout=60000`
  let filters = dealId
    ? [
      {
        operator: 'EQ',
        property: 'hs_object_id',
        value: dealId
      }
    ] : [
      {
        operator: 'EQ',
        property: 'associations.contact',
        value: contactId.toString()
      }, {
        operator: 'NOT_IN',
        property: 'dealstage',
        values: ['closedlost', 'closedwon']
      }
    ]
  let data = {
    offset: 0,
    count: 100,
    filterGroups: [{
      filters
    }],
    sorts: [{
      property: 'closedate',
      order: 'DESC'
    }, {
      property: 'dealId',
      order: 'DESC'
    }],
    query: ''
  }
  let res = await fetchBg(url, {
    method: 'post',
    body: data,
    headers: {
      ...commonFetchOptions().headers,
      'X-Source': 'CRM_UI',
      'X-SourceId': email
    }
  })
  if (dealId) {
    return _.get(res, 'deals[0]')
  }
  let deals = _.get(res, 'deals') || []
  return deals.map(d => d.dealId)
}
