import initBackground from 'ringcentral-embeddable-extension-common/src/spa/background'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import _ from 'lodash'

/**
 * for background.js, check current tab is extension target tab or not
 * @param {object} tab
 */
function checkTab (tab) {
  return tab &&
    tab.url &&
    tab.url.startsWith('https://app.hubspot.com') &&
    !tab.url.startsWith('https://app.hubspot.com/login') &&
    !tab.url.startsWith('https://app.hubspot.com/myaccounts-beta') &&
    !tab.url.startsWith('https://app.hubspot.com/developer')
}

let list = [
  /^https:\/\/api\.hubspot\.com.+/
]
if (thirdPartyConfigs.upgradeServer) {
  list.push(
    new RegExp(
      '^' +
      _.escapeRegExp(thirdPartyConfigs.upgradeServer)
    )
  )
}
initBackground(checkTab, list)
