/**
 * auth hubspot app and redirect to app page
 */
import './style.styl'

function parseQuery(queryString) {
  let query = {}
  let pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&')
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=')
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }
  return query
}

function init() {
  console.log(location.search)
  let q = parseQuery(location.search)
  let {
    code,
    error,
    error_description
  } = q
  if (q.code) {
    window.top.postMessage({
      hsAuthCode: code
    }, '*')
  } else if (error) {
    document.getElementById('main').innerHTML = error
    document.getElementById('err').innerHTML = error_description
  }
}
window.addEventListener('load', init)

