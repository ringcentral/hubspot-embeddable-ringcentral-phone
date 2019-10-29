/**
 * config sample file
 * use `cp config.sample.js config.js` to create a config
 *
 */
module.exports = {

  // // dev related
  // devCPUCount: os.cpus().length,
  // devPort: 8020,

  // // build options
  // minimize: false,

  // congfigs to build app

  // ringcentral config
  ringCentralConfigs: {
    clientID: '',
    clientSecret: '',
    appServer: 'https://platform.devtest.ringcentral.com'
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
