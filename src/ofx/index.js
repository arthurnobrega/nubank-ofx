import fs from 'fs'
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
  const memo = description || title
  const fixedDate = isWeekend(time) ? nextMonday(time) : time

  return `
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>${format(fixedDate, 'YYYYMMDDHHmmss')}[0:GMT]</DTPOSTED>
<TRNAMT>${(amount / 100) * -1}</TRNAMT>
<FITID>${id}</FITID>
<MEMO>${memo}</MEMO>
</STMTTRN>
`
}

function generateOfx(transactions) {
  return `
OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0</CODE>
<SEVERITY>INFO</SEVERITY>
</STATUS>

<LANGUAGE>POR
</SONRS>
</SIGNONMSGSRSV1>

<CREDITCARDMSGSRSV1>
<CCSTMTTRNRS>
<TRNUID>1001</TRNUID>
<STATUS>
<CODE>0</CODE>
<SEVERITY>INFO</SEVERITY>
</STATUS>

<CCSTMTRS>
<CURDEF>BRL</CURDEF>
<CCACCTFROM>
<ACCTID>ynab-sync</ACCTID>
</CCACCTFROM>

<BANKTRANLIST>
${transactions.map(i => ofxItem(i)).join('\n')}
</BANKTRANLIST>

</CCSTMTRS>
</CCSTMTTRNRS>
</CREDITCARDMSGSRSV1>
</OFX>
`
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
