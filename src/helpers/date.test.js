import { nextMonday } from './date'

describe('Date helpers', () => {
  describe('nextMonday', () => {
    it('returns correctly when passing monday', () => {
      const monday = new Date('2018-01-01T14:28:58Z')

      const correctNextMonday = new Date('2018-01-01T14:28:58Z')

      expect(nextMonday(monday)).toEqual(correctNextMonday)
    })

    it('returns correctly when passing tuesday', () => {
      const tuesday = new Date('2018-02-06T14:28:58Z')

      const correctNextMonday = new Date('2018-02-12T14:28:58Z')

      expect(nextMonday(tuesday)).toEqual(correctNextMonday)
    })

    it('returns correctly when passing wednesday', () => {
      const wednesday = new Date('2018-03-07T14:28:58Z')

      const correctNextMonday = new Date('2018-03-12T14:28:58Z')

      expect(nextMonday(wednesday)).toEqual(correctNextMonday)
    })

    it('returns correctly when passing thurday', () => {
      const thurday = new Date('2018-04-05T14:28:58Z')

      const correctNextMonday = new Date('2018-04-09T14:28:58Z')

      expect(nextMonday(thurday)).toEqual(correctNextMonday)
    })

    it('returns correctly when passing friday', () => {
      const friday = new Date('2018-05-04T14:28:58Z')

      const correctNextMonday = new Date('2018-05-07T14:28:58Z')

      expect(nextMonday(friday)).toEqual(correctNextMonday)
    })

    it('returns correctly when passing saturday', () => {
      const saturday = new Date('2018-06-02T14:28:58Z')
      const correctNextMonday = new Date('2018-06-04T14:28:58Z')

      expect(nextMonday(saturday)).toEqual(correctNextMonday)
    })

    it('returns correctly when passing sunday', () => {
      const sunday = new Date('2018-07-01T14:28:58Z')
      const correctNextMonday = new Date('2018-07-02T14:28:58Z')

      expect(nextMonday(sunday)).toEqual(correctNextMonday)
    })

    it('returns correctly when passing string date', () => {
      const monday = '2018-01-01T14:28:58Z'

      const correctNextMonday = new Date('2018-01-01T14:28:58Z')

      expect(nextMonday(monday)).toEqual(correctNextMonday)
    })
  })
})
