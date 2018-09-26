/**
 * config sample file
 * use `cp config.sample.js config.js` to create a config
 *
 */
module.exports = {

  //// dev related

  // local dev server port
  // devPort: 8020,

  // build process count
  // devCPUCount: os.cpus().length,

  //// build options

  // minimize content.js
  // minimize: false

  // congfigs to build app

  //// ringcentral config

  ringCentralConfigs: {
    // your ringCentral app's Client ID
    appKey: 'qypCMRJuSOOivhrrGVeCrw',

    // your ringCentral app's Auth Server URL
    appServer: 'https://platform.devtest.ringcentral.com'
  },


  //// for third party related
  /*
  thirdPartyConfigs: {
    // hubspot app client ID,
    // get it from your hubspot app, https://app.hubspot.com/developer
    // appKeyHS: ,

    // hubspot app client Secret,
    // appSecretHS: ,

    // hubspot app auth server
    // appServerHS: ,

    // hubspot app api server
    // apiServerHS: ,

    // hubspot app redirect uri
    // appRedirectHS: ,
  },
  */

  //// content modification for click to call feature
  /*
  insertClickToCallButton: [
    {
      urlCheck: href => {
        return href.includes('?interaction=call')
      },
      parentToInsertButton: [
        () => {
          return document.querySelector('.start-call').parentNode
        },
        () => {
          return document
            .querySelector('.panel-is-call button [data-key="twilio.notEnabled.skipOnboarding"]')
            .parentNode.parentNode
        }
      ],
      insertMethod: [
        'insertBefore',
        'append'
      ]
    }
  ],
  hoverShowClickToCallButton: [
    {
      urlCheck: href => {
        return href.includes('contacts/list/view/all/')
      },
      selector: 'table.table tbody tr'
    }
  ]
  */

 appKey: 'n2Hbs3xyRW6PlCgAJ5tV5A',
 appServer: '	https://platform.devtest.ringcentral.com',

}




