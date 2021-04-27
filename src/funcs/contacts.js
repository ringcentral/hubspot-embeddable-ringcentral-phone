/**
 * third party contacts related feature
 */

import _ from 'lodash'
import {
  popup,
  createElementFromHTML,
  host
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { getFullNumber, format164 } from '../common/common'
import searchPhone from '../common/search'

/**
 * click contact info panel event handler
 * @param {Event} e
 */
function onClickContactPanel (e) {
  const { target } = e
  const { classList } = target
  if (classList.contains('rc-close-contact')) {
    document
      .querySelector('.rc-contact-panel')
      .classList.add('rc-hide-contact-panel')
  }
}

function onloadIframe () {
  const dom = document
    .querySelector('.rc-contact-panel')
  dom && dom.classList.add('rc-contact-panel-loaded')
}

export function hideContactInfoPanel () {
  const dom = document
    .querySelector('.rc-contact-panel')
  dom && dom.classList.add('rc-hide-contact-panel')
}

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
  const contacts = await searchPhone([phone])
  const contact = _.get(contacts, `${phone}[0]`)
  if (!contact) {
    return
  }
  const type = contact.isCompany
    ? 'company'
    : 'contact'
  // let contactTrLinkElem = canShowNativeContact(contact)
  // if (contactTrLinkElem) {
  //   return showNativeContact(contact, contactTrLinkElem)
  // }
  const url = `${host}/contacts/${contact.portalId}/${type}/${contact.id}/?interaction=logged-call`
  const elem = createElementFromHTML(
    `
    <div class="animate rc-contact-panel" draggable="false">
      <div class="rc-close-box">
        <div class="rc-fix rc-pd2x">
          <span class="rc-fleft">Contact</span>
          <span class="rc-fright">
            <span class="rc-close-contact">&times;</span>
          </span>
        </div>
      </div>
      <div class="rc-contact-frame-box">
        <iframe scrolling="no" class="rc-contact-frame" sandbox="allow-same-origin allow-scripts allow-forms allow-popups" allow="microphone" src="${url}" id="rc-contact-frame">
        </iframe>
      </div>
      <div class="rc-loading">loading...</div>
    </div>
    `
  )
  elem.onclick = onClickContactPanel
  elem.querySelector('iframe').onload = onloadIframe
  const old = document
    .querySelector('.rc-contact-panel')
  old && old.remove()

  document.body.appendChild(elem)
  // moveWidgets()
}
