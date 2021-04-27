import request from './request'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import dayjs from 'dayjs'

const {
  smsTemplateId
} = thirdPartyConfigs

export default async (opts, objectId) => {
  const data = {
    eventTemplateId: smsTemplateId,
    timestamp: dayjs(opts.mds[0].stamp).toISOString(),
    tokens: {
      countSMS: opts.mds.length
    },
    extraData: {
      smsList: opts.mds
    },
    objectId
  }
  const url = '/hs/create-log-sms'
  const res = await request(url, data)
  return res
}
