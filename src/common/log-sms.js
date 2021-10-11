import request from './request'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import dayjs from 'dayjs'
import { checkCallLog } from './log-call'

const {
  smsTemplateId
} = thirdPartyConfigs

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
  const res = await request(url, {
    data,
    id: opts.id,
    isManuallySync
  })
  return res
}
