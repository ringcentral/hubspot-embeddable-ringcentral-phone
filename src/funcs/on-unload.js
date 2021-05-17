/**
 * warn user when leaving page with call connected
 */

const beforeUnloadListener = (event) => {
  if (window.rc.calling) {
    event.preventDefault()
    event.returnValue = 'Are you sure you want to exit? This may disconnect your current call?'
  }
}

function initUnloadWatcher () {
  window.addEventListener('beforeunload', beforeUnloadListener)
}

initUnloadWatcher()
