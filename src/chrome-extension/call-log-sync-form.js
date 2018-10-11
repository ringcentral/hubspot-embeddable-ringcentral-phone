/**
 * before sync call log to third-party
 * show form for call log description
 * this feature can be disabled by set config.thirdPartyConfigs.showCallLogSyncForm = false
 */
import {
  createElementFromHTML
} from './helpers'

function onCancel() {
  document.querySelector('.rc-sync-form').classList.remove('rc-sync-show')
}

let handler = null

function clean() {
  clearTimeout(handler)
}

/**
 * 
 * @param {object} call, the call info object
 * @param {string} serviceName
 * @param {function} onSubmit, (formData) => ...trigger when submit the form, supply with form data, such as {description}
 */
export function createForm(call, serviceName, onSubmit) {
  clean()
  //let wrapper = document.getElementById('rc-widget')
  let dom = createElementFromHTML(`
    <form class="rc-sync-form animate">
      <div class="rc-sync-inner rc-pd2">
        <h4 class="rc-sync-title rc-pd1b">
          Sync call log to ${serviceName}
        </h4>
        <ul class="rc-pd1b">
          <li>
            from: <b>${call.from.phoneNumber}</b>
          </li>
          <li>
            to: <b>${call.to.phoneNumber}</b>
          </li>
          <li>
            time: <b>${new Date(call.startTime)}</b>
          </li>
        </ul>
        <textarea
          value=""
          class="rc-sync-area"
          placeholder="optional description"
        ></textarea>
        <div class="rc-pd1b rc-sync-btns">
          <button class="rc-sync-btn rc-btn-cancel rc-mg1r" type="button">Cancel</button>
          <button class="rc-sync-btn rc-btn-submit" type="submit">Submit</button>
        </div>
      </div>
    </form>
  `)
  dom.onsubmit = e => {
    e.preventDefault()
    let v = dom.querySelector('.rc-sync-area').value
    onSubmit({
      description: v || ''
    })
    onCancel()
  }
  dom.querySelector('.rc-btn-cancel').onclick = onCancel
  // dom.querySelector('.rc-sync-area').onchange = e => {
  //   e.preventDefault()
  //   onSubmit()
  // }
  let old = document.querySelector('.rc-sync-form')
  old && old.remove()
  document.body.appendChild(dom)
  handler = setTimeout(() => {
    dom.classList.add('rc-sync-show')
  }, 100)
}
