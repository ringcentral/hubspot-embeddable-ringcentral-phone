import { jsonHeader } from 'ringcentral-embeddable-extension-common/src/common/fetch'
import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import { getPortalId, getCSRFToken } from './common'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import _ from 'lodash'
import {
  formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'

let {
  serviceName,
  apiServerHS
} = thirdPartyConfigs

export async function getAllCompany (offset = 0, limit = 250) {
  let portalId = getPortalId()
  let url = `${apiServerHS}/companies/v2/companies/paged?portalId=${portalId}&clienttimeout=60000&limit=${limit}&properties=name&properties=phone&includeMergeAudits=false&propertyMode=value_only&offset=${offset}`
  let headers = {
    ...jsonHeader,
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'X-HS-Referer': window.location.href,
    'X-HubSpot-CSRF-hubspotapi': getCSRFToken()
  }
  let res = await fetchBg(url, {
    headers,
    method: 'get'
  })
  if (res && res.companies) {
    return res
  } else {
    console.log('fetch companies error')
    console.log(res)
    return {
      companies: [],
      'has-more': false,
      offset
    }
  }
}

async function getCompany (
  page = 1,
  id = '',
  offset
) {
  let count = 100
  let vidOffset = offset || (page - 1) * count
  let portalId = getPortalId()
  let url = `${apiServerHS}/contacts/search/v1/search/companies/v2?portalId=${portalId}&clienttimeout=60000`
  let filterGroups = id
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
  let data = {
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
  let headers = {
    ...jsonHeader,
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'X-HS-Referer': window.location.href,
    'X-HubSpot-CSRF-hubspotapi': getCSRFToken()
  }
  let res = await fetchBg(url, {
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
      'offset': vidOffset
    }
  }
}

export function formatCompanyContact (companyInfo) {
  let phoneNumber = _.get(
    companyInfo,
    'properties.phone.value'
  )
  let phoneNumbers = phoneNumber
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
  console.log('getCompanyById')
  let comps = await getCompany(1, id)
  if (comps && comps.companies && comps.companies.length) {
    return formatCompanyContact(comps.companies[0])
  }
}
