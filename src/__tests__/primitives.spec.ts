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
})
