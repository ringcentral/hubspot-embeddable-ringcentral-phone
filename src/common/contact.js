/**
 * check sync contact progress
 */

import request from './request'

export function createContact (data) {
  const url = '/hs/create-contact'
  return request(url, data)
}

export function getContact (vid) {
  const url = '/hs/get-contact'
  return request(url)
}
