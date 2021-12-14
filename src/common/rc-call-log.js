
import request from './request'

export function getRcCallLogs (phone) {
  const url = '/rc/get-rc-call-logs?phone=' + phone
  return request(url)
}
