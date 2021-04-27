/**
 * search contact by phone numbers
 */

import request from './request'
import _ from 'lodash'
import { format164 } from './common'

/**
 * param phones: array of e164 format phone numbers
 * example: ['+16504377931#101', '+16504377932']
 */
export default async (_phones) => {
  const phones = _phones.map(p => format164(p)).filter(p => p)
  if (_.isEmpty(phones)) {
    return {}
  }
  const url = '/hs/search'
  const r = request(url, {
    phones
  })
  if (!r) {
    return {}
  }
  if (r && r.error) {
    console.error('search phone number error', '/hs/search', r)
  }
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
