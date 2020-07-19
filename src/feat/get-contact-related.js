/**
 * get contact related deals/tasks
 */

/*
GET /crm-associations/v1/associations/:objectId/HUBSPOT_DEFINED/:definitionId
Contact to engagement	9
Contact to deal	4
*/

import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import { commonFetchOptions, getPortalId, getEmail } from './common'
import _ from 'lodash'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'

let {
  apiServerHS
} = thirdPartyConfigs

/**
 * 
 * @param {string} contactId
 * @param {string} defId
 */
async function getRelated (contactId, defId, limit = 100, offset = 0) {
  let pid = getPortalId()
  let email = getEmail()
  let url = `${apiServerHS}/crm-associations/v1/associations/${contactId}/HUBSPOT_DEFINED/${defId}?limit=${limit}&offset=${offset}`
}

export async function getContactDeals (contactId, defId) {
  let pid = getPortalId()
  let email = getEmail()
  let url = `${apiServerHS}/crm-associations/v1/associations/${contactId}/HUBSPOT_DEFINED/${defId}`
}

/**
 *
 * https://api.hubspot.com/contacts/search/v1/search/engagements?portalId=6879799&clienttimeout=60000

{
  offset: 0,
  count: 25,
  filterGroups: [
    {
      filters: [
        {
          operator: 'IN',
          property: 'task.status',
          values: [
            'NOT_STARTED',
            'IN_PROGRESS',
            'WAITING',
            'DEFERRED'
          ],
          default: true
        },
        {
          operator: 'EQ',
          property: 'engagement.ownerId',
          value: '41390294'
        },
        {
          operator: 'EQ',
          property: 'engagement.type',
          value: 'TASK'
        }
      ]
    }
  ],
  sorts: [
    {
      property: 'engagement.timestamp',
      order: 'ASC'
    },
    {
      property: 'engagement.id',
      order: 'DESC'
    }
  ],
  query: ''
}
 */
export async function getContactTasks (contactId) {
  let pid = getPortalId()
  let email = getEmail()
  let url = `https://api.hubspot.com/contacts/search/v1/search/engagements?portalId=${pid}&clienttimeout=60000`
  const data = {
    offset: 0,
    count: 25,
    filterGroups: [
      {
        filters: [
          {
            operator: 'IN',
            property: 'task.status',
            values: [
              'NOT_STARTED',
              'IN_PROGRESS',
              'WAITING',
              'DEFERRED'
            ],
            default: true
          },
          {
            operator: 'EQ',
            property: 'engagement.ownerId',
            value: '41390294'
          },
          {
            operator: 'EQ',
            property: 'engagement.type',
            value: 'TASK'
          }
        ]
      }
    ],
    sorts: [
      {
        property: 'engagement.timestamp',
        order: 'ASC'
      },
      {
        property: 'engagement.id',
        order: 'DESC'
      }
    ],
    query: `objectType=CONTACT&objectId=${contactId}`
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
  console.log('fffff')
  console.log(res)
}
