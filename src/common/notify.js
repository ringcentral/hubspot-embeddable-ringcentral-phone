import { notification } from 'antd'

export function notify (msg, type = 'warn', duration = 3) {
  notification[type]({
    message: type,
    description: msg
  })
}
