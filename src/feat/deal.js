/**
 * fetch deals linked to contact
 */
import _ from 'lodash'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import { commonFetchOptions, getPortalId, getEmail } from '../common/common'

const {
  apiServerHS
} = thirdPartyConfigs

export async function getDeals (contactId, dealId) {
  const pid = getPortalId()
  const email = getEmail()
  const url = `${apiServerHS}/contacts/search/v1/search/deals?portalId=${pid}&clienttimeout=60000`
  const filters = dealId
    ? [
        {
          operator: 'EQ',
          property: 'hs_object_id',
          value: dealId
        }
      ]
    : [
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
  const data = {
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
  const res = await fetchBg(url, {
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
  const deals = _.get(res, 'deals') || []
  return deals.map(d => d.dealId)
}
