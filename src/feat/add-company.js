import { jsonHeader } from 'ringcentral-embeddable-extension-common/src/common/fetch'
import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import { getCSRFToken, getPortalId } from './common'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
// import _ from 'lodash'

let {
  apiServerHS
} = thirdPartyConfigs

/**
https://api.hubapi.com/companies/v2/companies?hapikey=demo

Example POST body:
{
  "properties": [
    {
      "name": "name",
      "value": "A company name"
    },
    {
      "name": "description",
      "value": "A company description"
    }
  ]
}

Remote Address: 104.16.249.5:443
Referrer Policy: no-referrer-when-downgrade
access-control-allow-credentials: false
cf-ray: 4d7131c9ad11c011-MRS
content-encoding: br
content-type: application/json
date: Wed, 15 May 2019 01:03:51 GMT
expect-ct: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
server: cloudflare
status: 200
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-trace: 2B2C943F2ECF000C28F82D27DA8329CDFA145E7C40000000000000000000
Provisional headers are shown
Accept: application/json, text/javascript,  q=0.01
content-type: application/json
Origin: https://api.hubspot.com
Referer: https://api.hubspot.com/cors-preflight-iframe/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.108 Safari/537.36
X-HS-Referer: https://app.hubspot.com/contacts/4920570/contacts/list/view/all/?_ga=2.215026327.1483563204.1557882064-8937282.1537232161
X-HubSpot-CSRF-hubspotapi: 4MzzO2ABOkozm1xSiqRV8Q
X-Properties-Source: CONTACTS
X-Properties-SourceId: CRM_UI
portalId: 4920570
clienttimeout: 14000

request payload
 */
/*
{
  "properties": [{
    "value": "lead",
    "property": "lifecyclestage",
    "source-id": "zxdong@gmail.com",
    "source": "CRM_UI"
  }, {
    "value": 33620723,
    "property": "hubspot_owner_id",
    "source-id": "zxdong@gmail.com",
    "source": "CRM_UI"
  }, {
    "value": "aa@aa.com",
    "property": "email",
    "source-id": "zxdong@gmail.com",
    "source": "CRM_UI"
  }, {
    "value": "z",
    "property": "firstname",
    "source-id": "zxdong@gmail.com",
    "source": "CRM_UI"
  }, {
    "value": "b",
    "property": "lastname",
    "source-id": "zxdong@gmail.com",
    "source": "CRM_UI"
  }]
}
*/

// let ownerIdGlob = null

// async function getUserId () {
//   let pid = getPortalId()
//   let url = `${apiServerHS}/login-verify/hub-user-info?early=true&portalId=${pid}`
//   let res = await fetchBg(url, {
//     headers: commonFetchOptions().headers
//   })
//   // let res = await fetch.get(url, commonFetchOptions())
//   let ownerId = ''
//   if (res && res.user) {
//     ownerId = _.get(res, 'user.user_id')
//   } else {
//     console.log('fetch ownerId error')
//     console.log(res)
//   }
//   ownerIdGlob = ownerId
//   return ownerId
// }

export async function addCompany ({
  name, desc
}) {
  let portalId = getPortalId()
  // const oid = ownerIdGlob || await getUserId()
  // https://api.hubapi.com/contacts/v1/lists/all/contacts/all
  //  let url =`${apiServerHS}/contacts/v1/lists/all/contacts/all?count=${count}&vidOffset=${vidOffset}&property=firstname&property=phone&property=lastname&property=mobilephone&property=company`

  let url = `${apiServerHS}/companies/v2/companies?portalId=${portalId}&clienttimeout=1400`
  let data = {
    properties: [
      {
        value: name,
        name: 'name'
      },
      {
        value: desc,
        name: 'description'
      }
    ]
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
  // console.log(res, '00000')
  return res
}
