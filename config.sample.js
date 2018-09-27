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
    // clientID: 'qypCMJuSOOseWivhrrGVeCrw',

    // your ringCentral app's Auth Server URL
    // appServer: 'https://platform.devtest.ringcentral.com'
  },


  //// for third party related
  thirdPartyConfigs: {
    // hubspot app client ID, required
    // get it from your hubspot app, https://app.hubspot.com/developer
    clientIDHS: ,

    // hubspot app client Secret,
    clientSecretHS: ,

    // hubspot app auth server, not required
    // appServerHS: 'https://app.hubspot.com',

    // hubspot app api server, not required
    // apiServerHS: 'https://app.hubspot.com',

    // hubspot app redirect uri, not required
    // appRedirectHS: 'https://zxdong262.github.io/hubspot-embeddable-ringcentral-phone/app/redirect.html',
  },

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

 clientID: 'n2Hbs3xyRW6PlCgAJ5tV5A',
 appServer: '	https://platform.devtest.ringcentral.com',

}




