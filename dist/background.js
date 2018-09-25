
let newWindow

chrome.pageAction.onClicked.addListener(function (tab) {
  // open float app window when click icon in office page
  if (
    tab &&
    tab.url &&
    tab.url.startsWith('https://app.hubspot.com') &&
    !tab.url.startsWith('https://app.hubspot.com/login') &&
    !tab.url.startsWith('https://app.hubspot.com/myaccounts-beta')
  ) {
    // send message to content.js to to open app window.
    chrome.tabs.sendMessage(tab.id, { action: 'openAppWindow' }, function(response) {
      console.log(response)
    })
    chrome.pageAction.show(tab.id)
    return
  }
})

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   let {
//     method,
//     key,
//     value
//   } = request
//   if (method === 'getLocalStorage') {
//     sendResponse({
//       value: localStorage.getItem(key),
//       key
//     })
//   } else if (method === 'setLocalStorage') {
//     localStorage.setItem(key, value)
//     sendResponse({})
//   } else if (method === 'removeLocalStorage') {
//     localStorage.removeItem(key)
//     sendResponse({})
//   } else {
//     sendResponse({})
//   }
// })

chrome.windows.onRemoved.addListener(function (id) {
  if (newWindow && newWindow.id === id) {
    newWindow = null
  }
})

