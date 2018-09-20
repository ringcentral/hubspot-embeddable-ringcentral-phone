
let newWindow

chrome.browserAction.onClicked.addListener(function (tab) {
  // open float app window when click icon in office page
  if (tab && tab.url && tab.url.startsWith('https://app.hubspot.com')) {
    // send message to content.js to to open app window.
    chrome.tabs.sendMessage(tab.id, { action: 'openAppWindow' }, function(response) {
      console.log(response)
    })
    return
  }
})

chrome.windows.onRemoved.addListener(function (id) {
  if (newWindow && newWindow.id === id) {
    newWindow = null
  }
})
