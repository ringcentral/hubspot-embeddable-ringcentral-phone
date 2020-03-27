/**
 * handle meeting related API
 */

import {
  createElementFromHTML,
  popup,
  sendMsgToRCIframe,
  notify
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import {
  rcIconSvg
} from 'ringcentral-embeddable-extension-common/src/common/rc-icons'
import {
  createPopper
} from '@popperjs/core'

let isFromInsert = false

function insertAfter (newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

export function openRCMeeting () {
  const ig = document.querySelector('.rc-meet-shade')
  if (ig) {
    return false
  }
  const shade = createElementFromHTML(`
    <div class="rc-meet-shade"></div>
  `)
  document.body.appendChild(shade)
  popup()
  isFromInsert = true
  sendMsgToRCIframe({
    type: 'rc-adapter-navigate-to',
    path: '/meeting/schedule'
  })
}

export const onMeetingPanelOpen = async function () {
  const isInContactPage = /contacts\/\d+\/contact\/\d+/.test(window.location.href)
  if (!isInContactPage) {
    return false
  }
  const confIcon = document.querySelector('span[data-icon-name="insertVideo"]')
  if (!confIcon) {
    return false
  }
  const parent = confIcon.parentNode
  if (!parent) {
    return false
  }
  const next = parent.nextSibling
  if (!next || next.classList.contains('rc-meeting-icon')) {
    return false
  }
  const title = 'Shedule a meeting with RingCentral'
  const newNode = createElementFromHTML(
    `<span class="rc-meet-icon plugin-group-button draft-toolbar-button" title="${title}">
      ${rcIconSvg(14)}
    </span>`
  )
  newNode.onclick = () => {
    console.debug('rc meeting trigger')
    openRCMeeting()
  }
  const tooltip = createElementFromHTML(`<div>${title}</div>`)
  insertAfter(newNode, parent)
  createPopper(document.querySelector('.rc-meet-icon'), tooltip, {
    placement: 'top'
  })
}
/*
function insertTextAtCursor (text) {
  var sel, range, textNode
  if (window.getSelection) {
    sel = window.getSelection()
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0)
      range.deleteContents()
      textNode = document.createTextNode(text)
      range.insertNode(textNode)

      // Move caret to the end of the newly inserted text node
      range.setStart(textNode, textNode.length)
      range.setEnd(textNode, textNode.length)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange()
    range.pasteHTML(text)
  }
}
*/
const copyToClipboard = str => {
  const el = document.createElement('textarea')
  el.value = str
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

export const onRCMeetingCreate = (data) => {
  const {
    details,
    topic
  } = data.body.meeting
  const t = document.querySelector('input[data-selenium-test="meeting-title-input"]')
  if (t && !t.value) {
    t.value = topic
  }
  copyToClipboard(details)
  notify('Meeting info copied to clipboard', 10000)
  const d = document.querySelector('.DraftEditor-editorContainer > div')
  if (d) {
    d.focus()
    if (isFromInsert) {
      setTimeout(() => {
        document.execCommand('Paste')
      }, 100)
    }
  }
  if (isFromInsert) {
    popup(true)
    const ig = document.querySelector('.rc-meet-shade')
    if (ig) {
      return ig.remove()
    }
    isFromInsert = false
  }
}
