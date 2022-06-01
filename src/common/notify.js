import { notification } from 'antd'

export function notify (msg, type = 'warn', duration = 3) {
  notification[type]({
    key: 'rc-common-notify',
    message: type,
    description: msg
  })
}
