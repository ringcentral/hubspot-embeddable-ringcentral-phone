/**
 * react entry
 */

import { render } from 'react-dom'
import {
  createElementFromHTML
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import App from './inner-elem-call-log'

export default () => {
  const id = 'rc-react-entry-inner-call-log'
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
