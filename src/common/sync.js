/**
 * check sync contact progress
 */

import request from './request'
import { getIds } from './common'
import { notification } from 'antd'
import logout from './logout'

function checkPid (pid) {
  const { portalId } = getIds() || {}
  console.log('current pid:', portalId, ', server pid:', pid)
  if (portalId !== pid) {
    console.log('current pid:', portalId, ', server pid:', pid, ' not match, so logout')
    logout()
  }
}

export async function checkSync () {
  const url = '/hs/check-sync'
  const r = await request(url)
  if (r && r.ownerId) {
    window.rc.ownerId = Number(r.ownerId)
    checkPid(r.pid)
  }
  if (r && r.note) {
    notification.warn({
      title: 'Warning',
      description: r.note,
      duration: 10
    })
  }
  if (r && r.result) {
    return r.result
  }
}

export function startSync () {
  const url = '/hs/start-sync?countryCode=' + window.rc.countryCode
  return request(url)
}
