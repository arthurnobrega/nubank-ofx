import redis from 'redis'
import { promisify } from 'util'
import createNuBank from './nubank'

const client = redis.createClient()
const getAsync = promisify(client.get).bind(client)

client.on('error', (err) => {
  console.log(`Error ${err}`)
});

async function main() {
  const [login, password] = process.argv.slice(process.argv.length - 2)
  const ynabNubankTokenKey = `ynab-nubank-token:${login}`

  const NuBank = createNuBank()

  let loginToken = null
  const redisToken = await getAsync(ynabNubankTokenKey)

  try {
    if (redisToken) {
      loginToken = JSON.parse(redisToken)
      NuBank.setLoginToken(loginToken)
    } else {
      loginToken = await NuBank.getLoginToken({ login, password })
      client.set(ynabNubankTokenKey, JSON.stringify(loginToken))
    }

    // const wholeFeed = await NuBank.getWholeFeed()
    // TODO: Use wholeFeed of Nubank
  } catch (e) {
    console.log('aqui', e.toString())
  }

  client.quit()
}

main()
