/**
 * react element app
 */

import { useEffect } from 'react'
import { Modal, Button } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { fetchAllContacts } from '../feat/contacts'

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
  function destroyMod () {
    mod.destroy()
  }
  const content = (
    <div>
      <div className='pd2b'>After Sync contacts, conatacts data will update, so auto call log can match right contacts, you could choose sync only recent updated/created contacts or sync all contacts.</div>
      <div>
        <Button
          type='primary'
          className='mg1r mg1b'
          onClick={syncRecent}
        >
          Sync recent update/created contacts
        </Button>
        <Button
          type='primary'
          className='mg1r mg1b'
          onClick={syncAll}
        >
          Sync all contacts
        </Button>
        <Button
          type='ghost'
          className='mg1r mg1b'
          onClick={destroyMod}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
  const btnProps = {
    disabled: true,
    className: 'hide'
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

function showNotification (info, destroyPrev = false) {

}

export default () => {
  function onEvent (e) {
    if (!e || !e.data || !e.data.type) {
      return
    }
    const { type } = e.data
    if (type === 'rc-show-sync-menu') {
      showSyncMenu()
    } else if (type === 'rc-show-notification') {
      showNotification(e.data.info)
    }
  }
  useEffect(() => {
    window.addEventListener('message', onEvent)
    return () => {
      window.removeEventListener('message', onEvent)
    }
  }, [])

  return null
}
