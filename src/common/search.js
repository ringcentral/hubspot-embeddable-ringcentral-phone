/**
 * search contact by phone numbers
 */

import request from './request'
import _ from 'lodash'
import { format164 } from './common'

const cache = {}

/**
 * param phones: array of e164 format phone numbers
 * example: ['+16504377931#101', '+16504377932']
 */
export async function searchPhone (_phones, returnArray = true, countOnly = false, key = 'nothing') {
  const phones = _phones.map(p => format164(p)).filter(p => p)
  const defaults = returnArray ? [] : {}
  if (_.isEmpty(phones)) {
    delete cache[key]
    return defaults
  }
  const n = countOnly ? 1 : ''
  const url = `/hs/search?countOnly=${n}`
  const r = await request(url, {
    phones
  })
  if (!r) {
    delete cache[key]
    return defaults
  }
  if (r && r.error) {
    console.error('search phone number error', '/hs/search', r)
    delete cache[key]
    return defaults
  }
  if (returnArray) {
    delete cache[key]
    return r
  }
  delete cache[key]
  return r.reduce((prev, it) => {
    for (const p of it.phoneNumbers) {
      const n = p.phoneNumber
      if (phones.includes(n)) {
        if (!prev[n]) {
          prev[n] = []
        }
        if (!_.find(prev[n], d => d.id === it.id)) {
          prev[n].push(it)
        }
      }
    }
    return prev
  }, {})
}

export default function cachedSearch (
  _phones,
  returnArray = true,
  countOnly = false
) {
  const key = _phones.join(',') + '-' + returnArray + '-' + countOnly
  if (cache[key]) {
    console.log('has cache')
    return cache[key]
  }
  cache[key] = searchPhone(
    _phones,
    returnArray = true,
    countOnly = false,
    key
  )
  return cache[key]
}
