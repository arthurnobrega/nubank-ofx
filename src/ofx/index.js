import fs from 'fs'
import ofx from 'ofx'
import { format, isWeekend } from 'date-fns'
import { nextMonday } from '../helpers/date'

function ofxItem(itemData) {
  const {
    id,
    time,
    title,
    description,
    amount,
  } = itemData
  const fixedDate = isWeekend(time) ? nextMonday(time) : time

  return {
    STMTTRN: {
      TRNTYPE: 'DEBIT',
      DTPOSTED: `${format(fixedDate, 'YYYYMMDDHHmmss')}[0:GMT]`,
      TRNAMT: (amount / 100) * -1,
      FITID: id,
      MEMO: description || title,
    },
  }
}

function generateOfx(transactions) {
  const header = {
    OFXHEADER: '100',
    DATA: 'OFXSGML',
    VERSION: '102',
    SECURITY: 'NONE',
    ENCODING: 'USASCII',
    CHARSET: '1252',
    COMPRESSION: 'NONE',
    OLDFILEUID: 'NONE',
    NEWFILEUID: 'NONE',
  }

  const body = {
    SIGNONMSGSRSV1: {
      SONRS: {
        STATUS: {
          CODE: '0',
          SEVERITY: 'INFO',
        },
        LANGUAGE: 'POR',
      },
    },
    CREDITCARDMSGSRSV1: {
      CCSTMTTRNRS: {
        TRNUID: '1001',
        STATUS: {
          CODE: '0',
          SEVERITY: 'INFO',
        },
        CCSTMTRS: {
          CURDEF: 'BRL',
          CCACCTFROM: {
            ACCTID: 'ynab-sync',
          },
          BANKTRANLIST: transactions.map(i => ofxItem(i)),
        },
      },
    },
  }

  return ofx.serialize(header, body)
}

export default async function generateOfxFile(transactions) {
  const filePath = 'ynab-sync-nubank.ofx'

  try {
    const data = generateOfx(transactions)
    fs.writeFileSync(filePath, data)
  } catch (e) {
    console.log(e)
  }

  return filePath
}
