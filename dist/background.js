function checkTab(tab) {
  return tab &&
    tab.url &&
    tab.url.startsWith('https://app.hubspot.com') &&
    !tab.url.startsWith('https://app.hubspot.com/login') &&
    !tab.url.startsWith('https://app.hubspot.com/myaccounts-beta') &&
    !tab.url.startsWith('https://app.hubspot.com/developer')
}

async function cb(tabId) {
  let tab = await new Promise((resolve) => {
    chrome.tabs.get(tabId, resolve)
  })
  if (
    checkTab(tab)
  ) {
    chrome.pageAction.show(tab.id)
    return
  }
}

chrome.tabs.onCreated.addListener(cb)
chrome.tabs.onUpdated.addListener(cb)

chrome.pageAction.onClicked.addListener(function (tab) {
  chrome.pageAction.show(tab.id)
  if (
    checkTab(tab)
  ) {
    // send message to content.js to to open app window.
    chrome.tabs.sendMessage(tab.id, { action: 'openAppWindow' }, function(response) {
      console.log(response)
    })
    return
  }
})


