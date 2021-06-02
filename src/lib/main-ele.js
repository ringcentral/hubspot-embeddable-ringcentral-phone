/**
 * react element app
 */

import { useEffect, useState } from 'react'
import { useDelta, useConditionalEffect } from 'react-delta'
import eq from 'fast-deep-equal'
import Drag from 'react-draggable'
import { Modal, Tooltip, Tabs, Switch, Button } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import './antd.less'
import 'antd/dist/antd.less'
import { appVersion, ringCentralConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import link from '../common/external-link'
import { checkSync, startSync } from '../common/sync'
import getDispositions from '../common/get-dispositions'
import { onTriggerLogin, onLoginCallback } from '../common/handle-login'
import { rc } from '../common/common'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'

const { TabPane } = Tabs

const loopTimer = 5000

export const rcIconSvg = (size = 30) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 16 16'
      className='rc-logo'
    >
      <g fill='none' fill-rule='evenodd'>
        <rect width='16' height='16' fill='#F80' rx='3.75' />
        <path fill='#FFF' d='M5.846 2h4.308c1.337 0 1.822.14 2.311.4.49.262.873.646 1.134 1.135.262.489.401.974.401 2.31v7.976c0 .062-.006.085-.019.108a.127.127 0 0 1-.052.052c-.023.013-.046.019-.108.019H5.846c-1.337 0-1.822-.14-2.311-.4A2.726 2.726 0 0 1 2.4 12.464c-.262-.489-.401-.974-.401-2.31v-4.31c0-1.336.14-1.821.4-2.31A2.726 2.726 0 0 1 3.536 2.4C4.024 2.139 4.509 2 5.845 2z' />
        <path fill='#0684BD' d='M5.078 3.813h5.84c.7 0 1.266.566 1.266 1.265v2.953c0 .925-.874 1.505-1.511 1.692.285.54.733 1.356 1.343 2.449H9.953L8.592 9.815h-.088a.28.28 0 0 1-.28-.28V7.883h1.898V5.873H5.881v3.604c0 .6.118 1.64 1.025 2.695H4.843c-.758-.555-1.03-1.689-1.03-2.357V5.078c0-.699.566-1.266 1.265-1.266z' />
      </g>
    </svg>
  )
}

export default function Main () {
  const [state, setter] = useState({
    loggedIn: false,
    logSMSAsThread: false,
    filterSMSThread: false,
    autoSyncToAll: false,
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
    setState({
      aboutVisible: true
    })
  }
  const sets = [
    // {
    //   key: 'logSMSAsThread',
    //   desc: 'Log SMS thread as one log'
    // },
    // {
    //   desc: 'For SMS thread Only show SMS in 5 minutes',
    //   key: 'filterSMSThread'
    // },
    {
      desc: 'Auto sync call/message log to all matched contact(do not show selection)',
      key: 'autoSyncToAll'
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
      const v = await ls.get(`rc-${a.key}`) || true
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
  function startSyncNow () {
    setState({
      syncStatus: 'syncing'
    })
    startSync()
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
    const callResultList = await getDispositions()
    console.log('callResultList', callResultList)
    window.rc.callResultList = callResultList && callResultList.result ? callResultList.result : []
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
