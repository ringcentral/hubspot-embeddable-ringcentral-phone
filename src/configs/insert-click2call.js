/**
 * content config file
 * with proper config,
 * insert `call with ringcentral` button
 * or hover some elemet show call button tooltip
 * or convert phone number text to click-to-call link
 *
 */

/// *
import { getContact } from '../common/contact'
import { START_CHECK_CALL_LOG, getIds } from '../common/common'
import {
  formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import getCid from '../common/get-contact-id'

import { openRCMeeting } from '../funcs/meeting'

function formatNumbers (res) {
  return res.phoneNumbers.map(p => {
    return {
      id: p.phoneNumber,
      title: p.phoneType,
      number: formatPhone(p.phoneNumber.replace('*', '#')).replace(' ext. ', '#')
    }
  })
}

export async function getNumbers (ids = getIds()) {
  if (!ids) {
    return []
  }
  const {
    vid
  } = ids
  const res = await getContact(vid)
  window.rc.currentContact = res
  if (res) {
    window.postMessage({
      type: START_CHECK_CALL_LOG,
      contact: res,
      oid: getCid(res.id)
    }, '*')
  }
  return res ? formatNumbers(res) : []
}

export const insertClickToCallButton = [
  {
    shouldAct: href => {
      return /contacts\/\d+\/contact\/\d+/.test(href)
    },
    getContactPhoneNumbers: getNumbers,
    onClickMeeting: function () {
      document.querySelector('[data-icon-name="meetings"]').click()
      openRCMeeting()
    },
    parentsToInsertButton: [
      {
        getElem: () => {
          const p = document.querySelector('[data-unit-test="highlightSubtitle"]') || document.querySelector('[data-selenium-test="contact-highlight-details"]')
          return p
            ? p.parentNode.parentNode.parentNode
            : null
        },
        insertMethod: 'append'
      }
    ]
  }
]
