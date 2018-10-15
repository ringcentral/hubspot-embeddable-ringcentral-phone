/**
 * config content insert related feature
 */
import {
  RCBTNCLS2,
  checkPhoneNumber,
  getCSRFToken
} from './helpers'
import {thirdPartyConfigs} from './app-config'
import fetch, {jsonHeader} from '../common/fetch'

let {
  apiServerHS
} = thirdPartyConfigs

let phoneTypeDict = {
  phone: 'phone number',
  company: 'company phone number',
  mobilephone: 'mobile phone number'
}

function formatNumbers(res) {
  return Object.keys(res).reduce((prev, k) => {
    let v = res[k]
    if (!v) {
      return prev
    }
    return [
      ...prev,
      {
        id: k,
        title: phoneTypeDict[k],
        number: v.formattedNumber
      }
    ]
  }, [])
    .filter(o => checkPhoneNumber(o.number))
}

function getIds(href = location.href) {
  let reg = /contacts\/(\d+)\/contact\/(\d+)/
  let arr = href.match(reg) || []
  let portalId = arr[1]
  let vid = arr[2]
  if (!portalId || !vid) {
    return null
  }
  return {
    portalId,
    vid
  }
}

async function getNumbers(ids = getIds()) {
  if (!ids) {
    return []
  }
  let {
    portalId,
    vid
  } = ids
  let url = `${apiServerHS}/twilio/v1/phonenumberinfo/contactPhoneNumbersByProperty?portalId=${portalId}&clienttimeout=14000&contactVid=${vid}`
  let csrf = getCSRFToken()
  let res = await fetch.get(url, {
    headers: {
      ...jsonHeader,
      'x-hubspot-csrf-hubspotapi': csrf
    }
  })
  return res ? formatNumbers(res) : []
}

export const insertClickToCallButton = [
  {
    urlCheck: href => {
      return href.includes('?interaction=call')
    },
    getContactPhoneNumbers: getNumbers,
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
    getContactPhoneNumbers: async elem => {
      let phoneNode = elem.querySelector('.column-phone span span')
      let txt = phoneNode
        ? phoneNode.textContent.trim()
        : ''
      if (checkPhoneNumber(txt)) {
        return [{
          id: '',
          title: 'phone number',
          number: txt
        }]
      }
      let linkElem = elem.querySelector('.name-cell a')
      let href = linkElem
        ? linkElem.getAttribute('href')
        : ''
      let ids = getIds(href)
      return await getNumbers(ids)
    }
  }
]

