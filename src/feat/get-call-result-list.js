/**
 * get call result list
 */

import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import { commonFetchOptions, getEmail, getPortalId } from '../common/common'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'

const {
  apiServerHS
} = thirdPartyConfigs

// https://api.hubapi.com/calling/v1/dispositions
export default function getCallResultList () {
  const portalId = getPortalId()
  const email = getEmail()
  const url = `${apiServerHS}/calling/v1/dispositions?portalId=${portalId}`
  return fetchBg(url, {
    method: 'get',
    headers: {
      ...commonFetchOptions().headers,
      'X-Source': 'CRM_UI',
      'X-SourceId': email
    }
  })
}
