import { addContact } from './add-contact'
import { getOwnerId } from './contacts'

async function addContacts (n, from = 0) {
  const oid = await getOwnerId()
  for (let i = from; i < n + from; i++) {
    console.log(i)
    const r = await addContact({
      ownerId: oid,
      contactEmail: 'xnxname' + i + '@test.com',
      firstname: 'xnxname' + i,
      lastname: 'test',
      phone: '6504377934'
    })
    console.log(r)
  }
}

export default function run () {
  addContacts(100000, 0)
}
