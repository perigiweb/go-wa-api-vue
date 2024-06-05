
import { formatIncompletePhoneNumber } from 'libphonenumber-js'

const s = (string, length, pad) => {
  const s = String(string)
  if (!s || s.length >= length) return string
  return `${Array((length + 1) - s.length).join(pad)}${string}`
}

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

export const fmtDate = (dateStr) => {
  const d = new Date(Date.parse(dateStr))

  return d.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    year: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric'
  })
}

export const fmtDateForInput = (d) => {
  return `${d.getFullYear()}-${s(d.getMonth()+1, 2, '0')}-${s(d.getDate(), 2, '0')}T${s(d.getHours(), 2, '0')}:${s(d.getMinutes(), 2, '0')}`
}