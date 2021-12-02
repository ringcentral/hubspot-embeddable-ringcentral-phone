const _ = require('lodash')
const keys = [
  'clientID',
  'clientSecret',
  'appServer',
  'segmentAppName',
  'homePage',
  'download',
  'issue',
  'video',
  'name',
  'mediaPlayUrl',
  'authServer',
  'installUrl',
  'segmentKey',
  'serviceName',
  'smsTemplateId',
  'appName',
  'extensionName',
  'upgradeServer'
]
const config = _.pick(process.env, keys)
exports.config = config
exports.ringCentralConfigs = config
exports.thirdPartyConfigs = config
exports.minimize = process.env.minimize === 'true'
