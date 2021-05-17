/**
 * third party contacts related feature
 */

import _ from 'lodash'
import {
  popup,
  host
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { getFullNumber, format164 } from '../common/common'
import { searchPhone } from '../common/search'
import { Modal } from 'antd'

/**
 * show caller/callee info
 * @param {Object} call
 */
export async function showContactInfoPanel (call) {
  if (
    !call ||
    call.telephonyStatus !== 'Ringing' ||
    call.direction === 'Outbound'
  ) {
    return
  }
  popup()
  let phone = getFullNumber(_.get(call, 'from')) || _.get(call, 'from')
  if (!phone) {
    return
  }
  phone = format164(phone)
  const contacts = await searchPhone([phone], true, true)
  const contact = _.get(contacts, '[0]')
  if (!contact) {
    return
  }
  const type = 'contact'
  const [pid, id] = contact.split('-')
  const url = `${host}/contacts/${pid}/${type}/${id}/?interaction=logged-call`
  const elem = (
    <iframe
      scrolling='no'
      class='rc-contact-frame'
      sandbox='allow-same-origin allow-scripts allow-forms allow-popups'
      allow='microphone'
      src={url}
      id='rc-contact-frame'
    />
  )
  const opts = {
    title: 'Incoming call',
    width: '100%',
    style: {
      height: '100%'
    },
    content: elem
  }
  Modal.info(opts)
}
setTimeout(() => {
  showContactInfoPanel({
    call: {
      telephonyStatus: 'Ringing',
      direction: 'fff',
      from: '+12054097374'
    }
  })
}, 5000)
