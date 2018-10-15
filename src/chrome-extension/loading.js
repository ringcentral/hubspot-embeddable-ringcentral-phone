/**
 * loading icon
 */
import {createElementFromHTML} from './helpers'
import loadingImg from './loading.svg'

export default (text = '', cls='') => {
  let textNode = text
    ? `<span class="rc-iblock rc-mg1l">${text}</span>`
    : ''
  return createElementFromHTML(
    `
      <span class="rc-iblock ${cls} rc-loading-wrap">
        <img
          src="${loadingImg}"
          class="rc-iblock rc-spinning"
          width=16
          height=16
        />
        ${textNode}
      </span>
    `
  )
}
