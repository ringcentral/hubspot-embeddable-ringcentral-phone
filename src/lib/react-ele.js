/**
 * react element app
 */

import { useEffect } from 'react'
import { Modal, Button, notification } from 'antd'
import { SyncOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { fetchAllContacts, notifyReSyncContacts } from '../feat/contacts'
import { doAuth } from '../feat/auth'
// import AutoSync from './auto-resync'
import getCallResultList from '../feat/get-call-result-list.js'
import './antd.less'
import 'antd/dist/antd.less'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import { callResultListKey } from '../feat/common'
import {
  remove
} from 'ringcentral-embeddable-extension-common/src/common/db'

function showSyncMenu () {
  let mod = null
  function syncRecent () {
    fetchAllContacts(true)
    destroyMod()
  }
  function syncAll () {
    fetchAllContacts()
    destroyMod()
  }
  async function delAll () {
    await remove()
    notification.success({
      message: 'All contacts removed from extension database',
      zIndex: 6697
    })
  }
  function onCancel () {
    notifyReSyncContacts()
    destroyMod()
  }
  function destroyMod () {
    mod.destroy()
  }
  const content = (
    <div>
      <div className='rc-pd2b'>After Sync contacts, conatacts data will update, so auto call log can match right contacts, you could choose sync only recent updated/created contacts or sync all contacts.</div>
      <div>
        <Button
          type='primary'
          className='rc-mg1r rc-mg1b'
          onClick={syncRecent}
        >
          Sync recent update/created contacts
        </Button>
        <Button
          type='primary'
          className='rc-mg1r rc-mg1b'
          onClick={syncAll}
        >
          Sync all contacts
        </Button>
        <Button
          type='primary'
          className='rc-mg1r rc-mg1b'
          onClick={delAll}
        >
          Remove all contacts data from extension database
        </Button>
        <Button
          type='ghost'
          className='rc-mg1r rc-mg1b'
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
  const btnProps = {
    disabled: true,
    className: 'rc-hide'
  }
  mod = Modal.confirm({
    title: 'Sync contacts',
    width: '90%',
    icon: <SyncOutlined />,
    content,
    zIndex: 2333,
    closable: false,
    okButtonProps: btnProps,
    cancelButtonProps: btnProps
  })
}

// function showNotification (info, destroyPrev = false) {

// }

function showAuthPanel () {
  let mod = null
  function syncRecent () {
    doAuth()
    destroyMod()
  }
  function destroyMod () {
    mod.destroy()
  }
  const content = (
    <div>
      <div className='rc-pd2b'>After authorization, contacts data will be synced to RingCentral extension, so all contacts related function including auto call log will match right contacts. (contacts data only stores in your browser).</div>
      <div>
        <Button
          type='primary'
          className='rc-mg1r rc-mg1b'
          onClick={syncRecent}
        >
          Authorize
        </Button>
        <Button
          type='ghost'
          className='rc-mg1r rc-mg1b'
          onClick={destroyMod}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
  const btnProps = {
    disabled: true,
    className: 'rc-hide'
  }
  mod = Modal.confirm({
    title: 'Authorization requied',
    width: '90%',
    icon: <InfoCircleOutlined />,
    content,
    zIndex: 11000,
    closable: false,
    okButtonProps: btnProps,
    cancelButtonProps: btnProps
  })
}

export default () => {
  function onEvent (e) {
    if (!e || !e.data || !e.data.type) {
      return
    }
    const { type } = e.data
    if (type === 'rc-show-sync-menu') {
      showSyncMenu()
    } else if (type === 'rc-show-auth-panel') {
      showAuthPanel()
    }
  }
  async function init () {
    const callResultList = await getCallResultList()
    console.log('callResultList', callResultList)
    await ls.set(callResultListKey, callResultList)
  }
  useEffect(() => {
    init()
    window.addEventListener('message', onEvent)
    return () => {
      window.removeEventListener('message', onEvent)
    }
  }, [])

  return null
}
