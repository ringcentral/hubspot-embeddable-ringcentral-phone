const os = require('os')
const extend = require('recursive-assign')
const config = {

  // dev related
  devCPUCount: os.cpus().length,
  devPort: 8020,

  // build options
  minimize: false,

  // extension Key
  extensionKey: 'yyyyyyyyyyyyyyyyyyyyyy',

  // congfigs to build app

  // ringcentral config
  ringCentralConfigs: {
    // extensionId must pare with extensionKey
    extensionId: 'extensionidstringxxxxxxxxxxxxxx',
    clientID: '',
    clientSecret: '',
    appServer: 'https://platform.ringcentral.com',
    segmentAppName: 'RingCentral for HubSpot Chrome extension'
  },

  // for third party related
  thirdPartyConfigs: {
    showCallLogSyncForm: true,
    serviceName: 'HubSpot',
    extensionName: 'RingCentral for HubSpot Chrome extension(Community Edition)'
  }

}

try {
  extend(config, require('./config.js'))
} catch (e) {
  if (e.stack.includes('Cannot find module \'./config.js\'')) {
    console.warn('no custom config file, it is ok, but you can use "cp config.sample.js config.js" to create one')
  } else {
    console.log(e)
  }
}

module.exports = config
