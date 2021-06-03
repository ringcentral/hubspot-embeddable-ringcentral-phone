/**
 * get contact info from call/msg log data
 */

// xx
import _ from 'lodash'
import {
  notify
} from './notify'
import dayjs from 'dayjs'

export function getContactInfo (body) {
  if (!body) {
    return
  }
  let numbers = []
  let time
  let isOutbound
  let detail = ''
  let name = ''
  if (body.call) {
    const to = _.get(body, 'call.to.phoneNumber') || _.get(body, 'call.toNumber') || _.get(body, 'call.to')
    const from = _.get(body, 'call.from.phoneNumber') || _.get(body, 'call.fromNumber') || _.get(body, 'call.from')
    isOutbound = _.get(body, 'call.direction') === 'Outbound'
    numbers = isOutbound
      ? [to]
      : [from]
    name = isOutbound
      ? _.get(body, 'call.to.name') || ''
      : _.get(body, 'call.from.name') || ''
    time = dayjs(body.call.startTime).format()
    const bound = isOutbound ? 'Outbound' : 'Inbound'
    detail = `${bound} call from ${from} to ${to}`
  } else if (
    _.get(body, 'conversation.type') === 'SMS' ||
    _.get(body, 'conversation.type') === 'VoiceMail'
  ) {
    numbers = (_.get(body, 'conversation.correspondents') || []).map(d => d.phoneNumber)
    const person = numbers.join(', ')
    time = dayjs(body.conversation.creationTime).format()
    detail = `Message with ${person}: `
    name = ''
  } else {
    // todo fax support
    notify(`Do not support ${_.get(body, 'conversation.type')} yet`)
  }
  return {
    detail,
    numbers,
    time,
    isOutbound,
    name
  }
}
