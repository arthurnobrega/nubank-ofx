import fs from 'fs'
import ofx from 'ofx'
import { format, isWeekend } from 'date-fns'
import { nextMonday } from '../helpers/date'

function buildOfxTransaction(itemData) {
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

function getOfxString(transactions) {
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
          BANKTRANLIST: transactions.map(i => buildOfxTransaction(i)),
        },
      },
    },
  }

  return ofx.serialize(header, body)
}

export default function generateOfxFile(path, transactions) {
  const data = getOfxString(transactions)
  fs.writeFileSync(path, data)

  return true
}
