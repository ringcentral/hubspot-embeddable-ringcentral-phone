/**
 * react entry
 */

import { render } from 'react-dom'
import {
  createElementFromHTML
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import App from './react-ele'

export default () => {
  const id = 'rc-react-entry'
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
