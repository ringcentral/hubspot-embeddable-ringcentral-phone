/**
 * check sync contact progress
 */

import request from './request'

export function createCallLog (data) {
  const url = '/hs/create-log'
  return request(
    url,
    data
  )
}

export function autoCallLog (data) {
  const url = '/hs/auto-call-log'
  return request(
    url,
    data
  )
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
  const url = '/hs/check-log'
  return request(url, {
    sessionIds
  })
}
