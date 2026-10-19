const DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'Asia/Manila'

/**
 * Returns the current date in Manila formatted as YYYY-MM-DD
 */
export function getManilaDate(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: DEFAULT_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date)
}

/**
 * Formats any date or ISO timestamp into: "MMM DD, YYYY • hh:mm:ss AM/PM"
 * Locked strictly to Philippine Standard Time (Asia/Manila, UTC+8)
 */
export function formatManilaDateTime(
    dateOrTimestamp: string | null | undefined,
    fallbackTime?: string | null
): string {
    const target = dateOrTimestamp || fallbackTime
    if (!target) return ''

    const date = new Date(target)
    if (isNaN(date.getTime())) return target

    // Format Date: "Oct 19, 2026"
    const datePart = new Intl.DateTimeFormat('en-PH', {
        timeZone: DEFAULT_TIMEZONE,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date)

    // Format Exact Time: "10:43:12 AM"
    const timePart = new Intl.DateTimeFormat('en-PH', {
        timeZone: DEFAULT_TIMEZONE,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    }).format(date)

    return `${datePart} • ${timePart}`
}

/**
 * Formats date string to user-friendly format
 */
export function formatManilaDate(dateStr: string): string {
    if (!dateStr) return ''
    if (dateStr.includes('T') || dateStr.includes(':')) {
        return formatManilaDateTime(dateStr)
    }
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) return dateStr
    const date = new Date(Date.UTC(year, month - 1, day))
    return new Intl.DateTimeFormat('en-PH', {
        timeZone: DEFAULT_TIMEZONE,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date)
}