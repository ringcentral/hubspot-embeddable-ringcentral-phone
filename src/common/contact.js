/**
 * check sync contact progress
 */

import request from './request'
import { notification } from 'antd'
import {
  getCache,
  setCache
} from 'ringcentral-embeddable-extension-common/src/common/cache'

const time = 5000
const prefix = 'rc-contact-cache-'

export async function createContact (data) {
  const url = '/hs/create-contact'
  const r = await request(url, { data })
  if (r && r.result && r.result.id) {
    return r.result
  }
}

export async function getContact (vid) {
  const cid = prefix + vid
  const cached = await getCache(cid)
  if (cached) {
    console.log('use contact fetch cache')
    return cached
  }
  const url = '/hs/get-contact'
  let r = null
  if (window.contactRequestId === vid && window.contactRequest) {
    console.log('fetching, reuse promise')
    r = await window.contactRequest
  } else {
    window.contactRequestId = vid
    window.contactRequest = request(url, {
      id: vid
    })
    r = await window.contactRequest
  }
  delete window.contactRequestId
  delete window.contactRequest
  if (r && r.result && r.result.id) {
    await setCache(cid, r.result, time)
    return r.result
  } else if (r && r.error) {
    notification.warn({
      title: 'Error',
      description: r.note,
      duration: 10
    })
  } else {
    console.log(r)
    return null
  }
}
