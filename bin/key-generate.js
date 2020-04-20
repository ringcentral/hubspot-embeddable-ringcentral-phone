const {
  exec,
  cd,
  echo
} = require('shelljs')

function run () {
  cd('bin')
  echo('creating key.pem')
  exec('2>/dev/null openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out key.pem')
  echo('creating key')
  exec('2>/dev/null openssl rsa -in key.pem -pubout -outform DER | openssl base64 -A > key.txt')
  echo('creating extension id')
  exec('2>/dev/null openssl rsa -in key.pem -pubout -outform DER |  shasum -a 256 | head -c32 | tr 0-9a-f a-p')
  echo('')
  echo('done')
}

run()
