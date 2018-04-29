import redis from 'redis'
import { promisify } from 'util'
import yargs from 'yargs'
import pTry from 'p-try';
import createNuBank from './nubank'
import generateOfxFile from './ofx'

const client = redis.createClient()
const getAsync = promisify(client.get).bind(client)

client.on('error', (err) => {
  console.log(`Error ${err}`)
});

const onlyCommand = {
  command: '$0',

  builder: yargs => (yargs
    .option('username', {
        type: 'string',
        alias: 'u',
        description: 'Username',
        demandOption: true,
    })
    .option('password', {
        type: 'string',
        alias: 'p',
        description: 'Password',
        demandOption: true,
    })
  ),
  handler: (argv) => {
    return pTry(() => main(argv))
      .then(exitCode => process.exit(exitCode || 0), err => {
        console.error(err);
        process.exit(1);
      });
  }
};

void yargs.command(onlyCommand)
  .help()
  .version()
  .argv;

async function main(options) {
  const {username, password} = options
  const ynabNubankTokenKey = `ynab-nubank-token:${username}`

  const NuBank = createNuBank()

  let loginToken = null
  const redisToken = await getAsync(ynabNubankTokenKey)

  try {
    if (redisToken) {
      loginToken = JSON.parse(redisToken)
      NuBank.setLoginToken(loginToken)
    } else {
      loginToken = await NuBank.getLoginToken({ username, password })
      client.set(ynabNubankTokenKey, JSON.stringify(loginToken))
    }

    const wholeFeed = await NuBank.getWholeFeed()
    generateOfxFile(wholeFeed.events)
  } catch (e) {
    console.log('Erro: ', e.toString())
  }

  client.quit()
}
