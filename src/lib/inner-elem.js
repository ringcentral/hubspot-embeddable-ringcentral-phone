/**
 * react element in widget wrapper
 */

import { useEffect, useState } from 'react'
import { Tooltip, Input } from 'antd'
import { EditOutlined, LeftCircleOutlined } from '@ant-design/icons'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
// prefix telephonySessionId
import { autoLogPrefix } from '../feat/common'
import _ from 'lodash'
import './inner.styl'

const { TextArea } = Input

export default () => {
  const [state, setStateOri] = useState({
    calling: false,
    note: '',
    hideForm: false
  })
  const { note, hideForm, calling } = state
  function setState (obj) {
    setStateOri(s => ({
      ...s,
      ...obj
    }))
    console.log('state', state)
  }
  function saveNote (id) {
    console.log('sid', id)
    console.log('statebbb', note)
    ls.set(id, note)
  }
  function onEvent (e) {
    if (!e || !e.data || !e.data.type) {
      return
    }
    const { type } = e.data
    if (type === 'rc-call-start-notify') {
      setState({
        calling: true,
        note: '',
        hideForm: false
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
      saveNote(id)
    }
  }
  function handleChangeNote (e) {
    setState({
      note: e.target.value
    })
  }
  useEffect(() => {
    window.addEventListener('message', onEvent)
    return () => {
      window.removeEventListener('message', onEvent)
    }
  }, [note])
  if (!calling) {
    return null
  }
  if (hideForm) {
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
  }
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
}
