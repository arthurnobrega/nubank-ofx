import fs from 'fs';
import sh from 'shorthash';

function ofxItem(itemData, detailed) {
  const {
      id,
      time,
      title,
      description,
      amount,
  } = itemData;
  const shortid = sh.unique(id);
  const memo = (
      detailed ? `#${shortid} - ${description || title}` : (description || title)
  );
  return `
<STMTTRN>
<TRNTYPE>DEBIT</TRNTYPE>
<DTPOSTED>${time.replace(/[-T:Z]/g, '').substring(0, 14)}[-3:GMT]</DTPOSTED>
<TRNAMT>${(amount/100) * -1}</TRNAMT>
<FITID>${id}</FITID>
<MEMO>${memo}</MEMO>
</STMTTRN>
`;
}

function generateOfx(transactions, detailed) {
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
<CODE>0
<SEVERITY>INFO
</STATUS>

<LANGUAGE>POR
</SONRS>
</SIGNONMSGSRSV1>

<CREDITCARDMSGSRSV1>
<CCSTMTTRNRS>
<TRNUID>1001
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>

<CCSTMTRS>
<CURDEF>BRL
<CCACCTFROM>
<ACCTID>nubank-ofx-preview
</CCACCTFROM>

<BANKTRANLIST>
${transactions.map(i => ofxItem(i, detailed)).join('\n')}
</BANKTRANLIST>

</CCSTMTRS>
</CCSTMTTRNRS>
</CREDITCARDMSGSRSV1>
</OFX>
`;
}

export default async function generateOfxFile(transactions) {
  const data = generateOfx(transactions, true)
  const filePath = `ynab-sync-nubank.ofx`

  try {
    fs.writeFileSync(filePath, data);
  } catch (e) {
    console.log(e)
  }

  return filePath
}
