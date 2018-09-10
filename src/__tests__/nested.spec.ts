import { cli } from '../cli'
import { stripIndent } from 'common-tags'

describe('nested.proto', () => {
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
