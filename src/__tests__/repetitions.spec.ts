import { cli } from '../cli'
import { stripIndent } from 'common-tags'

describe('repetitions.proto', () => {
  it('successfully parses a proto3 file with repetitions and enumerations', async () => {
    expect.assertions(1)
    const result = await cli({ files: ['src/__tests__/repetitions.proto'] })
    expect(result[0]).toEqual(
      stripIndent`
        export interface Repeated {
          double?: Array<number>
          float?: Array<number>
          int32?: Array<number>
          uint32?: Array<number>
          sint32?: Array<number>
          fixed32?: Array<number>
          sfixed32?: Array<number>
          int64?: Array<string>
          uint64?: Array<string>
          sint64?: Array<string>
          fixed64?: Array<string>
          sfixed64?: Array<string>
          bool?: Array<boolean>
          string?: Array<string>
          bytes?: Array<string>
        }
        export const enum EnumAllowingAlias {
          UNKNOWN = 0,
          STARTED = 1,
          RUNNING = 1,
        }
        export const enum Corpus {
          UNIVERSAL = 0,
          WEB = 1,
          IMAGES = 2,
          LOCAL = 3,
          NEWS = 4,
          PRODUCTS = 5,
          VIDEO = 6,
        }
        export interface Enumerations {
          query?: string
          pageNumber?: number
          resultPerPage?: number
          corpus?: Corpus
          aliased?: EnumAllowingAlias
        }
      `,
    )
  })
})
