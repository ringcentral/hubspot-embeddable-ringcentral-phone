
import request from './request'
import dayjs from 'dayjs'

export function getRcCallLogs (phone) {
  const from = dayjs().add(-15, 'days').format('YYYY-MM-DD')
  const url = `/rc/get-rc-call-logs?phone=${encodeURIComponent(phone)}&from=${encodeURIComponent(from)}`
  return request(url)
}
