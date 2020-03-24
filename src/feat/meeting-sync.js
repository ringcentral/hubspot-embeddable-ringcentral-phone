/**
 * sync meeting from rc to hs
 */

import { render } from 'react-dom'
import {
  createElementFromHTML
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import MeetingSelect from './meeting-select'
import './meeting-sync.styl'

/**
 * ..Request URL: https://api.hubspot.com/engagements/v1/engagements/?portalId=4920570&clienttimeout=14000
Request Method: POST
Status Code: 200
Remote Address: 104.16.252.5:443
Referrer Policy: no-referrer-when-downgrade
access-control-allow-credentials: true
access-control-allow-headers: Origin, X-Requested-With, Content-Type, Accept, Accept-Charset, Accept-Encoding, X-Override-Internal-Permissions, X-Properties-Source, X-Properties-SourceId, X-Properties-Flag, X-Hubspot-User-Id, X-Hubspot-Trace, X-Hubspot-Callee, X-Hubspot-Offset, X-Hubspot-No-Trace, X-HubSpot-Request-Source, X-HubSpot-Request-Reason, Subscription-Billing-Auth-Token, X-App-CSRF, X-Tools-CSRF, Online-Payment-Signing-UUID, X-Source, X-SourceId
access-control-allow-methods: GET, OPTIONS, PUT, POST, DELETE, PATCH, HEAD
access-control-allow-origin: https://app.hubspot.com
access-control-expose-headers: x-last-modified-timestamp, X-HubSpot-NotFound, X-HS-User-Request, Link, Server-Timing
access-control-max-age: 604800
cf-cache-status: DYNAMIC
cf-ray: 575b525a582b273c-FRA
content-encoding: br
content-type: application/json;charset=utf-8
date: Wed, 18 Mar 2020 01:53:44 GMT
expect-ct: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
server: cloudflare
status: 200
strict-transport-security: max-age=31536000; includeSubDomains; preload
timing-allow-origin: *
vary: Accept-Encoding
x-trace: 2B591BAA1EF8435C98458DF82DCB0CC568A3E039AB000000000000000000
:authority: api.hubspot.com
:method: POST
:path: /engagements/v1/engagements/?portalId=4920570&clienttimeout=14000
:scheme: https
accept: application/json, text/javascript,; q=0.01
accept-encoding: gzip, deflate, br
accept-language: en,zh-CN;q=0.9,zh;q=0.8
content-length: 1436
content-type: application/json
cookie: __cfduid=d0758c391dcfaa1e2ca6ff138ee35e3c61583330315; _gcl_au=1.1.524609617.1583330316; initialTrafficSource=utmcsr=(direct)|utmcmd=(none)|utmccn=(not set); __utmzzses=1; _ga=GA1.2.1593919729.1583330317; _gaexp=GAX1.2.lWeKZzbBRDS40d0miqxocw.18403.0; _fbp=fb.1.1583330318816.1757397244; _hjid=bf121557-6d43-416b-9cbb-36312b4c741f; hubspotutk=c6e57ea9021e45fa9f5bcbd4f4d31d58; __hssrc=1; __hs_opt_out=no; __idcontext=eyJjb29raWVJRCI6IktSRFZKQkJJV0xQNkJYQ1dGT1RYTUxYTUVNTDNFQ1pZMlVMV1VKS0dMSURBPT09PSIsImRldmljZUlEIjoiS1JEVkpCQklSSFpNWlFLWUFHVEVZN0hMRlk1SkNDSkZSVUVVRUNMWk1VV1E9PT09IiwiaXYiOiI0Q1Q1RDRPQTNGN0tNWVpOVTJQNzZDWVdYST09PT09PSIsInYiOjF9; __cfruid=e65cd28dc63e6a416ff6f195c5a791f582a18c73-1584097749; hubspotapi-prefs=0; hubspotapi-csrf=ra117xxhWBBZAe_E3jMrnw; hubspot.hub.id=4920570; csrf.app=ra117xxhWBBZAe_E3jMrnw; _gid=GA1.2.49522093.1584496201; __hstc=20629287.c6e57ea9021e45fa9f5bcbd4f4d31d58.1583736402774.1584325054008.1584496278220.8; __hssc=20629287.1.1584496278220; hubspotapi=AJXaV53ImQ-dWVgz3oJCnY9Wic_w-5IK4lLV2S9Dp68iBZSTUvdkTTw_vF0pJxLDGN7RXHt9qs3N2u-9AZyMCyvD5vF8FK1NUnbtJEDJycICFVvBrYgUf6pkib2K2zIyx6krOAP0i7HbnH4dqLVaJ6aCzWHG1f9zmCUEBUV3F5w3uJQGdYSyrpRbYY2dqX92MZL_jm5ce56WZZHlbMAYBkVdmsrCCHrxFWSL1_cC1mvGw85D8nW2XmnXg1q9V5M27aP2kgS8cokAhdkWfsd5cXhDoG27ZJCOrTtCTCxq8xJ7LZYufulQTJexzTs5Vhm4OG_tFUoeNj2xawzVhH6cl3kVvLKbaz5z5_JvuxUuuHKH1tsEIG2cH0l-JK4f4EKFqX2J_262pTWeCEl2wLM3Ew7_9vVYttyRzdT1-MiduG1CnDIcClJcl7eIvNZeW37quTLGf2H8ScTY
origin: https://app.hubspot.com
referer: https://app.hubspot.com/contacts/4920570/contact/25751/
sec-fetch-dest: empty
sec-fetch-mode: cors
sec-fetch-site: same-site
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36
x-hubspot-csrf-hubspotapi: ra117xxhWBBZAe_E3jMrnw
x-properties-source: CRM_UI
x-properties-sourceid: drake.zhao@ringcentral.com
x-source: CRM_UI
x-sourceid: drake.zhao@ringcentral.com
portalId: 4920570
clienttimeout: 14000
{
  associations: {
    ownerIds: [
    ],
    contactIds: [
      25751
    ],
    companyIds: [
    ],
    dealIds: [
    ],
    ticketIds: [
    ]
  },
  engagement: {
    source: 'CRM_UI',
    sourceId: 'drake.zhao@ringcentral.com',
    timestamp: 1584585000000,
    type: 'MEETING',
    ownerId: 45206791
  },
  metadata: {
    body: '<p>Drake Zhao is inviting you to a RingCentral meeting.</p><p></p><p>Join from PC, Mac, iOS or Android: https://meetings.ringcentral.com/j/1495840703</p><p></p><p>Or iPhone one-tap:</p><p>     +17732319226,,1495840703# </p><p>    +912264804820,,1495840703# </p><p>    +918064804700,,1495840703# </p><p></p><p>Or Telephone:</p><p>     Dial:</p><p>    +1 773 231 9226</p><p>    +91 22 6480 4820</p><p>    +91 80 6480 4700</p><p>     Meeting ID: 149 584 0703</p><p>     International numbers available: https://meetings.ringcentral.com/teleconference</p>',
    plainText: 'Drake Zhao is inviting you to a RingCentral meeting.\n\nJoin from PC, Mac, iOS or Android: https://meetings.ringcentral.com/j/1495840703\n\nOr iPhone one-tap:\n     +17732319226,,1495840703# \n    +912264804820,,1495840703# \n    +918064804700,,1495840703# \n\nOr Telephone:\n     Dial:\n    +1 773 231 9226\n    +91 22 6480 4820\n    +91 80 6480 4700\n     Meeting ID: 149 584 0703\n     International numbers available: https://meetings.ringcentral.com/teleconference',
    endTime: 1584585900000,
    source: 'CRM_UI',
    startTime: 1584585000000,
    title: 'meeting ttt'
  },
  attachments: [
  ],
  scheduledTasks: [
  ],
  inviteeEmails: [
  ]
}
 */

export function initMeetingSelect (data) {
  const id = 'rc-meeting-select'
  let rootElement = document.getElementById(id)
  if (rootElement) {
    return
  }
  rootElement = createElementFromHTML(`<div id="${id}"></div>`)
  const home = document.getElementById('Hubspot-rc')
  home.appendChild(rootElement)
  render(
    <MeetingSelect />,
    rootElement
  )
}
