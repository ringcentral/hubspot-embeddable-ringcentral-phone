/**
 * content config file
 * with proper config,
 * insert `call with ringcentral` button
 * or hover some elemet show call button tooltip
 * or convert phone number text to click-to-call link
 *
 */

import { getIds } from '../common/common'
import { getNumbers } from './insert-click2call'

// hover contact node to show click to dial tooltip
export const hoverShowClickToCallButton = [
  {
    shouldAct: href => {
      return href.includes('/contacts/') && href.includes('list')
    },
    selector: 'table.table tbody tr',
    getContactPhoneNumbers: async elem => {
      const linkElem = elem.querySelector('[href*="/contacts"]')
      const href = linkElem
        ? linkElem.getAttribute('href')
        : ''

      const ids = getIds(href)
      return getNumbers(ids)
    }
  }
]
