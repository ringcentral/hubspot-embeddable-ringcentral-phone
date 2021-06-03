/**
 * Get call engagement dispositions
 */

import request from './request'

export default () => {
  const url = '/hs/get-dispositions'
  return request(url)
}
