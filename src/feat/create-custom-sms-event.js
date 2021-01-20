/**
 * create sms custom event after custom timeline event created in app setting
 */
import { Modal } from 'antd'
import { thirdPartyConfigs, appVersion, ringCentralConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import dayjs from 'dayjs'

const {
  smsTemplateId
} = thirdPartyConfigs
const {
  authServer
} = ringCentralConfigs
/**
curl -X POST -H 'Content-Type: application/json' \
-H 'Authorization: Bearer <<OAuth2AccessToken>>' \
-d '
{
  'eventTemplateId': '<<eventTemplateId>>',
  'email': 'a.test.contact@email.com',
  'tokens': {
    'webinarName': 'A Test Webinar',
    'webinarId': '001001',
    'webinarType': 'regular'
  }
}' \
'https://api.hubapi.com/crm/v3/timeline/events'
 */

export async function createSMS (opts, email) {
  const data = {
    eventTemplateId: smsTemplateId,
    timestamp: dayjs(opts.mds[0].stamp).toISOString(),
    tokens: {
      countSMS: opts.mds.length
    },
    extraData: {
      smsList: opts.mds
    },
    email
  }
  const url = `${authServer}/hs/create-sms-event`
  let res = await fetch.post(url, data, {
    credentials: 'include'
  })
  return res
}

window.aa = (tar) => {
  const defaul = {
    mds: [
      {
        content: '**jkl** [attachment: rc-30-30.png](https://ringcentral.github.io/ringcentral-media-reader/?media=https%3A%2F%2Fmedia.ringcentral.com%2Frestapi%2Fv1.0%2Faccount%2F37439510%2Fextension%2F1903785020%2Fmessage-store%2F1450446757020%2Fcontent%2F37051121020) - from **+16504377931(Drake Zhao)** to **+17206770897**',
        time: 'Jan 20, 2021 09:54'
      }
    ]
  }
  createSMS(tar || defaul, 'test@test25.com')
}

export function onSMSlogEnabled () {
  const hsAppUrl = 'https://ecosystem.hubspot.com/marketplace/apps/sales/calling/ringcentral-202602'
  const rcUrl = 'https://github.com/ringcentral/hubspot-embeddable-ringcentral-phone'
  const content = (
    <div>
      <p>To enable logging SMS as RingCentral SMS timeline event, you need:</p>
      <ul>
        <li>Install RingCentral integration from HubSpot App market, <a target='_blank' href={hsAppUrl}>Install page</a></li>
        <li>Install RingCentral Chrome extension version ≥ <b>4.5.0</b> (your current RingCentral Chrome extension version is <b>{appVersion}</b>) and relogin RingCentral account, <a target='_blank' href={rcUrl}>Download page</a></li>
        <li>Make sure your email of RingCentral account is exactly the same as your HubSpot account.</li>
        <li>Then check the RingCentral from activities filter.</li>
      </ul>
    </div>
  )
  Modal.info({
    title: 'Log SMS as custom RingCentral SMS timeline event',
    content
  })
}
