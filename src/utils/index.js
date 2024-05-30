
import { formatIncompletePhoneNumber } from 'libphonenumber-js'

export const parsePhoneFromJID = (jid) => {
  let p = jid.split('@')[0] || ''
  if (p.includes('.')){
    p = p.split('.')[0] || ''
  }
  if (p.includes(':')){
    p = p.split(':')[0] || ''
  }

  return p
}

export const fmtPhoneFromJID = (jid) => {
  const p = parsePhoneFromJID(jid)
  if (p){
    return formatIncompletePhoneNumber(`+${p}`)
  }

  return p
}

export const fmtPhoneNumber = (phone) => {
  const p = phone.replace(/^0/, '62')

  return formatIncompletePhoneNumber(`+${p}`)
}