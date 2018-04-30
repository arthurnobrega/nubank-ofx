import { addWeeks, setDay } from 'date-fns'

export function nextMonday(date) {
  let innerDate = date

  if (!(date instanceof Date)) {
    innerDate = new Date(date)
  }

  if (innerDate.getDay() > 1) {
    innerDate = addWeeks(date, 1)
  }

  return setDay(innerDate, 1)
}
