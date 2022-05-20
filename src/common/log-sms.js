import request from './request'
import { thirdPartyConfigs, appVersion } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import dayjs from 'dayjs'
import { checkCallLog } from './log-call'
import delay from 'timeout-as-promise'

const {
  smsTemplateId
} = thirdPartyConfigs

window.lastSMSLogRequestTime = 0

export default async (
  opts,
  objectId,
  isManuallySync,
  email,
  tokens
) => {
  const logged = await checkCallLog([opts.id], objectId)
  if (logged && logged.result && logged.result.length) {
    const r = logged.result[0]
    r.skipped = true
    return r
  }
  const data = {
    eventTemplateId: smsTemplateId,
    timestamp: dayjs(opts.mds[0].stamp).toISOString(),
    tokens: {
      countSMS: opts.mds.length,
      ...tokens
    },
    extraData: {
      smsList: opts.mds
    },
    objectId
  }
  const url = '/hs/create-log-sms'
  const now = Date.now()
  const minDelay = 3000
  let diff = now - window.lastSMSLogRequestTime
  while (diff < minDelay) {
    console.log('delay log sms to avoid trigger rate limit')
    await delay(minDelay)
    diff = Date.now() - window.lastSMSLogRequestTime
  }
  window.lastSMSLogRequestTime = Date.now()
  const res = await request(url, {
    data,
    appVersion,
    id: opts.id,
    isManuallySync
  })
  return res
}
