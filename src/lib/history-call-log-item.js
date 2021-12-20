/**
 * history call log check and let user choose to sync call log
 */

import dayjs from 'dayjs'

function renderNumber (from) {
  const {
    phoneNumber,
    extensionNumber,
    location,
    name
  } = from
  const pre = name || location ? `(${name || location})` : ''
  const ext = extensionNumber ? `.ext ${extensionNumber}` : ''
  return `${pre}${phoneNumber}${ext}`
}

export default function HistoryCallLogCheckItem (props) {
  const {
    item, selected
  } = props
  const {
    direction,
    from,
    to,
    startTime
  } = item
  const f = renderNumber(from)
  const t = renderNumber(to)
  const date = dayjs(startTime).format('MM/DD/YY HH:mm:ss')
  const str = `${date}[${direction}]from ${f} to ${t}`
  let cls = selected
    ? ' selected'
    : ''
  cls = 'rc-call-log-item' + cls
  function handleClick () {
    props.handleClick(item)
  }
  return (
    <div className={cls} onClick={handleClick}>
      <span className='rc-call-log-check'>✅</span>
      <span className='rc-mg1l'>{str}</span>
    </div>
  )
}
