import lowdb from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import yargs from 'yargs'
import pTry from 'p-try'
import createNuBank from 'nubank-api'
import inquirer from 'inquirer';
import chalk from 'chalk'
import generateOfxFile from './ofx'

const adapter = new FileSync('db.json')
const db = lowdb(adapter)

db.defaults({ tokens: [] })
  .write()

async function askForPassword(username) {
  const { password } = await inquirer.prompt([{
    type: 'password',
    name: 'password',
    message: `Please enter a password for Nubank username "${username}"`,
  }])
  return password
}

async function main(options) {
  const {
    username,
    period,
    verbose,
    ofxOutput,
  } = options

  const NuBank = createNuBank()

  try {
    let record = db.get('tokens')
      .find({ username })
      .value()

    // Deal with expired token
    if (record && (new Date(record.token.refresh_before) < new Date())) {
      db.get('tokens')
        .remove({ username })
        .write()

      record = undefined
    }

    // Request new token
    if (!record) {
      const password = await askForPassword(username)
      const token = await NuBank.getLoginToken({ login: username, password })

      if (token.error) {
        throw Error(token.error)
      }

      db.get('tokens')
        .push({ username, token })
        .write()

      record = db.get('tokens')
        .find({ username })
        .value()
    }

    NuBank.setLoginToken(record.token)

    const { events: transactions } = await NuBank.getWholeFeed()

    const filteredTransactions = period
      ? transactions.filter(t => t.time.indexOf(period) !== -1)
      : transactions

    if (verbose) {
      console.log(filteredTransactions)
    }

    if (ofxOutput) {
      generateOfxFile(ofxOutput, filteredTransactions)

      if (verbose) {
        console.log(chalk.green(`Ofx file created at ${ofxOutput}`))
      }
    }

    return filteredTransactions
  } catch (e) {
    console.log(chalk.red(e.toString()))

    return null
  }
}

function initializeYargs() {
  const onlyCommand = {
    command: '$0',

    builder: _yargs => (_yargs
      .option('username', {
        type: 'string',
        alias: 'u',
        description: 'Nubank username',
        demandOption: true,
      })
      .option('ofxOutput', {
        type: 'string',
        alias: 'o',
        description: 'Path to create ofx file',
        demandOption: true,
      })
      .option('period', {
        type: 'string',
        alias: 'p',
        description: 'Transactions period in format YYYY-MM (ex. 2018-01)',
      })
      .option('verbose', {
        type: 'boolean',
        description: 'Log transactions on console',
      })
    ),
    handler: argv => pTry(() => main(argv))
      .then(exitCode => process.exit(exitCode || 0), () => process.exit(1)),
  }

  yargs.command(onlyCommand)
    .help()
    .version()
    .locale('en')
    .argv
}

initializeYargs()
