/**
 * history call log check and let user choose to sync call log
 */

import _ from 'lodash'
import { Component } from 'react'
import { START_CHECK_CALL_LOG, format164, checkCallLogOnStartKey } from '../common/common'
import { getRcCallLogs } from '../common/rc-call-log'
import { findMatchCallLog } from '../funcs/match-log'
import copy from 'json-deep-copy'
import { Button, Spin, notification } from 'antd'
import LogItem from './history-call-log-item'
import { doSyncOne } from '../funcs/log-sync'
import './call-log-check.styl'
import { CloseCircleOutlined } from '@ant-design/icons'
import cachedSearch, { searchPhone } from '../common/search'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'

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

  lsKey = 'rc-' + checkCallLogOnStartKey

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

  initEvent = async () => {
    const ignore = await ls.get(`rc-${checkCallLogOnStartKey}`)
    if (ignore === 'no') {
      console.log('skip onstart call log check')
      return false
    }
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

  addMatches = (con, contacts) => {
    const { direction } = con
    con.fromMatches = direction === 'Inbound'
      ? contacts
      : []
    con.toMatches = direction === 'Inbound'
      ? []
      : contacts
    return con
  }

  getContacts = item => {
    const n = this.getLogNumber(item)
    const arr = [n].filter(d => d)
    if (!arr.length) {
      return []
    }
    return cachedSearch(
      arr,
      true,
      false
    )
  }

  handleHide = async () => {
    await ls.set(this.lsKey, 'no')
    this.setState({
      phone: '',
      submitting: false,
      visible: false
    })
    this.noti && this.noti.destroy()
    notification.info({
      message: 'Call log check on start disabled',
      description: 'You can turn on call log check on start from left bottom RingCentral icon'
    })
  }

  ignorePrefix = 'rc-ignore-call-'

  handleIgnoreLogs = async () => {
    const { callLogsSelected, callLogs } = this.state
    for (const id of callLogsSelected) {
      console.log('ignore call', id)
      await ls.set(`${this.ignorePrefix}${id}`, 'yes')
    }
    this.setState({
      callLogs: callLogs.filter(d => {
        return !callLogsSelected.includes(d.sessionId)
      })
    })
  }

  handleSubmit = async () => {
    this.setState({
      submitting: true
    })
    const { callLogsSelected, callLogs } = this.state
    for (const id of callLogsSelected) {
      const log = copy(_.find(callLogs, d => d.sessionId === id))
      const contacts = await this.getContacts(log)
      const item = this.addMatches(
        log, contacts
      )
      for (const contact of contacts) {
        await doSyncOne(
          contact,
          {
            call: item
          },
          {},
          true
        ).catch(err => {
          console.log('create call log failed')
          console.log(err)
        })
      }
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

  handleSelectCurrent = () => {
    this.setState({
      callLogsSelected: this.filterSelectCallLogs()
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

  filterCallLogs = (arr, phone) => {
    return arr.filter(obj => {
      const n = this.getLogNumber(obj)
      return n === phone
    })
  }

  filterSelectCallLogs = () => {
    const { phoneNumbers } = this.state.contact
    const arr = this.state.callLogs
    let logs = []
    for (const p of phoneNumbers) {
      const {
        phoneNumber
      } = p
      if (phoneNumber) {
        logs = [
          ...logs,
          ...this.filterCallLogs(arr, phoneNumber)
        ]
      }
    }
    return _.uniqBy(logs, d => d.id).map(d => d.sessionId)
  }

  getCallLogs = async () => {
    const logs = await getRcCallLogs('')
      .catch(e => {
        console.log('get rc call logs failed')
        console.log(e)
        return []
      })
    if (!logs.length) {
      return console.log('no history call log not synced')
    }
    this.setState({
      logs
    }, this.checkLogs)
  }

  // getCallLogs = async () => {
  //   const { phoneNumbers } = this.state.contact
  //   let logs = []
  //   for (const p of phoneNumbers) {
  //     const {
  //       phoneNumber
  //     } = p
  //     if (phoneNumber) {
  //       const arr = await getRcCallLogs(phoneNumber)
  //         .catch(e => {
  //           console.log('get rc call logs failed')
  //           console.log(e)
  //         })
  //       if (arr && arr.length) {
  //         logs = [
  //           ...logs,
  //           ...this.filterCallLogs(arr, phoneNumber)
  //         ]
  //       }
  //     }
  //   }
  //   if (!logs.length) {
  //     return console.log('no history call log not synced')
  //   }
  //   this.setState({
  //     logs
  //   }, this.checkLogs)
  // }

  getLogNumber = log => {
    const {
      direction
    } = log
    return direction === 'Inbound'
      ? format164(
          _.get(log, 'from.phoneNumber') || ''
        )
      : format164(
        _.get(log, 'to.phoneNumber') || ''
      )
  }

  // only show those match contact id
  filterLogItems = async (logs) => {
    const arr = logs.map(async (item) => {
      const ig = await ls.get(`${this.ignorePrefix}${item.sessionId}`)
      if (ig) {
        console.log('exist in ls', item.sessionId)
        return ''
      }
      const number = this.getLogNumber(item)
      const arr = [number].filter(d => d)
      if (!arr.length) {
        return ''
      }
      return searchPhone(
        arr,
        true,
        true
      ).then((r) => {
        if (r && r.length) {
          return item
        } else {
          return ''
        }
      })
    })
    const rr = await Promise.all(arr)
    return rr.filter(d => d)
  }

  checkLogs = async () => {
    const logsOk = await this.filterLogItems(
      copy(this.state.logs)
    )
    if (!logsOk.length) {
      return false
    }
    const sessionsIds = logsOk.map(t => t.sessionId)
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
      const arr = logsOk.slice(index, pageSize)
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
        <span
          className='pointer rc-mg1r rc-call-log-control'
          onClick={this.handleSelectCurrent}
        >
          Current contact only
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
    const {
      submitting
    } = this.state
    if (submitting) {
      return (
        <div className='rc-call-log-check-wrap submit'>Submitting...</div>
      )
    }
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
              <Button
                type='primary'
                className='rc-mg1l'
                onClick={this.handleIgnoreLogs}
                disabled={this.checkDisabled()}
              >
                Ignore these calls
              </Button>
            </div>
            <p>
              <span>* Only check recent 100 calls in 15 days.</span>
              <Button
                type='danger'
                className='rc-mg1l'
                size='small'
                onClick={this.handleHide}
              >
                Do not show this panel
              </Button>
            </p>
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
