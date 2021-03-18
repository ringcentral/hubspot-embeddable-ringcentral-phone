/**
 * search contacts by phone or name
 */

// https://api.hubspot.com/search/v2/search?query=(720)%20677-0897&portalId=xxxxxx&locale=en

/**
 *
{
  sectionResults: {
    CONTACT: {
      results: [
        {
          type: 'UnlabeledSearchResult',
          resultId: '401',
          score: 14.444301,
          position: null,
          resultType: 'CONTACT',
          url: '/contacts/xxxxxx/contact/401',
          variantPositions: {
            variantPositions: {
            }
          },
          chosenFromVariant: 'A',
          properties: {
            avatarUrl: 'https://cdn2.hubspot.net/hub/xxxxxx/hubfs/defaults/contact.png/height=72/width=72',
            name: 'test zxd1',
            firstName: 'test',
            lastName: 'zxd1',
            email: 'test@dd.com',
            company: null,
            phone: '(xxx) 677-0897',
            mobilePhone: null,
            additionalEmails: null,
            avatarFileManagerKey: null
          },
          highlights: {
            phone: '(<b>720) 677-0897</b>',
            phoneWithoutCountryCode: '<b>7206770897</b>'
          },
          query: null,
          createdAt: null
        },
        {
          type: 'UnlabeledSearchResult',
          resultId: '101',
          score: 11.8270035,
          position: null,
          resultType: 'CONTACT',
          url: '/contacts/xxxxxx/contact/101',
          variantPositions: {
            variantPositions: {
            }
          },
          chosenFromVariant: 'A',
          properties: {
            avatarUrl: 'https://cdn2.hubspot.net/hub/xxxxxx/hubfs/defaults/contact.png/height=72/width=72',
            name: 'test t',
            firstName: 'test',
            lastName: 't',
            email: 'xx@xx.com',
            company: null,
            phone: '(xxx) 677-0897',
            mobilePhone: null,
            additionalEmails: null,
            avatarFileManagerKey: null
          },
          highlights: {
            phone: '(<b>720) 677-0897</b>',
            phoneWithoutCountryCode: '<b>7206770897</b>'
          },
          query: null,
          createdAt: null
        }
      ],
      nextOffset: null,
      nextOffsetA: null,
      nextOffsetB: null,
      correlationId: null,
      experimentName: null,
      index: 0,
      errored: false,
      hasMore: false,
      spellingCorrection: null
    },
    ACTIVITY: {
      results: [
        {
          type: 'UnlabeledSearchResult',
          resultId: '11708849075',
          score: 2.175757,
          position: 1,
          resultType: 'ACTIVITY',
          url: '/contacts/xxxxxx/contact/101?engagement=11708849075',
          variantPositions: {
            variantPositions: {
            }
          },
          chosenFromVariant: 'A',
          properties: {
            engagementType: 'CALL',
            associatedObjectId: '101',
            associatedObjectType: 'CONTACT',
            associatedObjectName: 'test t',
            callBody: 'Voice mail: https://ringcentral.github.io/ringcentral-media-reader/?media=https%3A%2F%2Fmedia.ringcentral.com%2Frestapi%2Fv1.0%2Faccount%2F37439510%2Fextension%2F1903785020%2Fmessage-store%2F1449350620020%2Fcontent%2F1449350620020 - from +1 720 677 0897 Dec 22, 2020 09:15',
            noteBody: null,
            meetingBody: null,
            emailSubject: null
          },
          query: null,
          createdAt: null
        }
      ],
      nextOffset: 1,
      nextOffsetA: null,
      nextOffsetB: null,
      correlationId: null,
      experimentName: null,
      index: 1,
      errored: false,
      hasMore: false,
      spellingCorrection: null
    },
    NAVIGATION: {
      results: [
        {
          type: 'UnlabeledSearchResult',
          resultId: 'contacts',
          score: 1,
          position: 1,
          resultType: 'NAVIGATION',
          url: '/contacts/xxxxxx/contacts',
          variantPositions: {
            variantPositions: {
            }
          },
          chosenFromVariant: 'A',
          properties: {
            name: 'Contacts',
            isLocked: 'false'
          },
          query: null,
          createdAt: null
        }
      ],
      nextOffset: null,
      nextOffsetA: null,
      nextOffsetB: null,
      correlationId: null,
      experimentName: null,
      index: 2,
      errored: false,
      hasMore: false,
      spellingCorrection: null
    }
  },
  correlationId: 'f8d495fd-1242-451b-ac75-36596bdd2e28',
  spellingCorrection: null,
  showTwoColumnLayout: true
}
 */
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import { getPortalId, getCSRFToken } from './common'
import { jsonHeader } from 'ringcentral-embeddable-extension-common/src/common/fetch'
import fetchBg from 'ringcentral-embeddable-extension-common/src/common/fetch-with-background'
import _ from 'lodash'
import {
  formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'

let {
  serviceName,
  apiServerHS
} = thirdPartyConfigs

/**
 * build name from contact info
 * @param {object} contact
 * @return {string}
 */
function buildName (contact) {
  const firstname = _.get(
    contact,
    'properties.firstName'
  ) || ''
  const lastname = _.get(
    contact,
    'properties.lastName'
  ) || ''
  const name = firstname || lastname ? firstname + ' ' + lastname : 'noname'
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
function buildEmail (contact) {
  const e = _.get(contact, 'properties.email')
  return e ? [e] : []
}

/**
 * build phone numbers from contact info
 * @param {object} contact
 * @return {array}
 */
function buildPhone (contact) {
  let phoneNumber = _.get(contact, 'properties.phone')
  let mobile = _.get(contact, 'properties.mobilePhone')
  let res = []
  if (phoneNumber) {
    res.push({
      phoneNumber,
      phoneType: 'direct'
    })
  }
  if (mobile) {
    res.push({
      phoneNumber: mobile,
      phoneType: 'mobile'
    })
  }
  const r = {
    phoneNumbersForSearch: res.map(
      d => formatPhone(d.phoneNumber)
    ).join(','),
    phoneNumbers: res
  }
  return r
}

export function formatContacts (contacts, portalId) {
  return contacts.map(contact => {
    return {
      id: contact.resultId + '',
      ...buildName(contact),
      type: serviceName,
      emails: buildEmail(contact),
      ...buildPhone(contact),
      portalId
    }
  })
}

export async function searchContact (
  phoneNumber
) {
  const portalId = getPortalId()
  // https://api.hubapi.com/contacts/v1/lists/all/contacts/all
  //  let url =`${apiServerHS}/contacts/v1/lists/all/contacts/all?count=${count}&vidOffset=${vidOffset}&property=firstname&property=phone&property=lastname&property=mobilephone&property=company`
  const url = `${apiServerHS}/search/v2/search?query=${encodeURIComponent(phoneNumber)}&portalId=${portalId}&locale=en`

  let headers = {
    ...jsonHeader,
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'X-HS-Referer': window.location.href,
    'X-HubSpot-CSRF-hubspotapi': getCSRFToken()
  }
  let res = await fetchBg(url, {
    // body: data,
    headers,
    method: 'get'
  })
  const list = _.get(res, 'sectionResults.CONTACT.results')
  if (list && list.length) {
    return formatContacts(list, portalId)
  } else {
    console.log('fetch contacts error')
    console.log(res)
    return []
  }
}
export const debounceSearchContact = _.debounce(searchContact, 200)

export async function searchContactByNumbers (_phoneNumbers) {
  const phoneNumbers = _phoneNumbers.filter(p => p)
  if (_.isEmpty(phoneNumbers)) {
    return {}
  }
  const { formatedNumbers } = phoneNumbers.reduce((prev, n) => {
    const nn = formatPhone(n)
    prev.formatedNumbers.push(nn)
    return prev
  }, {
    formatedNumbers: []
  })
  const result = {}
  const len = phoneNumbers.length
  for (let i = 0; i < len; i++) {
    const n = phoneNumbers[i]
    const contacts = await searchContact(formatedNumbers[i])
    result[n] = contacts
  }
  console.log('result=====', result)
  return result
}
