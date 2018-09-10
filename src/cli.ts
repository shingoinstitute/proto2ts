#! /usr/bin/env node
import { readFile } from 'fs'
import { promisify } from 'util'
import { generate } from '.'
const read = promisify(readFile)

const readStream = (stream: NodeJS.ReadStream) =>
  new Promise<string>((res, rej) => {
    stream.setEncoding('utf8')
    let accum = ''
    stream.on('readable', () => {
      let chunk
      // tslint:disable-next-line:no-conditional-assignment
      while (null !== (chunk = stream.read())) {
        accum += chunk
      }
    })
    stream.on('error', err => {
      rej(err)
    })
    stream.on('end', () => {
      res(accum)
    })
  })

export interface Args {
  files: Array<NodeJS.ReadStream | string>
}

const getArgs = (): Args => {
  const [, , ...args] = process.argv
  if (args.length === 0) return { files: [process.stdin] }
  return { files: args }
}

const getSource = (f: NodeJS.ReadStream | string) =>
  typeof f === 'string' ? read(f, 'utf8') : readStream(f)

export const cli = (args: Args) => {
  const generated = args.files.map(f => getSource(f).then(generate))
  return Promise.all(generated)
}

if (typeof require !== 'undefined' && require.main === module) {
  cli(getArgs())
    .then(str => process.stdout.write(str.join('\n')))
    .catch(err => process.stderr.write(err))
}
