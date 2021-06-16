/**
 * form for create contact
 */

import { useEffect, useState, useRef } from 'react'
import { Input, Form, Button, Select, Tooltip } from 'antd'
import { doSync, afterCallLog } from '../funcs/log-sync'
import CountDown from './countdown'

const FormItem = Form.Item
const { Option } = Select

export default function CallLogForm (props) {
  const countdownRef = useRef()
  const [form] = Form.useForm()
  const [showCountdown, setCountDownShow] = useState(true)
  const {
    body,
    afterCallForm,
    isManuallySync,
    relatedContacts,
    info
  } = props.form
  const isCall = !!body.call
  const timer = isCall ? 20000 : 100
  const cls = isCall || isManuallySync ? 'rc-add-call-log-form' : 'rc-hide'
  function renderList () {
    if (afterCallForm) {
      return null
    }
    const txt = relatedContacts.map(c => {
      return `${c.name}(${c.emails[0]})`
    }).join(', ')
    return (
      <div className='rc-pd1b'>
        <Tooltip
          title={txt}
          getPopupContainer={getBox}
        >
          <div className='rc-elli'>{txt}</div>
        </Tooltip>
      </div>
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
  // const cls = 'rc-add-call-log-form'
  function onFinish (data) {
    clearTimeout(countdownRef.current)
    if (afterCallForm) {
      return afterCallLog(data)
    }
    doSync(
      body,
      data || {},
      isManuallySync,
      relatedContacts,
      info
    )
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
    if (!isManuallySync && !afterCallForm) {
      countdownRef.current = setTimeout(onTimeout, timer)
    }
    return () => {
      clearTimeout(countdownRef.current)
    }
  }, [])
  function renderCountDown () {
    if (!showCountdown || props.form.isManuallySync || afterCallForm) {
      return null
    }
    return (
      <span>(<CountDown time={20} />)</span>
    )
  }
  function removeCountDown () {
    setCountDownShow(false)
  }
  const name = isCall ? 'call' : 'message'
  const row = afterCallForm ? 5 : 2
  return (
    <div className={cls}>
      <div className='rc-pd2'>
        <Form
          layout='vertical'
          form={form}
          name='rc-add-call-log-form'
          onFinish={onFinish}
          initialValues={{}}
          onClick={removeCountDown}
        >
          <h3 class='rc-sync-title rc-pd1b'>
            Sync {name} log to HubSpot matched contacts:
          </h3>
          {
            renderList()
          }
          <ul class='rc-pd1b rc-wordbreak'>
            {
              renderDetail()
            }
            <li>
              time: <b>{info.time}</b>
            </li>
          </ul>
          {
            isCall && props.form.isManuallySync
              ? (
                <FormItem
                  name='description'
                  label='Description'
                >
                  <Input.TextArea rows={row} />
                </FormItem>
                )
              : null
          }
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
          <Button type='primary' htmlType='submit'>
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
