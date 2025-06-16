import { LogSlice } from '../models/LogSlice'
import dayjs from 'dayjs'

export function validateDailySlices(slices: LogSlice[]): string[] {
  // 1) sort by startTime
  const sorted = [...slices].sort((a,b) =>
    dayjs(a.startTime).diff(dayjs(b.startTime))
  )

  const errors: string[] = []

  // 2) check for overlaps or gaps
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]
    const next = sorted[i+1]
    if (next) {
      const end = dayjs(cur.endTime)
      const startNext = dayjs(next.startTime)
      if (end.isAfter(startNext)) {
        const curStart = dayjs(cur.startTime).format('HH:mm')
        const curEnd   = end.format('HH:mm')
        const nextStart = startNext.format('HH:mm')
        const nextCat = next.category
        errors.push(
          `"${cur.category}" from ${curStart}–${curEnd} overlaps "${nextCat}" starting at ${nextStart}`
        )
      }
      // if you want *strict* coverage, also:
      // else if (end.isBefore(startNext)) {
      //   const gapStart = end.format('HH:mm')
      //   const gapEnd = startNext.format('HH:mm')
      //   errors.push(`Gap from ${gapStart} to ${gapEnd}`)
      // }
    }
  }

  return errors
}
