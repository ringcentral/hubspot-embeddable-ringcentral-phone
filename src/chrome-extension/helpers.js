//from https://github.com/tejasmanohar/is-phone-number/blob/master/index.js
export function checkPhoneNumber(phone) {
  return /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}$/.test(phone)
}

export function isCallTab(href) {
  return href.includes('?interaction=call')
}

export function isContactsListTab(href) {
  return href.includes('contacts/list/view/all/')
}

/**
 * check contact has phone number or not
 * if has, return the number, or return false
 * @return {mixed}
 */
export function contactHasPhoneNumber() {
  let phoneWrap = document.querySelector('[data-profile-property=\'phone\']')
  if (!phoneWrap) {
    return false
  }
  let phoneInput = phoneWrap.querySelector('input')
  if (!phoneInput) {
    return false
  }
  let {value} = phoneInput
  let isNumber = checkPhoneNumber(value)
  return isNumber ? value : false
}

export function createElementFromHTML(htmlString) {
  var div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstChild
}

export function popup() {
  document.querySelector('#rc-widget-adapter-frame').contentWindow.postMessage({
    type: 'rc-adapter-syncMinimized',
    minimized: false
  }, '*')
  window.postMessage({
    type: 'rc-adapter-syncMinimized',
    minimized: false
  }, '*')
}

export function callWithRingCentral(phoneNumber, callAtOnce = true) {
  popup()
  document.querySelector('#rc-widget-adapter-frame').contentWindow.postMessage({
    type: 'rc-adapter-new-call',
    phoneNumber,
    toCall: callAtOnce
  }, '*')

}

let events = []
setInterval(() => {
  events.forEach(ev => {
    if (ev.checker(window.location.href)) {
      ev.callback()
    }
  })
}, 1000)

export function registerOnPathChange(checker, callback) {
  events.push({
    checker, callback
  })
}

/**
 * find the target parentNode
 * @param {Node} node
 * @param {String} className
 * @return {Boolean}
 */
export function findParentBySel(node, sel) {
  if (!node) {
    return false
  }
  let parent = node
  if (!parent || !parent.matches) {
    return false
  }
  if (parent.matches(sel)) {
    return parent
  }
  let res = false
  while (parent !== document.body) {
    parent = parent.parentNode
    if (!parent || !parent.matches) {
      break
    }
    if (parent.matches(sel)) {
      res = parent
      break
    }
  }
  return res
}
