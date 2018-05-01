# ynab-sync
> Sync YNAB with Nubank and Banco do Brasil

## Requirements

You need REDIS installed: https://redis.io/

## Installation

```sh
yarn install
```

## CLI Usage

Just run the command bellow to retrieve your NuBank information:

```sh
yarn start -u <NUBANK_LOGIN> -p 2018-01 -o <PATH_TO_CREATE_OFX_FILE>
```

Options:

```
  --help           Show help
  --version        Show version number
  --username, -u   Nubank username [required]
  --ofxOutput, -o  Path to create ofx file [required]
  --period, -p     Transactions period in format YYYY-MM (ex. 2018-01)
  --verbose, -v    Log info on console
```

## Contributing

1. Fork it (<https://github.com/arthurnobrega/ynab-sync/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request