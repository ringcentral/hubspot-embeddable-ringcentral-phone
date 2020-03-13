/**
 * handle on call on event, show add contact panel if not in hubspot
 */

import _ from 'lodash'
import { rc } from './common'
import {
  match, insert
} from 'ringcentral-embeddable-extension-common/src/common/db'
import {
  createElementFromHTML, checkPhoneNumber, notify
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { addContact } from './add-contact'
import { showAuthBtn, formatContacts, notifyReSyncContacts, getOwnerId } from './contacts'

export default async (call) => {
  if (!call.sdsdf) {
    return
  }
  if (!rc.local.accessToken) {
    showAuthBtn()
    return
  }
  const number = call.direction === 'Inbound'
    ? call.from
    : call.to
  let res = await match([number])
  if (_.isEmpty(res)) {
    showContactFormPanel(number)
  }
}

function validateEmail (email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

function validate () {
  const phoneDom = document.querySelector('.rc-input-phone') || {}
  const emailDom = document.querySelector('.rc-input-email') || {}
  const fDom = document.querySelector('.rc-input-f') || {}
  const lDom = document.querySelector('.rc-input-l') || {}
  if (!phoneDom.value) {
    notify('Phone number is required')
    return false
  } else if (!checkPhoneNumber(phoneDom.value)) {
    notify('Phone number is not valid')
    return false
  } else if (!fDom.value && !lDom.value) {
    notify('Name is required')
    return false
  } else if (!emailDom.value) {
    notify('Email is required')
    return false
  } else if (!validateEmail(emailDom.value)) {
    notify('Email is not valid')
    return false
  } else {
    return {
      contactEmail: emailDom.value,
      firstname: fDom.value,
      lastname: lDom.value,
      phone: phoneDom.value
    }
  }
}

async function onSubmit (res) {
  const oid = await getOwnerId()
  if (!oid) {
    return notify('Add contact failed, can not get owner ID', 'error')
  }
  const r = await addContact({
    ...res,
    ownerId: oid
  })
  if (!r || !r.vid) {
    notify('Create contact failed')
  } else {
    if (r && r.vid) {
      await insert(
        formatContacts([r])
      )
      notifyReSyncContacts()
    }
    notify('Contact cerated')
  }
}

function onCancel () {
  document.querySelector('#rc-contact-form').classList.remove('rc-sync-show')
}

function showContactFormPanel (number, name = '') {
  let [firstname = '', lastname = ''] = name.split(' ')
  let dom = createElementFromHTML(`
    <form class="rc-sync-form animate" id="rc-contact-form">
      <div class="rc-sync-inner rc-pd2">
        <h4 class="rc-sync-title rc-pd1b">
          Save as Hubspot contact
        </h4>
        <div class="rc-pd1b">
          <div class="rc-pd1b">
            <p>Phone number:</p>
            <input
              class="rc-input rc-input-phone"
              value="${number}"
            />
          </div>
          <div class="rc-pd1b">
            <p>Name:</p>
            <div class="flex">
              <div class="flex-item">
                <input
                  class="rc-input rc-input-f"
                  value="${firstname}"
                />
              </div>
              <div class="flex-item">
                <input
                  class="rc-input rc-input-l"
                  value="${lastname}"
                />
              </div>
            </div>
          </div>
          <div class="rc-pd1b">
            <p>Email:</p>
            <input
              type="email"
              class="rc-input rc-input-email"
              value=""
            />
          </div>
        </div>
        <div class="rc-pd1b rc-sync-btns">
          <button class="rc-sync-btn rc-btn-cancel rc-mg1r" type="button">Cancel</button>
          <button class="rc-sync-btn rc-btn-submit" type="submit">Submit</button>
        </div>
      </div>
    </form>
  `)
  dom.onsubmit = e => {
    e.preventDefault()
    const res = validate()
    if (!res) {
      return
    }
    onSubmit(res)
    onCancel()
  }
  dom.querySelector('#rc-contact-form .rc-btn-cancel').onclick = onCancel
  // dom.querySelector('.rc-sync-area').onchange = e => {
  //   e.preventDefault()
  //   onSubmit()
  // }
  let old = document.querySelector('.rc-sync-form')
  old && old.remove()
  document.getElementById('Hubspot-rc').appendChild(dom)
  setTimeout(() => {
    dom.classList.add('rc-sync-show')
  }, 100)
}
