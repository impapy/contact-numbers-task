
export function parsePhoneNumber(phone?: string): string {
  if (!phone) return ''

  let parsedPhone = phone?.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()) // convert from arabic digits to English digits

  if (parsedPhone.startsWith('00')) parsedPhone = parsedPhone.slice(2)
  else if (parsedPhone.startsWith('+')) parsedPhone = parsedPhone.slice(1)
  else if (/^01[0125]{1}[0-9]{8}$/.test(parsedPhone)) parsedPhone = `2${parsedPhone}` // Egyptian phone number

  return parsedPhone
}

export function sanitizeUsername(username: string): string {
  return username.trim().toLowerCase()
}
