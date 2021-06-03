/**
 * react entry
 */

import { render } from 'react-dom'
import {
  createElementFromHTML
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import App from './sync-contacts-select-elem'

export default () => {
  const id = 'rc-react-entry-sync-contacts-select'
  let rootElement = document.getElementById(id)
  if (rootElement) {
    return
  }
  rootElement = createElementFromHTML(`<div id="${id}"></div>`)
  const home = document.getElementById('HubSpot-rc')
  home.appendChild(rootElement)
  render(
    <App />,
    rootElement
  )
}
