import initBackground from 'ringcentral-embeddable-extension-common/src/spa/background'

/**
 * for background.js, check current tab is extension target tab or not
 * @param {object} tab
 */
function checkTab(tab) {
  return tab &&
    tab.url &&
    tab.url.startsWith('https://app.hubspot.com') &&
    !tab.url.startsWith('https://app.hubspot.com/login') &&
    !tab.url.startsWith('https://app.hubspot.com/myaccounts-beta') &&
    !tab.url.startsWith('https://app.hubspot.com/developer')
}

initBackground(checkTab)
