/**
 * check sync contact progress
 */

import request from './request'
import { appVersion } from 'ringcentral-embeddable-extension-common/src/common/app-config'

export function createCallLog (data) {
  const url = '/hs/create-log'
  return request(
    url,
    { ...data, appVersion }
  )
}

export function autoCallLog (data) {
  const url = '/hs/auto-call-log'
  return request(
    url,
    { ...data, appVersion }
  )
}

export function updateCallLog (data, id) {
  const url = '/hs/update-log'
  return request(url, {
    data, id, appVersion
  })
}

export function updateCallLogStatus (statusId, id) {
  const url = '/hs/update-log-status'
  return request(url, {
    statusId, id, appVersion
  })
}

export function checkCallLog (sessionIds, oid) {
  const url = '/hs/check-log'
  return request(url, {
    sessionIds,
    oid
  })
}
