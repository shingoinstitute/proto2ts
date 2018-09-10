import { cli } from '../cli'
import { stripIndent } from 'common-tags'

describe('primitives.proto', () => {
  it('successfully parses a simple proto3 file', async () => {
    expect.assertions(1)
    const result = await cli({ files: ['src/__tests__/primitives.proto'] })
    expect(result[0]).toEqual(
      stripIndent`
        export interface Number {
          double?: number
          float?: number
          int32?: number
          uint32?: number
          sint32?: number
          fixed32?: number
          sfixed32?: number
        }
        export interface Long {
          int64?: string
          uint64?: string
          sint64?: string
          fixed64?: string
          sfixed64?: string
        }
        export interface Bool {
          bool?: boolean
        }
        export interface String {
          string?: string
        }
        export interface Bytes {
          bytes?: string
        }
      `,
    )
  })

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
          page_number?: number
          result_per_page?: number
          corpus?: Corpus
          aliased?: EnumAllowingAlias
        }
      `,
    )
  })

  it('successfully parses a proto3 file with nested types', async () => {
    expect.assertions(1)
    const result = await cli({ files: ['src/__tests__/nested.proto'] })
    expect(result[0]).toEqual(
      stripIndent`
        export interface NestedTypes {
          results?: Array<NestedTypes.Result>
        }
        export namespace NestedTypes {
          export interface Result {
            url?: string
            title?: string
            snippets?: Array<string>
          }
        }
        export interface DeepNestedTypes {
          results?: Array<DeepNestedTypes.Result>
          results2?: Array<DeepNestedTypes.Result.Res1>
          results3?: Array<DeepNestedTypes.Result.Res1.Res2>
        }
        export namespace DeepNestedTypes {
          export interface Result {
            url?: string
            title?: string
            snippets?: Array<string>
          }
          export namespace Result {
            export interface Res1 {
              a?: Res1.Res2
            }
            export namespace Res1 {
              export interface Res2 {
                a?: string
              }
            }
          }
        }
      `,
    )
  })
})
