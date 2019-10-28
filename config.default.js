const os = require('os')
const extend = require('recursive-assign')
let config = {

  // dev related
  devCPUCount: os.cpus().length,
  devPort: 8020,

  // build options
  minimize: false,

  // congfigs to build app

  // ringcentral config
  ringCentralConfigs: {
    clientID: '',
    clientSecret: '',
    appServer: 'https://platform.ringcentral.com'
  },

  // for third party related
  thirdPartyConfigs: {
    appServerHS: 'https://app.hubspot.com',
    apiServerHS: 'https://api.hubspot.com',
    showCallLogSyncForm: true,
    serviceName: 'Hubspot',
    pageSize: 10000,
    dbSchema: {
      portalId: {
        dataType: 'string'
      },
      companyId: {
        dataType: 'string'
      },
      isCompany: {
        dataType: 'string',
        enableSearch: true
      },
      firstname: {
        dataType: 'string'
      },
      lastname: {
        dataType: 'string'
      }
    }
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
