
import { useState } from 'react'
import { Button, Select } from 'antd'
import { doSync } from '../funcs/log-sync'

const { Option } = Select

export default function SelectContactForm (props) {
  const {
    formData, isManuallySync, body, contacts
  } = props.form
  const tree = contacts.reduce((p, k) => {
    return {
      ...p,
      [k.id]: k
    }
  }, {})
  const [state, setStateOri] = useState({
    contactsSelected: []
  })
  function setState (obj) {
    setStateOri(s => ({
      ...s,
      ...obj
    }))
  }

  const {
    contactsSelected
  } = state
  const cls = 'rc-add-call-log-form'
  function onFinish (data) {
    doSync(
      body,
      formData,
      isManuallySync,
      contactsSelected.map(id => {
        return tree[id]
      })
    )
    handleCancel()
  }
  function handleCancel () {
    props.remove(props.form.id)
  }
  function getBox () {
    return document.getElementById('HubSpot-rc')
  }
  function handleChange (value) {
    setState({
      contactsSelected: value
    })
  }
  return (
    <div className={cls}>
      <div className='rc-pd2'>
        <h3 class='rc-sync-title rc-pd1b'>
          Select contacts will be sync call log to
        </h3>
        <div className='rc-pd1y'>
          <Select
            getPopupContainer={getBox}
            mode='multiple'
            style={{ width: '100%' }}
            onChange={handleChange}
            placeholder='Select Contacts'
          >
            {
              contacts.map(obj => {
                return (
                  <Option value={obj.id} key={obj.id}>
                    {obj.name}
                  </Option>
                )
              })
            }
          </Select>
        </div>
        <div className='rc-pd1y'>
          <Button
            type='primary'
            onClick={onFinish}
            disabled={!contactsSelected.length}
          >
            Submit
          </Button>
          <Button onClick={handleCancel} className='rc-mg1l'>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
