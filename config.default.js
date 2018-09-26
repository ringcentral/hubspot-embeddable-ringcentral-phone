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
    appKey: '',
    appServer: ''
  },

  //for third party related
  thirdPartyConfigs: {
    appKeyHS: '06b1ce1e-7059-4114-a517-4c8b3218c029',
    appSecretHS: 'a7e6a9b6-0791-4d0d-a01c-fe66677b2f32',
    appRedirectHS: 'https://zxdong262.github.io/hubspot-embeddable-ringcentral-phone/app/redirect.html',
    appServerHS: 'https://app.hubspot.com',
    apiServerHS: 'https://api.hubspot.com'
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



