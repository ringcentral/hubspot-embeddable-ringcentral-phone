
import initBackground from 'ringcentral-embeddable-extension-common/src/spa/background'
import { thirdPartyConfigs, ringCentralConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import _ from 'lodash'

/**
 * for background.js, check current tab is extension target tab or not
 * @param {object} tab
 */
function checkTab (tab) {
  if (!tab || !tab.url) {
    return false
  }
  const { url } = tab
  return /https:\/\/app([-\w\d]+)?\.hubspot\.com\//.test(url) &&
    !/https:\/\/app([-\w\d]+)?\.hubspot\.com\/login/.test(url) &&
    !/https:\/\/app([-\w\d]+)?\.hubspot\.com\/myaccounts-beta/.test(url) &&
    !/https:\/\/app([-\w\d]+)?\.hubspot\.com\/developer/.test(url)
}

const list = [
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
if (ringCentralConfigs.authServer) {
  list.push(
    new RegExp(
      '^' +
      _.escapeRegExp(ringCentralConfigs.authServer)
    )
  )
}
initBackground(checkTab, list)
