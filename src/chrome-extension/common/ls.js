/**
 * localstorage for chrome extension
 */

import _ from 'lodash'

export const get = (keys) => {
  return new Promise((resolve) => {
    let arg = _.isString(keys)
      ? [keys]
      : keys
    chrome.storage.local.get(
      arg,
      function(res) {
        resolve(
          _.isString(keys)
            ? res[keys]
            : res
        )
      }
    )
  })
}

export const set = (key, value) => {
  let arg = _.isString(key)
    ? {
      [key]: value
    }
    : key
  return new Promise((resolve) => {
    chrome.storage.local.set(
      arg,
      resolve
    )
  })
}

export const remove = (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(
      key,
      resolve
    )
  })
}

export const clear = () => {
  return new Promise((resolve) => {
    chrome.storage.local.clear(
      resolve
    )
  })
}
