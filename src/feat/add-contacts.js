import { addContact } from './add-contact'
import { getOwnerId } from './on-call-end'

async function addContacts (n, from = 0) {
  const oid = await getOwnerId()
  for (let i = from; i < n + from; i++) {
    console.log(i)
    const r = await addContact({
      ownerId: oid,
      contactEmail: 'name' + i + '@test.com',
      firstname: 'name' + i,
      lastname: 'test',
      phone: '6504377934'
    })
    console.log(r)
  }
}

export default function run () {
  addContacts(400, 0)
}
