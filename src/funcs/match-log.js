
import { checkCallLog } from '../common/log-call'
import _ from 'lodash'

export async function findMatchCallLog (data, oid) {
  const sessionIds = _.get(data, 'body.sessionIds') || _.get(data, 'body.conversationLogIds') || []
  if (!sessionIds.length) {
    return {}
  }
  let r = await checkCallLog(sessionIds, oid)
  if (r && r.result) {
    r = r.result.reduce((prev, d) => {
      const sid = d.sessionId
      prev[sid] = prev[sid] || []
      prev[sid].push({
        id: d.id,
        note: ''
      })
      return prev
    }, {})
  } else {
    r = {}
  }
  return r
}
