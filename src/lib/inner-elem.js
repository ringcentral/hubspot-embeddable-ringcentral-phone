/**
 * react element in widget wrapper
 */

import { useEffect, useState } from 'react'
import { Tooltip, Input, notification } from 'antd'
import { EditOutlined, LeftCircleOutlined, SyncOutlined } from '@ant-design/icons'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
// prefix telephonySessionId
import { autoLogPrefix, rc, getFullNumber } from '../common/common'
import ContactForm from './add-contact-form'
import { getOwnerId as getVid, formatContacts, notifyReSyncContacts } from '../feat/contacts'
import getOwnerId from '../feat/get-owner-id'
import { addContact } from '../feat/add-contact'
import { showAuthBtn } from '../feat/auth'
import {
  insert, match
} from 'ringcentral-embeddable-extension-common/src/common/db'
import _ from 'lodash'
import './inner.styl'

notification.config({
  placement: 'bottomLeft',
  duration: 5
})

const { TextArea } = Input

export default () => {
  const [state, setStateOri] = useState({
    path: '',
    calling: false,
    note: '',
    hideForm: false,
    shouldShowNote: false,
    showAddContactForm: false,
    showCallLogForm: false,
    callLogProps: {},
    submitting: false,
    loadingCallLogData: false,
    transferringData: false,
    noteId: ''
  })
  let refer
  const [data, setData] = useState({})
  const { noteId, shouldShowNote, note, hideForm, calling, showAddContactForm, submitting, path, transferringData } = state
  function setState (obj) {
    setStateOri(s => ({
      ...s,
      ...obj
    }))
  }
  function saveNote (id = noteId) {
    if (!id) {
      return
    }
    ls.set(id, note)
  }
  function autoHide (sec) {
    refer = setTimeout(() => {
      setState({
        shouldShowNote: false
      })
    }, sec * 1000)
  }
  async function onFinish (data) {
    setState({
      submitting: true
    })
    const vid = await getVid(true)
    const oid = await getOwnerId(vid)
    if (!oid) {
      return notification.error({
        message: 'Add contact failed, can not get owner ID'
      })
    }
    const r = await addContact({
      ...data,
      ownerId: oid
    })
    if (!r || !r.vid) {
      notification.error({
        message: 'Create contact failed'
      })
    } else {
      if (r && r.vid) {
        await insert(
          formatContacts([r])
        )
        notifyReSyncContacts()
      }
      notification.info({
        message: 'Contact created'
      })
    }
    setState({
      submitting: false,
      showAddContactForm: false
    })
  }
  async function onEvent (e) {
    if (!e || !e.data || !e.data.type) {
      return
    }
    const { type, path, transferringData, callLogProps } = e.data
    if (type === 'rc-transferring-data') {
      setState({
        transferringData
      })
    } else if (type === 'rc-route-changed-notify') {
      setState({
        path
      })
    } else if (type === 'rc-call-start-notify') {
      clearTimeout(refer)
      setState({
        calling: true,
        note: '',
        noteId: '',
        hideForm: false,
        shouldShowNote: true
      })
    } else if (type === 'rc-call-end-notify') {
      // setState({
      //   hideForm: true
      // })
      const sid = _.get(e, 'data.call.partyData.sessionId')
      if (!sid) {
        return
      }
      const id = autoLogPrefix + sid
      setState({
        noteId: id
      })
      saveNote(id)
      autoHide(10)
    } else if (type === 'rc-show-add-contact-panel') {
      if (!rc.local.accessToken) {
        showAuthBtn()
        return
      }
      const { call = {} } = e.data
      let phone = getFullNumber(_.get(
        e.data,
        'conversation.correspondents[0]'
      ))
      if (!phone) {
        phone = call.direction === 'Inbound'
          ? getFullNumber(_.get(call, 'from'))
          : getFullNumber(_.get(call, 'to'))
      }
      const name = call.direction === 'Inbound'
        ? _.get(call, 'from.name')
        : _.get(call, 'to.name')
      const [firstname, lastname] = (name || '').replace(/\s+/, '\x01').split('\x01')
      const res = await match([phone])
      if (_.isEmpty(res)) {
        setData({
          phone,
          firstname,
          lastname
        })
        setState({
          showAddContactForm: true
        })
      }
    } else if (type === 'rc-call-log-form') {
      setState({
        showCallLogForm: true,
        callLogProps
      })
    } else if (type === 'rc-call-log-form-hide') {
      setState({
        shouldShowNote: false
      })
    }
  }
  function handleChangeNote (e) {
    const v = e.target.value
    setState({
      note: v
    })
    saveNote()
  }
  useEffect(() => {
    window.addEventListener('message', onEvent)
    return () => {
      window.removeEventListener('message', onEvent)
    }
  }, [note])
  const isCallPath = path.startsWith('/calls/') || path.startsWith('/dialer')
  if (path === '/contacts' && transferringData) {
    return (
      <Tooltip title='Rebuilding data...' overlayClassName='rc-toolt-tip-card'>
        <span className='rc-show-note-form rc-rebuild-data rc-iblock rc-pd1'>
          <SyncOutlined
            spin
            className='rc-iblock rc-mg1r'
          />
          <span className='rc-iblock'>Rebuilding data, please wait</span>
        </span>
      </Tooltip>
    )
  }
  if (showAddContactForm) {
    return (
      <ContactForm
        onFinish={onFinish}
        formData={data}
        loading={submitting}
        handleCancel={() => setState({
          showAddContactForm: false
        })}
      />
    )
  }
  if (!calling) {
    return null
  }
  if (shouldShowNote && hideForm && isCallPath) {
    return (
      <Tooltip title='Show note edit form' overlayClassName='rc-toolt-tip-card'>
        <EditOutlined
          onClick={() => setState({
            hideForm: false
          })}
          className='pointer rc-show-note-form'
        />
      </Tooltip>
    )
  } else if (shouldShowNote && isCallPath) {
    return (
      <div className='rc-call-note-form'>
        <div className='pd1'>
          <Tooltip overlayClassName='rc-toolt-tip-card' title='Note will synced with call log when call end'>
            <TextArea
              value={note}
              style={{
                width: 'calc(100% - 24px)',
                marginLeft: '24px'
              }}
              rows={1}
              placeholder='Take some notes'
              onChange={handleChangeNote}
            />
          </Tooltip>
          <Tooltip title='Hide form' overlayClassName='rc-toolt-tip-card'>
            <LeftCircleOutlined
              onClick={() => setState({
                hideForm: true
              })}
              className='pointer rc-hide-note-form'
            />
          </Tooltip>
        </div>
      </div>
    )
  } else {
    return null
  }
}
