import moment from 'moment'

export function normalizeBusinessDateInput(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  const parsed = moment(raw, ['D/MM/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', moment.ISO_8601], true)
  if (!parsed.isValid()) return ''

  return parsed.format('D/MM/YYYY')
}

export function resolveBusinessDate({ requestedDate, enableBusinessDate = false, businessDateReason = '' }) {
  const today = moment().startOf('day')
  const todayValue = today.format('D/MM/YYYY')
  const reason = String(businessDateReason || '').trim()

  if (!enableBusinessDate) {
    return {
      businessDate: todayValue,
      businessDateReason: '',
      isBackdated: false,
      systemDate: todayValue,
    }
  }

  const normalizedDate = normalizeBusinessDateInput(requestedDate) || todayValue
  const parsedBusinessDate = moment(normalizedDate, 'D/MM/YYYY', true)

  if (!parsedBusinessDate.isValid()) {
    return { error: 'Invalid business date format' }
  }

  const dayDiff = today.diff(parsedBusinessDate.startOf('day'), 'days')

  if (dayDiff < 0) {
    return { error: 'Business date cannot be in the future' }
  }

  if (dayDiff > 1) {
    return { error: 'Business date must be today or yesterday' }
  }

  if (dayDiff === 1 && !reason) {
    return { error: 'A reason is required for backdated business date' }
  }

  return {
    businessDate: normalizedDate,
    businessDateReason: reason,
    isBackdated: dayDiff === 1,
    systemDate: todayValue,
  }
}