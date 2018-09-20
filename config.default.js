const os = require('os')
const extend = require('recursive-assign')
let config = {
  devCPUCount: os.cpus().length,
  devPort: 8020,
  appKey: '',
  appServer: '',
  minimize: false,
  appKeyHS: '06b1ce1e-7059-4114-a517-4c8b3218c029',
  appSecretHS: 'a7e6a9b6-0791-4d0d-a01c-fe66677b2f32',
  appRedirectHS: 'https://zxdong262.github.io/hubspot-embeddable-ringcentral-phone/app/redirect.html',
  appServerHS: 'https://app.hubspot.com',
  apiServerHS: 'https://api.hubspot.com'
}

try {
  extend(config, require('./config.js'))
} catch (e) {
  console.log(e.stack)
  console.warn('warn:no custom config file, use "cp config.sample.js config.js" to create one')
}

module.exports = config



