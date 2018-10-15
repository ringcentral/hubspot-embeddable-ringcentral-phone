/**
 * cache module
 */

let cache = new Map()

export function setCache(
  key,
  value,
  expire = 10000
) {
  cache.set(key, {
    value,
    expire: (+ new Date()) + expire
  })
}

export function getCache(key) {
  let now = + new Date()
  let v = cache.get(key)
  return v && v.expire > now
    ? v.value
    : null
}
