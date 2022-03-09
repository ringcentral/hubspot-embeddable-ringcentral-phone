/**
 * form for create contact
 */

import { useEffect, useState, useRef } from 'react'
import { Input, Form, Button, Select, message } from 'antd'
import { doSync, afterCallLog, setCallHandled } from '../funcs/log-sync'
import CountDown from './countdown'
import copy from 'json-deep-copy'

const FormItem = Form.Item
const { Option } = Select

function getCurrentContact (relatedContacts) {
  const { currentContact } = window.rc
  let target = null
  if (currentContact && currentContact.id) {
    target = relatedContacts.find(d => d.id === currentContact.id)
  }
  if (target) {
    return copy([target])
  }
  return relatedContacts.slice(0, 1)
}

export default function CallLogForm (props) {
  const countdownRef = useRef()
  const [form] = Form.useForm()
  const [relatedContacts, setSelectedContacts] = useState(
    getCurrentContact(props.form.relatedContacts.filter(d => d))
  )
  const latestRelatedContacts = useRef(relatedContacts)
  const [showCountdown, setCountDownShow] = useState(true)
  const {
    body,
    afterCallForm,
    isManuallySync,
    id,
    info,
    note
  } = props.form
  function setter (arr) {
    setSelectedContacts(arr)
    latestRelatedContacts.current = arr
  }
  const relatedContactsTree = props.form.relatedContacts
    .reduce((p, r) => {
      return {
        ...p,
        [r.id]: r
      }
    }, {})
  const isCall = !!body.call
  const timer = isCall ? 20000 : 100
  const shouldNotHide = isCall || isManuallySync
  const cls = shouldNotHide ? 'rc-add-call-log-form' : 'rc-hide'
  function onChangeContact (v) {
    setter(
      v.map(id => {
        return relatedContactsTree[id]
      })
    )
  }
  function renderList () {
    const value = relatedContacts.map(d => d.id)
    // console.log('relatedContacts', relatedContacts, props.form.relatedContacts)
    return (
      <Select
        value={value}
        mode='multiple'
        style={{ width: '100%' }}
        maxTagCount={1}
        getPopupContainer={getBox}
        onChange={onChangeContact}
      >
        {
          props.form.relatedContacts.map(c => {
            return (
              <Option
                key={c.id}
                value={c.id}
              >
                {c.name}({c.emails ? c.emails[0] : 'no email'})
              </Option>
            )
          })
        }
      </Select>
    )
  }
  function renderDetail () {
    if (afterCallForm) {
      return null
    }
    return (
      <li>
        {info.detail}
      </li>
    )
  }
  function renderNote () {
    return isCall && (props.form.isManuallySync || afterCallForm)
      ? (
        <FormItem
          name='description'
          label='Note'
        >
          <Input.TextArea
            rows={row}
            onClick={removeCountDown}
            disabled={!shouldNotHide}
          />
        </FormItem>
        )
      : null
  }
  // const cls = 'rc-add-call-log-form'
  function onFinish (data) {
    if (
      !latestRelatedContacts.current.length &&
      (isCall || isManuallySync)
    ) {
      return message.error('please select 1 contact at least')
    }
    clearTimeout(countdownRef.current)
    if (afterCallForm) {
      afterCallLog(latestRelatedContacts.current, id, data)
    } else {
      doSync(
        body,
        data || {},
        isManuallySync,
        latestRelatedContacts.current,
        info
      )
    }
    handleCancel()
  }
  function handleCancel () {
    props.remove(props.form.id)
  }
  function getBox () {
    return document.getElementById('HubSpot-rc')
  }
  function onTimeout () {
    form.submit()
  }
  useEffect(() => {
    if (!isManuallySync) {
      countdownRef.current = setTimeout(onTimeout, timer)
    }
    if (afterCallForm) {
      setCallHandled(id)
    }
    return () => {
      clearTimeout(countdownRef.current)
    }
  }, [])
  function renderCountDown () {
    if (!showCountdown || props.form.isManuallySync) {
      return null
    }
    return (
      <span>(<CountDown time={20} />)</span>
    )
  }
  function renderTime () {
    if (afterCallForm) {
      return null
    }
    return (
      <li>
        time: <b>{info.time}</b>
      </li>
    )
  }
  function removeCountDown () {
    setCountDownShow(false)
    clearTimeout(countdownRef.current)
  }
  const name = isCall ? 'call' : 'message'
  const row = 2
  return (
    <div className={cls}>
      <div className='rc-pd2'>
        <Form
          layout='vertical'
          form={form}
          name='rc-add-call-log-form'
          onFinish={onFinish}
          initialValues={{
            description: note
          }}
        >
          <h3 class='rc-sync-title rc-pd1b'>
            Sync {name} log to HubSpot matched contacts:
          </h3>
          {
            renderList()
          }
          <ul class='rc-pd1b rc-wordbreak'>
            {renderDetail()}
            {renderTime()}
          </ul>
          {renderNote()}
          {
            isCall
              ? (
                <FormItem
                  name='callResult'
                  label='Call Result'
                >
                  <Select
                    getPopupContainer={getBox}
                    placeholder='Select Result'
                    onClick={removeCountDown}
                  >
                    {
                      props.callResultList.map(obj => {
                        return (
                          <Option value={obj.id} key={obj.id}>
                            {obj.label}
                          </Option>
                        )
                      })
                    }
                  </Select>
                </FormItem>
                )
              : null
          }
          <Button
            type='primary'
            htmlType='submit'
          >
            Submit {renderCountDown()}
          </Button>
          <Button onClick={handleCancel} className='rc-mg1l'>
            Cancel
          </Button>
        </Form>
      </div>
    </div>
  )
}
