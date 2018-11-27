/**
 * insert click-to-call button at special position/page based on './content-insert-config.js'
 * but still, you can add custom button if the config does not meet your needs
 */

import {insertClickToCallButton} from '../config'
import {
  dirtyLoop,
  createCallBtnHtml,
  createElementFromHTML,
  callWithRingCentral,
  onClickPhoneNumber,
  RCBTNCLS2
} from '../common/helpers'

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
        //console.log(e)
      }
    }
    return res
  }

  isButtonInserted = () => {
    let parent = this.getParentDom().elem
    if (!parent) {
      return false
    }
    return !!parent.querySelector('.' + RCBTNCLS2)
  }

  //in contact call tab try add call with ringcentral button
  tryAddCallBtn = async () => {
    let {href} = location
    let {
      urlCheck,
      getContactPhoneNumbers
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
    let phoneNumbers = await getContactPhoneNumbers()
    if (phoneNumbers.length) {
      this.addCallWithRingCentralButton(phoneNumbers)
    }
  }

  addCallWithRingCentralButton = (phoneNumbers) => {
    let {elem, insertMethod} = this.getParentDom()
    if (!elem) {
      return
    }
    let callByRingCentralBtn = createElementFromHTML(
      createCallBtnHtml(RCBTNCLS2, phoneNumbers)
    )
    callByRingCentralBtn.addEventListener('click', (e) => {
      if (phoneNumbers.length === 1) {
        return callWithRingCentral(phoneNumbers[0].number)
      }
      onClickPhoneNumber(e)
    })

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
