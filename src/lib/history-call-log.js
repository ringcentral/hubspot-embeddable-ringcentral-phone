/**
 * history call log check and let user choose to sync call log
 */

import { Component } from 'react'
import { START_CHECK_CALL_LOG } from '../common/common'
import { getRcCallLogs } from '../common/rc-call-log'

export default class HistoryCallLogCheck extends Component {
  state = {
    phone: '',
    oid: '',
    callLogs: [],
    loadingCallLogs: false
  }

  componentDidMount () {
    this.initEvent()
  }

  onMsg = e => {
    const {
      type,
      phone,
      oid
    } = e.data || {}
    if (type === START_CHECK_CALL_LOG) {
      this.setState({
        phone, oid
      }, this.getCallLogs)
    }
  }

  initEvent () {
    window.addEventListener('message', this.onMsg)
  }

  getCallLogs = async () => {
    const callLogs = await getRcCallLogs()
      .catch(e => {
        console.log('get rc call logs failed')
        console.log(e)
      })
    this.setState(callLogs, this.checkLogs)
  }

  checkLogs = () => {
    const sessionsIds = this.state.callLogs.map(t => t.sessionId)
    if (!sessionsIds.length) {
      return false
    }
    this.setState({
      loadingCallLogs: true
    })

  }

  render () {
    const {
      phone
    } = this.state
    return phone ? this.renderContent() : null
  }
}
