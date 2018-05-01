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
    ),
    handler: argv => pTry(() => main(argv))
      .then(exitCode => process.exit(exitCode || 0), () => process.exit(1)),
  }

  yargs.command(onlyCommand)
    .help()
    .version()
    .argv
}

async function askForPassword(username) {
  const { password } = await inquirer.prompt([{
    type: 'password',
    name: 'password',
    message: `Please enter a password for Nubank username "${username}"`,
  }])
  return password
}

async function main(options) {
  const { username } = options
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

    const wholeFeed = await NuBank.getWholeFeed()
    generateOfxFile(wholeFeed.events)
  } catch (e) {
    console.log(chalk.red(e.toString()))
  }
}

initializeYargs()
