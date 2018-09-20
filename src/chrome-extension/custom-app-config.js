let appKeyHS = process.env.appKeyHS
let appServerHS = process.env.appServerHS
let appRedirectHS = process.env.appRedirectHS
let appSecretHS = process.env.appSecretHS
let apiServerHS = process.env.apiServerHS
let appKey = process.env.appKey
let appServer = process.env.appServer
let res = ''
if (appKey || appServer) {
  res = `?appKey=${appKey}&appServer=${encodeURIComponent(appServer)}`
}

export const HSConfig = {
  appKeyHS,
  appServerHS,
  appRedirectHS,
  apiServerHS,
  appSecretHS
}
export default res
