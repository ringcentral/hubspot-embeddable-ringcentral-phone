/**
 * history call log check and let user choose to sync call log
 */

import _ from 'lodash'
import { Component } from 'react'
import { START_CHECK_CALL_LOG } from '../common/common'
import { getRcCallLogs } from '../common/rc-call-log'
import { findMatchCallLog } from '../funcs/match-log'
import copy from 'json-deep-copy'
import { Button, Spin } from 'antd'
import LogItem from './history-call-log-item'
import { doSyncOne } from '../funcs/log-sync'
import './call-log-check.styl'
import { CloseCircleOutlined } from '@ant-design/icons'

export default class HistoryCallLogCheck extends Component {
  state = {
    oid: '',
    contact: null,
    logs: [],
    callLogs: [],
    callLogsSelected: [],
    loadingCallLogs: false,
    submitting: false,
    visible: false
  }

  componentDidMount () {
    this.initEvent()
  }

  onMsg = e => {
    const {
      type,
      oid,
      contact
    } = e.data || {}
    if (type === START_CHECK_CALL_LOG) {
      this.removeEvent()
      this.setState({
        oid,
        contact: copy(contact)
      }, this.getCallLogs)
    }
  }

  initEvent () {
    window.addEventListener('message', this.onMsg)
  }

  removeEvent () {
    window.removeEventListener('message', this.onMsg)
  }

  checkDisabled = () => {
    return !this.state.callLogsSelected.length
  }

  handleClose = () => {
    this.setState({
      visible: false
    })
  }

  addMatches = (con) => {
    const { direction } = con
    const arr = [copy(this.state.contact)]
    con.fromMatches = direction === 'Inbound'
      ? arr
      : []
    con.toMatches = direction === 'Inbound'
      ? []
      : arr
    return con
  }

  handleSubmit = async () => {
    this.setState({
      submitting: true
    })
    const { callLogsSelected, callLogs, contact } = this.state
    for (const id of callLogsSelected) {
      const item = this.addMatches(
        copy(_.find(callLogs, d => d.sessionId === id))
      )
      await doSyncOne(
        contact,
        {
          call: item
        },
        true
      )
    }
    this.setState({
      phone: '',
      submitting: false,
      visible: false
    })
    this.noti && this.noti.destroy()
  }

  onHandleClick = item => {
    const { sessionId } = item
    this.setState(old => {
      const sles = copy(old.callLogsSelected)
      if (sles.includes(sessionId)) {
        _.remove(sles, d => d === sessionId)
      } else {
        sles.push(sessionId)
      }
      return {
        callLogsSelected: sles
      }
    })
  }

  handleSelectAll = () => {
    this.setState({
      callLogsSelected: this.state.callLogs.map(d => d.sessionId)
    })
  }

  handleSelectNone = () => {
    this.setState({
      callLogsSelected: []
    })
  }

  handleSelectReverse = () => {
    this.setState({
      callLogsSelected: _.difference(
        this.state.callLogs.map(d => d.sessionId),
        this.state.callLogsSelected
      )
    })
  }

  getCallLogs = async () => {
    const { phoneNumbers } = this.state.contact
    let logs = []
    for (const p of phoneNumbers) {
      const {
        phoneNumber
      } = p
      if (phoneNumber) {
        const arr = await getRcCallLogs(phoneNumber)
          .catch(e => {
            console.log('get rc call logs failed')
            console.log(e)
          })
        if (arr && arr.length) {
          logs = [
            ...logs,
            ...arr
          ]
        }
      }
    }
    if (!logs.length) {
      return console.log('no history call log not synced')
    }
    this.setState({
      logs
    }, this.checkLogs)
  }

  checkLogs = async () => {
    const sessionsIds = this.state.logs.map(t => t.sessionId)
    if (!sessionsIds.length) {
      return false
    }
    this.setState({
      loadingCallLogs: true
    })
    const len = sessionsIds.length
    const pageSize = 10
    let index = 0
    const {
      oid
    } = this.state
    for (;index < len;) {
      const arr = this.state.logs.slice(index, pageSize)
      const r = await findMatchCallLog({
        body: { sessionIds: arr.map(d => d.sessionId) }
      }, oid)
      this.setState(old => {
        const narr = copy(old.callLogs)
        const arr1 = copy(old.callLogsSelected)
        for (const it of arr) {
          if (!r[it.sessionId]) {
            narr.push(it)
            arr1.push(it.sessionId)
          }
        }
        return {
          callLogs: narr,
          callLogsSelected: arr1
        }
      })
      index = index + pageSize
    }
    this.setState({
      loadingCallLogs: false
    }, this.showCallsNeedBeLogged)
  }

  renderControl = () => {
    return (
      <div className='rc-pd1y'>
        <span
          className='pointer rc-mg1r rc-call-log-control'
          onClick={this.handleSelectAll}
        >
          All
        </span>
        <span
          className='pointer rc-mg1r rc-call-log-control'
          onClick={this.handleSelectNone}
        >
          None
        </span>
        <span
          className='pointer rc-mg1r rc-call-log-control'
          onClick={this.handleSelectReverse}
        >
          Reverse
        </span>
      </div>
    )
  }

  renderItem = item => {
    return (
      <LogItem
        item={item}
        handleClick={this.onHandleClick}
        selected={this.state.callLogsSelected.includes(item.sessionId)}
        key={item.sessionId}
      />
    )
  }

  renderList = () => {
    return (
      <div className='rc-log-list rc-pd1y'>
        {
          this.state.callLogs
            .map(this.renderItem)
        }
      </div>
    )
  }

  renderContent = () => {
    return (
      <div className='rc-call-log-check-wrap'>
        <div className='rc-pd3'>
          <div className='pd2y'>
            <span className='rc-call-check-title'>Call logs not synced</span>
            <CloseCircleOutlined
              title='Close'
              className='rc-call-check-close rc-fright'
              onClick={this.handleClose}
            />
          </div>
          <Spin spinning={this.state.submitting}>
            {this.renderControl()}
            {this.renderList()}
            <div className='rc-pd1y'>
              <Button
                type='primary'
                onClick={this.handleSubmit}
                disabled={this.checkDisabled()}
              >
                Sync to HubSpot
              </Button>
            </div>
            <p>* Only check recent 100 calls in 15 days.</p>
          </Spin>
        </div>
      </div>
    )
  }

  showCallsNeedBeLogged = () => {
    this.setState({
      visible: true
    })
  }

  render () {
    return this.state.visible && this.state.callLogs.length
      ? this.renderContent()
      : null
  }
}
