/**
 * third party contacts related feature
 */

import _ from 'lodash'
import {setCache, getCache} from '../common/cache'
import {
  showAuthBtn
} from './auth'
import {
  popup,
  createElementFromHTML,
  commonFetchOptions,
  formatPhone,
  host
} from '../common/helpers'
import fetch from '../common/fetch'
import {thirdPartyConfigs} from '../common/app-config'

let {
  serviceName,
  apiServerHS
} = thirdPartyConfigs

/**
 * click contact info panel event handler
 * @param {Event} e
 */
function onClickContactPanel (e) {
  let {target} = e
  let {classList} = target
  if (classList.contains('rc-close-contact')) {
    document
      .querySelector('.rc-contact-panel')
      .classList.add('rc-hide-contact-panel')
  }
}

function onloadIframe () {
  let dom = document
    .querySelector('.rc-contact-panel')
  dom && dom.classList.add('rc-contact-panel-loaded')
}

/**
 * search contacts by number match
 * @param {array} contacts
 * @param {string} keyword
 */
export function findMatchContacts(contacts = [], numbers) {
  let {formatedNumbers, formatNumbersMap} = numbers.reduce((prev, n) => {
    let nn = formatPhone(n)
    prev.formatedNumbers.push(nn)
    prev.formatNumbersMap[nn] = n
    return prev
  }, {
    formatedNumbers: [],
    formatNumbersMap: {}
  })
  let res = contacts.filter(contact => {
    let {
      phoneNumbers
    } = contact
    return _.find(phoneNumbers, n => {
      return formatedNumbers
        .includes(
          formatPhone(n.phoneNumber)
        )
    })
  })
  return res.reduce((prev, it) => {
    let phone = _.find(it.phoneNumbers, n => {
      return formatedNumbers.includes(
        formatPhone(n.phoneNumber)
      )
    })
    let num = phone.phoneNumber
    let key = formatNumbersMap[
      formatPhone(num)
    ]
    if (!prev[key]) {
      prev[key] = []
    }
    let res = {
      id: it.id, // id to identify third party contact
      type: serviceName, // need to same as service name
      name: it.name,
      phoneNumbers: it.phoneNumbers
    }
    prev[key].push(res)
    return prev
  }, {})
}


/**
 * search contacts by keyword
 * @param {array} contacts
 * @param {string} keyword
 */
export function searchContacts(contacts = [], keyword) {
  return contacts.filter(contact => {
    let {
      name,
      phoneNumbers
    } = contact
    return name.includes(keyword) ||
      _.find(phoneNumbers, n => {
        return n.phoneNumber.includes(keyword)
      })
  })
}

/**
 * build name from contact info
 * @param {object} contact
 * @return {string}
 */
function buildName(contact) {
  let firstname = _.get(
    contact,
    'properties.firstname.value'
  ) || ''
  let lastname = _.get(
    contact,
    'properties.lastname.value'
  ) || ''
  let name = firstname || lastname ? firstname + ' ' + lastname : 'noname'
  return {
    name,
    firstname,
    lastname
  }
}

/**
 * build email
 * @param {Object} contact
 */
function buildEmail(contact) {
  for (let f of contact['identity-profiles']) {
    for (let g of f.identities) {
      if (g.type === 'EMAIL') {
        return [g.value]
      }
    }
  }
  return []
}

/**
 * build phone numbers from contact info
 * @param {object} contact
 * @return {array}
 */
function buildPhone(contact) {
  let phoneNumber = _.get(contact, 'properties.phone.value')
  let mobile = _.get(contact, 'properties.mobilephone.value')
  let res = []
  if (phoneNumber) {
    res.push({
      phoneNumber,
      phoneType: 'directPhone'
    })
  }
  if (mobile) {
    res.push({
      phoneNumber: mobile,
      phoneType: 'directPhone'
    })
  }
  return res
}

/**
 * convert hubspot contacts to ringcentral contacts
 * @param {array} contacts
 * @return {array}
 */
function formatContacts(contacts) {
  return contacts.map(contact => {
    return {
      id: contact.vid,
      ...buildName(contact),
      type: serviceName,
      emails: buildEmail(contact),
      phoneNumbers: buildPhone(contact),
      portalId: contact['portal-id']
    }
  })
}

/**
 * get contact list, one single time
 */
async function getContact(
  vidOffset = 0,
  count = 100
) {
  //https://api.hubapi.com/contacts/v1/lists/all/contacts/all
  let url =`${apiServerHS}/contacts/v1/lists/all/contacts/all?count=${count}&vidOffset=${vidOffset}&property=firstname&property=phone&property=lastname&property=mobilephone&property=company`
  let res = await fetch.get(url, commonFetchOptions())
  if (res && res.contacts) {
    return res
  } else {
    console.log('fetch contacts error')
    console.log(res)
    return {
      contacts: [],
      'has-more': false,
      'vid-offset': vidOffset
    }
  }
}

/**
 * get contact lists
 */
export const getContacts = _.debounce(async () => {
  if (!window.rc.rcLogined) {
    return []
  }
  if (!window.rc.local.accessToken) {
    showAuthBtn()
    return []
  }
  let cached = await getCache(window.rc.cacheKey)
  if (cached) {
    console.log('use cache')
    return cached
  }
  let contacts = []
  let res = await getContact()
  contacts = [
    ...contacts,
    ...res.contacts
  ]
  while (res['has-more']) {
    res = await getContact(res['vid-offset'])
    contacts = [
      ...contacts,
      ...res.contacts
    ]
  }
  let final = formatContacts(contacts)
  await setCache(window.rc.cacheKey, final)
  return final
}, 100, {
  leading: true
})

export function hideContactInfoPanel() {
  let dom = document
    .querySelector('.rc-contact-panel')
  dom && dom.classList.add('rc-hide-contact-panel')
}

/**
 * show caller/callee info
 * @param {Object} call
 */
export async function showContactInfoPanel(call) {
  if (
    !call ||
    !call.telephonyStatus ||
    call.telephonyStatus === 'CallConnected'
  ) {
    return
  }
  if (call.telephonyStatus === 'NoCall') {
    return hideContactInfoPanel()
  }
  popup()
  let isInbound = call.direction === 'Inbound'
  let phone = isInbound
    ? _.get(
      call,
      'from.phoneNumber'
    )
    : _.get(call, 'to.phoneNumber')
  if (!phone) {
    return
  }
  phone = formatPhone(phone)
  let contacts = await getContacts()
  let contact = _.find(contacts, c => {
    return _.find(c.phoneNumbers, p => {
      return formatPhone(p.phoneNumber) === phone
    })
  })
  if (!contact) {
    return
  }
  // let contactTrLinkElem = canShowNativeContact(contact)
  // if (contactTrLinkElem) {
  //   return showNativeContact(contact, contactTrLinkElem)
  // }
  let url = `${host}/contacts/${contact.portalId}/contact/${contact.id}/?interaction=note`
  let elem = createElementFromHTML(
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
  let old = document
    .querySelector('.rc-contact-panel')
  old && old.remove()

  document.body.appendChild(elem)
  //moveWidgets()
}
