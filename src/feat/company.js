import { jsonHeader } from 'ringcentral-embeddable-extension-common/src/common/fetch'
import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import { getPortalId, getCSRFToken } from '../common/common'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import _ from 'lodash'
import {
  formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'

const {
  serviceName,
  apiServerHS
} = thirdPartyConfigs

export async function getAllCompany (
  offset = 0,
  limit = 250,
  getRecent = false
) {
  return {
    companies: [],
    'has-more': false,
    offset
  }
  // let portalId = getPortalId()
  // const baseUrl = getRecent
  //   ? '/crm/v3/objects/companies'
  //   : '/companies/v2/companies/paged'
  // let url = `${apiServerHS}${baseUrl}?portalId=${portalId}&clienttimeout=60000&limit=${limit}&properties=name&properties=phone&includeMergeAudits=false&propertyMode=value_only&offset=${offset}`
  // let headers = {
  //   ...jsonHeader,
  //   Accept: 'application/json, text/javascript, */*; q=0.01',
  //   'X-HS-Referer': window.location.href,
  //   'X-HubSpot-CSRF-hubspotapi': getCSRFToken()
  // }
  // let res = await fetchBg(url, {
  //   headers,
  //   method: 'get'
  // })
  // if (res && res.companies) {
  //   return res
  // } else {
  //   console.log('fetch companies error')
  //   console.log(res)
  //   return {
  //     companies: [],
  //     'has-more': true,
  //     offset
  //   }
  // }
}

async function getCompany (
  page = 1,
  id = '',
  offset
) {
  const count = 100
  const vidOffset = offset || (page - 1) * count
  const portalId = getPortalId()
  const url = `${apiServerHS}/contacts/search/v1/search/companies/v2?portalId=${portalId}&clienttimeout=60000`
  const filterGroups = id
    ? [
        {
          filters: [{
            operator: 'EQ',
            property: 'companyId',
            value: id.toString()
          }]
        }
      ]
    : []
  const data = {
    offset: vidOffset,
    count,
    filterGroups,
    // properties: [],
    sorts: [
      {
        property: 'createdate',
        order: 'DESC'
      }, {
        property: 'companyId',
        order: 'DESC'
      }
    ],
    query: ''
  }
  const headers = {
    ...jsonHeader,
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'X-HS-Referer': window.location.href,
    'X-HubSpot-CSRF-hubspotapi': getCSRFToken()
  }
  const res = await fetchBg(url, {
    body: data,
    headers,
    method: 'post'
  })
  if (res && res.companies) {
    return res
  } else {
    console.log('fetch companies error')
    console.log(res)
    return {
      companies: [],
      'has-more': false,
      offset: vidOffset
    }
  }
}

export function formatCompanyContact (companyInfo) {
  const phoneNumber = _.get(
    companyInfo,
    'properties.phone.value'
  )
  const phoneNumbers = phoneNumber
    ? [{
        phoneNumber,
        phoneType: 'directPhone'
      }]
    : []
  let name = _.get(companyInfo, 'properties.name.value') || 'no name'
  name = `[Company] ${name}`
  return {
    id: companyInfo.companyId + '',
    type: serviceName,
    name,
    firstname: '',
    lastname: '',
    emails: [],
    phoneNumbers,
    phoneNumbersForSearch: phoneNumbers.map(
      d => formatPhone(d.phoneNumber)
    ).join(','),
    portalId: companyInfo.portalId + '',
    isCompany: '1'
  }
}

export async function getCompanyById (id) {
  const comps = await getCompany(1, id)
  if (comps && comps.companies && comps.companies.length) {
    return formatCompanyContact(comps.companies[0])
  }
}
