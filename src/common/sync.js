/**
 * check sync contact progress
 */

import request from './request'

export async function checkSync () {
  const url = '/hs/check-sync'
  const r = await request(url)
  if (r && r.ownerId) {
    window.rc.ownerId = r.ownerId
  }
  if (r && r.result) {
    return r.result
  }
}

export function startSync () {
  const url = '/hs/start-sync'
  return request(url)
}
