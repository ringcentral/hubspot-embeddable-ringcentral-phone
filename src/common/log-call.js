/**
 * check sync contact progress
 */

import request from './request'

export function createCallLog (data, id) {
  const url = '/hs/create-log'
  return request(url, {
    data, id
  })
}

export function updateCallLog (data, id) {
  const url = '/hs/update-log'
  return request(url, {
    data, id
  })
}

export function updateCallLogStatus (statusId, id) {
  const url = '/hs/update-log-status'
  return request(url, {
    statusId, id
  })
}

export function checkCallLog (sessionIds) {
  const url = '/hs/check-sync'
  return request(url, {
    sessionIds
  })
}
