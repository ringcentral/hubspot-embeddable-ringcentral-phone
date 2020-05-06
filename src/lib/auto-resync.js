/**
 * auto resync contacts settings
 */

import { useState, useEffect } from 'react'
import copy from 'json-deep-copy'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import { Checkbox, InputNumber } from 'antd'
import { fetchAllContacts } from '../feat/contacts'

const step = 1000 * 60 * 5
const key = 'rc-auto-sync-setting'
const initState = {
  on: true,
  interval: step * 4
}

export async function resyncCheck () {
  console.log('resyncCheck', new Date())
  const state = await ls.get(key) || copy(initState)
  console.log('resyncCheck state', state)
  console.log('document.hidden', document.hidden)
  if (!document.hidden && state.on) {
    fetchAllContacts(true)
  }
  setTimeout(resyncCheck, state.interval)
}

export default function AutoResync () {
  const [state, setter] = useState(copy(initState))
  const minute = 1000 * 60
  function setState (ext) {
    setter(old => {
      const update = {
        ...old,
        ...ext
      }
      ls.set(key, update)
      return update
    })
  }
  useEffect(async () => {
    const update = await ls.get(key) || copy(initState)
    setState(update)
  }, [])
  return (
    <div className='rc-pd1y rc-pd2t'>
      <Checkbox
        checked={state.on}
        onChange={e => setState({
          on: e.target.checked
        })}
      >
        Auto resync recent updated/created contacts
      </Checkbox>
      <p>
        <span className='rc-mg1r'>Interval:</span>
        <InputNumber
          min={5}
          max={60 * 24}
          step={5}
          value={state.interval / minute}
          onChange={n => setState({
            interval: minute * n
          })}
        />
        <span className='rc-mg1l'>minutes</span>
      </p>
      <p>* Auto resync will pause when page inactive or hidden</p>
    </div>
  )
}
