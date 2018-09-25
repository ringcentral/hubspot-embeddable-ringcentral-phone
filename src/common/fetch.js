// the final fetch wrapper
import _ from 'lodash'
import parseJson from './parse-json-safe'

export const jsonHeader = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

function parseResponse(response) {
  let contentType = response.headers.get('content-type') || ''
  let isJsonResult = contentType.toLowerCase().indexOf('application/json') !== -1
  return isJsonResult ? response.json() : response.text()
}

export async function handleErr(res) {
  console.log(res)
  let text = _.isFunction(res.text)
    ? await res.text()
    : _.isPlainObject(res) ? JSON.stringify(res) : res

  console.log(text, 'err info')
  try {
    text = parseJson(text).error || text
  } catch (e) {
    console.log('not a json error')
  }
  console.log(text)
}

export default class Fetch {

  static get(url, options) {
    return Fetch.connect(url, 'get', null, options)
  }

  static post(url, data, options) {
    return Fetch.connect(url, 'post', data, options)
  }

  static delete(url, data, options) {
    return Fetch.connect(url, 'delete', data, options)
  }

  static put(url, data, options) {
    return Fetch.connect(url, 'put', data, options)
  }

  static patch(url, data, options) {
    return Fetch.connect(url, 'patch', data, options)
  }

  //todo jsonp if needed
  static connect(url, method, data, options = {}) {
    let body = {
      method,
      body: data
        ? JSON.stringify(data)
        : undefined,
      headers: jsonHeader,
      timeout: 180000,
      ...options
    }
    return fetch(url, body)
      .then(res => {
        if (res.status > 304) {
          throw res
        }
        return res
      })
      .then(options.handleResponse || parseResponse, options.handleErr || handleErr)
  }
}

