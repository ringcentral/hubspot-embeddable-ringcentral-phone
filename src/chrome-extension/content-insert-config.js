/**
 * config content insert related feature
 */
import {RCBTNCLS2, checkPhoneNumber} from './helpers'
export const insertClickToCallButton = [
  {
    urlCheck: href => {
      return href.includes('?interaction=call')
    },
    getContactPhoneNumber: () => {
      let phoneWrap = document.querySelector('[data-profile-property=\'phone\']')
      if (!phoneWrap) {
        return false
      }
      let phoneInput = phoneWrap.querySelector('input')
      if (!phoneInput) {
        return false
      }
      let {value} = phoneInput
      let isNumber = checkPhoneNumber(value)
      return isNumber ? value : false
    },
    parentsToInsertButton: [
      {
        getElem: () => {
          return document.querySelector('.start-call').parentNode
        },
        insertMethod: 'insertBefore',
        shouldInsert: () => {
          return !document.querySelector('.' + RCBTNCLS2)
        }
      },
      {
        getElem: () => {
          return document
            .querySelector('.panel-is-call button [data-key="twilio.notEnabled.skipOnboarding"]')
            .parentNode.parentNode
        },
        insertMethod: 'insertBefore',
        shouldInsert: () => {
          return !document.querySelector('.' + RCBTNCLS2)
        }
      }
    ]
  }
]

//hover contact node to show click to dial tooltip
export const hoverShowClickToCallButton = [
  {
    urlCheck: href => {
      return href.includes('contacts/list/') || href.includes('contacts/view/all/')
    },
    selector: 'table.table tbody tr',
    getPhoneElemFromElem: elem => {
      return elem.querySelector('.column-phone span span')
    }
  }
]

