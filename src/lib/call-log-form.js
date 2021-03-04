/**
 * form for create contact
 */

import { useEffect, useState } from 'react'
import { Input, Form, Button, Spin, Select } from 'antd'
import { doSync } from '../feat/log-sync'
import {
  match
} from 'ringcentral-embeddable-extension-common/src/common/db'
import _ from 'lodash'
import dayjs from 'dayjs'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import {
  notify, formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import CountDown from './countdown'
import { getFullNumber } from '../feat/common'

let {
  serviceName
} = thirdPartyConfigs

const FormItem = Form.Item
const { Option } = Select

export default function AddContactForm (props) {
  const [form] = Form.useForm()
  const [loading, setLoding] = useState(false)
  const [state, setStateOri] = useState({})
  function setState (obj) {
    setStateOri(s => ({
      ...s,
      ...obj
    }))
  }
  function renderList (prop, numberProp, title) {
    if (!state[numberProp]) {
      return null
    }
    const froms = state[prop]
      ? `(${state[prop].join(', ')})`
      : ''
    return (
      <li>
        {title}: <b>{state[numberProp]}</b>
        {froms}
      </li>
    )
  }
  const {
    body, isManuallySync
  } = props.form
  const isCall = !!body.call
  const timer = isCall ? 20000 : 100
  const cls = isCall || isManuallySync ? 'rc-add-call-log-form' : 'rc-hide'
  // const cls = 'rc-add-call-log-form'
  function onFinish (data) {
    doSync(
      body,
      data || {},
      isManuallySync
    )
    handleCancel()
  }
  async function checkContacts () {
    setLoding(true)
    if (!body) {
      setLoding(false)
      return {}
    }
    let fromNames = []
    let toNames = []
    let time
    let fromNumber
    let toNumber
    // let noContact = () => notify(`No related contact in ${serviceName}`)
    let fromText = 'From'
    let toText = 'To'
    if (body.call) {
      // for call
      fromNames = _.get(body, 'call.fromMatches') || []
      toNames = _.get(body, 'call.toMatches') || []
      time = dayjs(body.call.startTime).format()
    } else if (
      _.get(body, 'conversation.type') === 'SMS' ||
      _.get(body, 'conversation.type') === 'VoiceMail'
    ) {
      // for sms
      fromText = 'Correspondents'
      toText = 'Correspondents'
      toNames = _.get(body, 'correspondentEntity')
      toNames = toNames ? [toNames] : []
      let selfNumber = getFullNumber(_.get(body, 'conversation.self'))
      fromNames = await match([selfNumber])
      fromNames = fromNames[selfNumber] || []
      time = _.get(body, 'conversation.date')
      if (!toNames.length && !fromNames.length) {
        return
      }
    } else {
      // todo fax support
      notify(`Do not support ${_.get(body, 'conversation.type')} yet`)
      return
    }
    fromNames = fromNames
      .filter(d => d.type === serviceName)
      .map(d => d.name)
    fromNumber = formatPhone(
      getFullNumber(
        _.get(body, 'call.from')) || getFullNumber(_.get(body, 'conversation.self')
      )
    )
    toNames = toNames
      .filter(d => d.type === serviceName)
      .map(d => d.name)
    toNumber = formatPhone(getFullNumber(_.get(body, 'call.to')))
    setLoding(false)
    setState({
      fromNames,
      toNames,
      time,
      fromNumber,
      toNumber,
      fromText,
      toText
    })
  }
  function handleCancel () {
    props.remove(props.form.id)
  }
  function getBox () {
    return document.getElementById('Hubspot-rc')
  }
  let ref
  function onTimeout () {
    form.submit()
  }
  useEffect(() => {
    checkContacts()
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
        <Spin spinning={loading}>
          <Form
            layout='vertical'
            form={form}
            name='rc-add-call-log-form'
            onFinish={onFinish}
            initialValues={{}}
          >
            <h3 class='rc-sync-title rc-pd1b'>
              Sync {name} log to {serviceName}
            </h3>
            <ul class='rc-pd1b'>
              {
                renderList('fromNames', 'fromNumber', 'From')
              }
              {
                renderList('toNames', 'toNumber', 'To')
              }
              <li>
                time: <b>{state.time}</b>
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
        </Spin>
      </div>
    </div>
  )
}
