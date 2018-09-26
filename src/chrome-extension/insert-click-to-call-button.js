/**
 * insert click-to-call button at special position/page based on './content-insert-config.js'
 * but still, you can add custom button if the config does not meet your needs
 */

import {insertClickToCallButton} from './content-insert-config'
import {
  dirtyLoop,
  createCallBtnHtml,
  createElementFromHTML,
  callWithRingCentral,
  RCBTNCLS2
} from './helpers'

class insertHandler {
  constructor(config) {
    this.config = config
    let {
      urlCheck
    } = this.config
    dirtyLoop(
      urlCheck,
      this.tryAddCallBtn
    )
  }

  getParentDom = () => {
    if (this.parentDom) {
      return this.parentDom
    }
    let {
      parentsToInsertButton
    } = this.config
    let {length} = parentsToInsertButton
    let res = {
      elem: null
    }
    for (let i = 0;i < length;i ++) {
      let pc = parentsToInsertButton[i]
      try {
        res.elem = pc.getElem()
        res.insertMethod = pc.insertMethod
        break
      } catch (e) {
        console.log(e)
      }
    }
    if (res.elem) {
      this.parentDom = res
    }
    return res
  }

  isButtonInserted = () => {
    let parent = this.getParentDom().elem
    if (!parent) {
      return false
    }
    return parent.querySelector('.' + RCBTNCLS2)
  }

  //in contact call tab try add call with ringcentral button
  tryAddCallBtn = () => {
    let {href} = location
    let {
      urlCheck,
      getContactPhoneNumber
    } = this.config
    if (!urlCheck(href)) {
      return
    }
    if (this.isButtonInserted()) {
      return
    }
    let callWithRingCentralBtn = document.querySelector('.' + RCBTNCLS2)
    if (callWithRingCentralBtn) {
      return
    }
    let phoneNumber = getContactPhoneNumber()
    if (phoneNumber) {
      this.addCallWithRingCentralButton(phoneNumber)
    }
  }

  addCallWithRingCentralButton = (phoneNumber) => {
    let {elem, insertMethod} = this.getParentDom()
    let callByRingCentralBtn = createElementFromHTML(createCallBtnHtml(RCBTNCLS2))

    callByRingCentralBtn.onclick = () => {
      callWithRingCentral(phoneNumber)
    }
    elem[insertMethod](
      callByRingCentralBtn,
      elem.childNodes[0]
    )
  }

}

function processInsert(config) {
  return new insertHandler(config)
}

export default () => {
  insertClickToCallButton.forEach(processInsert)
}
