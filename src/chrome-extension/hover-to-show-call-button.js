/**
 * add event handler to developer configed element,
 * show click-to-dial tooltip to the elements
 * config defined at './content-insert-config' hoverShowClickToCallButton section
 * but still, you can add custom behaviors if the config does not meet your needs
 */

import {hoverShowClickToCallButton} from './content-insert-config'
import _ from 'lodash'
import {
  dirtyLoop,
  findParentBySel,
  createCallBtnHtml,
  createElementFromHTML,
  checkPhoneNumber,
  callWithRingCentral,
  RCTOOLTIPCLS
} from './helpers'

class HoverHandler {
  constructor(config) {
    this.config = config
    let {
      urlCheck
    } = this.config
    dirtyLoop(
      urlCheck,
      this.addHover,
      this.tryRMEvents
    )
  }

  currentRow = null

  addHover = () => {
    let {href} = location
    if (!this.config.urlCheck(href)) {
      return
    }
    document.addEventListener('mouseenter', this.handleAddRCBtn, true)
  }

  handleAddRCBtn = (e) => {
    let {target} = e
    let {
      selector,
      getPhoneElemFromElem
    } = this.config
    let dom = findParentBySel(target, selector)
    let isToolTip = findParentBySel(target, '.' + RCTOOLTIPCLS)
    if (!dom && !isToolTip && this.currentRow) {
      this.hideRCBtn()
    }
    if (!dom || this.currentRow === dom) {
      return
    }
    let phoneNumberNode = getPhoneElemFromElem(dom)
    let text = phoneNumberNode
      ? (phoneNumberNode.textContent || '').trim()
      : ''
    if (!checkPhoneNumber(text)) {
      return
    }
    this.currentRow = dom
    let {tooltip, isShowing} = this.getRCTooltip(text)
    if (!isShowing) {
      tooltip.setAttribute('style', this.buildStyle(e, dom))
    }
  }

  /**
   * build tooltip postition style from event
   * @param {*} e
   */
  buildStyle = (e, dom) => {
    let {clientX} = e
    let {
      top
    } = dom.getBoundingClientRect()
    if (clientX > window.innerWidth - 120) {
      clientX = window.innerWidth - 120
    }
    return `left:${clientX + 3}px;top:${top - 34}px;display:block;`
  }

  /**
   * get ringcentral contact button wrap dom
   * if not created, just create and append to body
   */
  getRCTooltip = (phoneNumber) => {
    let tooltip = document.querySelector('.' + RCTOOLTIPCLS)
    let isShowing = tooltip
      ? tooltip.style.display === 'block'
      : false
    if (!tooltip) {
      tooltip = createElementFromHTML(`
        <div class="${RCTOOLTIPCLS}">
          ${createCallBtnHtml()}
        </div>
      `)
    }
    tooltip.onclick = () => {
      callWithRingCentral(phoneNumber)
    }
    document.body.appendChild(tooltip)
    return {tooltip, isShowing}
  }

  hideRCBtn = _.throttle(() => {
    this.currentRow = null
    let {tooltip} = this.getRCTooltip()
    tooltip.setAttribute('style', 'display:none')
  }, 200)

  tryRMEvents = () => {
    document.removeEventListener('mouseenter', this.handleAddRCBtn, true)
  }

}

function processHover(config) {
  return new HoverHandler(config)
}

export default () => {
  hoverShowClickToCallButton.forEach(processHover)
}
