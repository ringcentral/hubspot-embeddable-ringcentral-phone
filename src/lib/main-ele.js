/**
 * react element app
 */

import { useEffect, useState } from 'react'
import { useDelta, useConditionalEffect } from 'react-delta'
import eq from 'fast-deep-equal'
import Drag from 'react-draggable'
import { Modal, Tooltip, Tabs, Switch, Button, message } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import './antd.less'
import 'antd/dist/antd.less'
import { appVersion, ringCentralConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import link from '../common/external-link'
import { checkSync, startSync } from '../common/sync'
import getDispositions from '../common/get-dispositions'
import { onTriggerLogin, onLoginCallback, install } from '../common/handle-login'
import { rc, checkCallLogOnStartKey } from '../common/common'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import { rcIconSvg } from './rc-logo'

const { TabPane } = Tabs

const loopTimer = 5000

export default function Main () {
  const [state, setter] = useState({
    loggedIn: false,
    logSMSAsThread: false,
    filterSMSThread: false,
    checkCallLogOnStart: false,
    syncStatus: 'unknown',
    aboutVisible: false
  })
  const isSyncing = state.syncStatus === 'syncing'
  const loggedInDelta = useDelta(state.loggedIn)
  function setState (update) {
    setter(old => {
      return {
        ...old,
        ...update
      }
    })
  }
  function setGlob (ext) {
    Object.assign(window.rc, ext)
    const key = Object.keys(ext)[0]
    ls.set(`rc-${key}`, Object.values(ext)[0])
    setState(ext)
  }
  function hide () {
    setState({
      aboutVisible: false
    })
  }
  function show () {
    loadSettings()
    setState({
      aboutVisible: true
    })
  }
  const sets = [
    // {
    //   key: 'logSMSAsThread',
    //   desc: 'Log SMS thread as one log'
    // },
    {
      desc: 'Check call logs not synced to HubSpot on start',
      key: checkCallLogOnStartKey
    }
  ]
  function renderSetting (conf) {
    const { key, desc } = conf
    const v = state[key]
    const pps = {
      checked: v,
      unCheckedChildren: desc,
      checkedChildren: desc,
      onChange: v => {
        setGlob({
          [key]: v
        })
      }
    }
    return (
      <div className='rc-pd1b'>
        <Switch
          {...pps}
        />
      </div>
    )
  }
  function renderSettings () {
    return (
      <TabPane key='settings' tab='Settings'>
        {
          sets.map(renderSetting)
        }
      </TabPane>
    )
  }
  function openAbout () {
    const content = (
      <Tabs defaultActiveKey='about'>
        <TabPane key='about' tab='About'>
          <div className='rc-pd1b'>
            <b>Version</b>: {appVersion}
          </div>
          <div className='rc-pd1b'>
            <b>HomePage</b>: {link(ringCentralConfigs.homePage)}
          </div>
          <div className='rc-pd1b'>
            <b>Download</b>: {link(ringCentralConfigs.download)}
          </div>
          <div className='rc-pd1b'>
            <b>Submit issues</b>: {link(ringCentralConfigs.issue)}
          </div>
          <div className='rc-pd1b'>
            <b>Video guide</b>: {link(ringCentralConfigs.video)}
          </div>
          <div className='rc-pd1y'>
            <Button
              type='primary'
              loading={isSyncing}
              disabled={isSyncing && !state.loggedIn}
              onClick={startSyncNow}
            >
              Rebuild phone contact index
            </Button>
          </div>
          <div className='rc-pd1y'>
            <Button
              type='primary'
              onClick={install}
            >
              ReConnect your HubSpot account
            </Button>
            <p>* You may only need this if you uninstalled the app from HubSpot settings and want it back</p>
          </div>
        </TabPane>
        {renderSettings()}
      </Tabs>
    )
    const pops = {
      title: 'About ' + ringCentralConfigs.name,
      width: 700,
      onCancel: hide,
      footer: null,
      visible: state.aboutVisible
    }
    return (
      <Modal
        {...pops}
      >
        {content}
      </Modal>
    )
  }
  async function loadSettings () {
    for (const a of sets) {
      let v = await ls.get(`rc-${a.key}`)
      v = v !== 'no'
      window.rc[a.key] = v
      setState({
        [a.key]: v
      })
    }
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
  async function startSyncFunc () {
    const r = await startSync()
    if (!r) {
      message.error('Sync failed')
      setState({
        syncStatus: 'unknown'
      })
    } else if (r !== 'ok' && r) {
      setState({
        syncStatus: 'unknown'
      })
      message.error(r)
    }
  }
  function startSyncNow () {
    setState({
      syncStatus: 'syncing'
    })
    Modal.info({
      title: 'Syncing contacts',
      content: (
        <div className='rc-pd1b'>
          <div className='rc-pd1b'>Server start to sync contacts data, to build the contact lookup mapping(we do not store your contact data in our server), so the extension could match phone number with contact and create proper call/SMS log.</div>
          <div>Before finishing the sync, call/SMS log may not work, reload contact to check, if you see the click to call icon, then this contact is synced.</div>
          <div>When syncing finished, the loading icon on left bottom corner will disappear.</div>
        </div>
      )
    })
    startSyncFunc()
    setTimeout(loopCheckSync, loopTimer)
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
    } else if (syncStatus === 'no') {
      startSyncNow()
    }
  }
  async function init () {
    const syncStatus = await checkSync()
    if (!syncStatus) {
      return
    }
    if (syncStatus === 'no') {
      startSyncNow()
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
    let callResultList = await getDispositions()
    callResultList = (callResultList && callResultList.result ? callResultList.result : []).filter(d => !d.deleted)
    console.log('callResultList', callResultList)
    window.rc.callResultList = callResultList
  }
  useEffect(() => {
    window.addEventListener('message', onEvent)
    loadSettings()
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
      <Tooltip title='Building phone-contacts index in server, before finish all phone-contacts index building, you will not be able to sync call and SMS to contacts, when sync finished, this icon will be hidden, we will not store contact information in our database.'>
        <SyncOutlined spin className='rc-iblock rc-mg1l' />
      </Tooltip>
    )
  }
  const title = `Click to check ${ringCentralConfigs.name} details and settings`
  return (
    <Drag>
      <div className='rc-drag-wrap'>
        <Tooltip title={title}>
          <span onClick={show} className='rc-logo-wrap rc-iblock'>
            {rcIconSvg(16)}
          </span>
        </Tooltip>
        {renderSync()}
        {openAbout()}
      </div>
    </Drag>
  )
}
