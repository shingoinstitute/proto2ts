import { parse } from 'protobufjs'
import { entry } from './generator'

/**
 * Generates typescript interfaces from a proto source
 * @param source A protobuf source
 */
export const generate = (source: string) => entry(parse(source))
