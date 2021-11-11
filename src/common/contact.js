/**
 * check sync contact progress
 */

import request from './request'
import { notification } from 'antd'
import {
  getCache,
  setCache
} from 'ringcentral-embeddable-extension-common/src/common/cache'

const time = 10000
const prefix = 'rc-contact-cache-'

function hasExtension (r) {
  return r.phoneNumbers.find(p => {
    return p.phoneNumber.includes('#')
  })
}

function returnResult (r) {
  if (hasExtension(r) && !window.extensionWarn) {
    window.extensionWarn = true
    notification.warn({
      title: 'Warning',
      description: 'RingCentral for HubSpot extension do not support log calls for phone number with extension, you can remove extension from phone, save, reload and call again',
      duration: 10,
      onClose: () => {
        delete window.extensionWarn
      }
    })
  }
  return r
}

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
    return returnResult(cached)
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
    return returnResult(r.result)
  } else if (r && r.warning) {
    notification.warn({
      title: r.errorTitle || 'Error',
      description: r.note || r.warning,
      duration: 10
    })
  } else {
    console.log(r)
    return null
  }
}
