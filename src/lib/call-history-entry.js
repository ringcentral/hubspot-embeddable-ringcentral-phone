/**
 * react entry
 */

import { render } from 'react-dom'
import {
  createElementFromHTML
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import App from './history-call-log.js'

export default () => {
  const id = 'rc-call-history-entry'
  let rootElement = document.getElementById(id)
  if (rootElement) {
    return
  }
  rootElement = createElementFromHTML(`<div id="${id}"></div>`)
  const home = document.body
  home.appendChild(rootElement)
  render(
    <App />,
    rootElement
  )
}
