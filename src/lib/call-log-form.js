/**
 * form for create contact
 */

import { useEffect } from 'react'
import { Input, Form, Button, Select, Tooltip } from 'antd'
import { doSync } from '../funcs/log-sync'
import CountDown from './countdown'

const FormItem = Form.Item
const { Option } = Select

export default function CallLogForm (props) {
  const [form] = Form.useForm()
  const {
    body, isManuallySync, relatedContacts, info
  } = props.form
  const isCall = !!body.call
  const timer = isCall ? 20000 : 100
  const cls = isCall || isManuallySync ? 'rc-add-call-log-form' : 'rc-hide'
  function renderList () {
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
    return (
      <li>
        {info.detail}
      </li>
    )
  }
  // const cls = 'rc-add-call-log-form'
  function onFinish (data) {
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
  let ref
  function onTimeout () {
    form.submit()
  }
  useEffect(() => {
    if (!isManuallySync) {
      ref = setTimeout(onTimeout, timer)
    }
    return () => {
      clearTimeout(ref)
    }
  }, [])
  function renderCountDown () {
    if (props.form.isManuallySync) {
      return null
    }
    return (
      <span>(<CountDown time={20} />)</span>
    )
  }
  const name = isCall ? 'call' : 'message'
  return (
    <div className={cls}>
      <div className='rc-pd2'>
        <Form
          layout='vertical'
          form={form}
          name='rc-add-call-log-form'
          onFinish={onFinish}
          initialValues={{}}
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
                  <Input.TextArea rows={2} />
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
