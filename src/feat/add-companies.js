import { addCompany } from './add-company'

async function addContacts (n, from = 0) {
  // const oid = await getOwnerId()
  for (let i = from; i < n + from; i++) {
    console.log(i)
    const r = await addCompany({
      name: 'name-x' + i,
      desc: 'company desc' + i
    })
    console.log(r)
  }
}

export default function run () {
  addContacts(300, 30000)
}
