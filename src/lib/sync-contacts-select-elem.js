/**
 * select sync call log to which contacts
 */

 /**
 * react element in widget wrapper
 */

import { useState, useEffect } from 'react'
import _ from 'lodash'
import SyncContactsSelectForm from './sync-contacts-select-form'
import copy from 'json-deep-copy'

export default function SyncContactsSelect () {
  const [forms, setStateOri] = useState([])
  function update (id, data) {
    setStateOri(s => {
      const arr = copy(s)
      const ref = _.find(arr, d => d.id === id)
      Object.assign(ref, data)
      return arr
    })
  }
  function remove (id) {
    setStateOri(s => {
      return copy(s).filter(d => d.id !== id)
    })
  }
  function add (obj) {
    setStateOri(s => {
      return [
        ...copy(s),
        obj
      ]
    })
  }
  function onEvent (e) {
    if (!e || !e.data || !e.data.type) {
      return
    }
    const { type, inst } = e.data
    if (type === 'rc-select-sync-contacts') {
      add(inst)
    }
  }

  useEffect(() => {
    window.addEventListener('message', onEvent)
    return () => {
      window.removeEventListener('message', onEvent)
    }
  }, [])
  if (!forms.length) {
    return null
  }
  return forms.map(form => {
    return (
      <SyncContactsSelectForm
        form={form}
        key={form.id}
        update={update}
        remove={remove}
      />
    )
  })
}
