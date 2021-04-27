/**
 * react element app
 */

import { useEffect, useState } from 'react'
import { useDelta, useConditionalEffect } from 'react-delta'
import eq from 'fast-deep-equal'
import Drag from 'react-draggable'
import { Modal, Tooltip } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import './antd.less'
import 'antd/dist/antd.less'
import { rcIconSvg } from 'ringcentral-embeddable-extension-common/src/common/rc-icons'
import { appVersion, ringCentralConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import link from '../common/external-link'
import { checkSync, startSync } from '../common/sync'
import getDispositions from '../common/get-dispositions'
import { onTriggerLogin, onLoginCallback } from '../common/handle-login'
import { rc } from '../common/common'

const loopTimer = 5000

export default () => {
  const [ state, setter ] = useState({
    loggedIn: false,
    // checkSyncCount: 0,
    syncStatus: 'unknown'
  })
  const loggedInDelta = useDelta(state.loggedIn)
  function setState (update) {
    setter(old => {
      return {
        ...old,
        ...update
      }
    })
  }
  function openAbout () {
    const content = (
      <div>
        <div className='pd1b'>
          <b>Version</b>: {appVersion}
        </div>
        <div className='pd1b'>
          <b>HomePage</b>: {link(ringCentralConfigs.homePage)}
        </div>
        <div className='pd1b'>
          <b>Download</b>: {link(ringCentralConfigs.download)}
        </div>
      </div>
    )
    Modal.info({
      title: 'About ' + ringCentralConfigs.name,
      content
    })
  }
  function onEvent (e) {
    if (!e || !e.data) {
      return false
    }
    const { data } = e
    console.debug(data)
    const { type, loggedIn, callbackUri } = data
    if (callbackUri) {
      return onLoginCallback(data)
    }
    if (type === 'rc-login-status-notify') {
      console.debug('rc logined', loggedIn)
      rc.rcLogined = loggedIn
      setState({
        loggedIn
      })
    } else if (type === 'rc-login-popup-notify') {
      onTriggerLogin(data)
    }
  }
  async function loopCheckSync () {
    const syncStatus = await checkSync()
    if (!syncStatus) {
      return
    }
    if (syncStatus && syncStatus.percent === 100) {
      setState({
        syncStatus: 'synced'
      })
    } else if (syncStatus && syncStatus.percent === 0) {
      setState({
        syncStatus: 'syncing'
      })
      setTimeout(loopCheckSync, loopTimer)
    }
  }
  async function init () {
    const syncStatus = await checkSync()
    if (!syncStatus) {
      return
    }
    if (syncStatus === 'no') {
      setState({
        syncStatus: 'notStarted'
      })
      startSync()
      setTimeout(loopCheckSync, loopTimer)
    } else if (syncStatus && syncStatus.percent === 100) {
      setState({
        syncStatus: 'synced'
      })
    } else if (syncStatus && syncStatus.percent === 0) {
      setState({
        syncStatus: 'syncing'
      })
      setTimeout(loopCheckSync, loopTimer)
    }
    const callResultList = await getDispositions()
    console.log('callResultList', callResultList)
    window.callResultList = callResultList || []
  }
  useEffect(() => {
    window.addEventListener('message', onEvent)
    return () => {
      window.removeEventListener('message', onEvent)
    }
  }, [])
  useConditionalEffect(() => {
    init()
  }, loggedInDelta && loggedInDelta.prev === false && !eq(loggedInDelta.prev, loggedInDelta.curr))
  function renderSync () {
    if (state.syncStatus !== 'syncing') {
      return null
    }
    return (
      <Tooltip title='Syncing contacts in server, before syncing all contacts, you will not be able to sync call and SMS to contact, when sync finished, this icon will be hidden'>
        <SyncOutlined spin />
      </Tooltip>
    )
  }
  const title = `Click to check ${ringCentralConfigs.name} details`
  return (
    <Drag>
      <div className='rc-drag-wrap'>
        <Tooltip title={title}>
          <span onClick={openAbout} className='rc-logo-wrap'>
            {rcIconSvg()}
          </span>
        </Tooltip>
        {renderSync()}
      </div>
    </Drag>
  )
}
