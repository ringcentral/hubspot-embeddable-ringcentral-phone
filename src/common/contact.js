/**
 * check sync contact progress
 */

import request from './request'

export async function createContact (data) {
  const url = '/hs/create-contact'
  const r = await request(url, { data })
  if (r && r.result && r.result.id) {
    return r.result
  }
}

export async function getContact (vid) {
  const url = '/hs/get-contact'
  const r = await request(url, {
    id: vid
  })
  if (r && r.result && r.result.id) {
    return r.result
  } else {
    console.log(r)
    return null
  }
}
