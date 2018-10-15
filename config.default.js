const os = require('os')
const extend = require('recursive-assign')
let config = {

  //dev related
  devCPUCount: os.cpus().length,
  devPort: 8020,

  //build options
  minimize: false,

  //congfigs to build app

  //ringcentral config
  ringCentralConfigs: {
    clientID: '',
    appServer: ''
  },

  //for third party related
  thirdPartyConfigs: {
    clientIDHS: '',
    clientSecretHS: '',
    appRedirectHS: 'https://zxdong262.github.io/hubspot-embeddable-ringcentral-phone/app/redirect.html',
    appServerHS: 'https://app.hubspot.com',
    apiServerHS: 'https://api.hubspot.com',
    showCallLogSyncForm: true
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



