/**
 * edit manifest.json's key prop to generate static extension id
 */

const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')
const p = resolve(__dirname, '..', 'dist', 'manifest.json')
const conf = require('../config.default')

function run () {
  const js = JSON.parse(readFileSync(p).toString())
  js.key = conf.extensionKey
  writeFileSync(p, JSON.stringify(js, null, 2))
}

run()
