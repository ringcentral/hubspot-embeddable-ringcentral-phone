/**
 * simple countdown
 */

import { useState, useEffect } from 'react'

export default (props) => {
  const [time, setTime] = useState(props.time)
  const cls = `rc-countdown ${props.cls || ''}`
  let handle
  function countdown () {
    setTime(old => {
      return old - 1
    })
  }
  useEffect(() => {
    handle = setInterval(countdown, 1000)
    return () => {
      clearTimeout(handle)
    }
  }, [])
  return (
    <span className={cls}>
      {time}
    </span>
  )
}
