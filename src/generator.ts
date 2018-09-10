import {
  IParserResult,
  Namespace,
  Service,
  Type,
  Field,
  OneOf,
  Enum,
  Method,
} from 'protobufjs'
import { html as ts } from 'common-tags'
import { tuple, flatten, split } from './fp'

export interface GenOptions {
  package?: string
  syntax?: string
}

type Message = Type
type TopLevelDefinition = Enum | Message | Service | Namespace
// type MessageBody = Field | Enum | Message | OneOf

export const entry = (parsed: IParserResult) => {
  const result = parsed.root.nestedArray
    .map(v => dispatcher(v as TopLevelDefinition))
    .join('\n')

  return result.includes('grpc') &&
    !result.includes("import * as grpc from 'grpc'")
    ? `import * as grpc from 'grpc'\n\n${result}`
    : result
}

const dispatcher = (
  obj: Namespace | Service | Type | Field | OneOf | Enum,
): string => {
  if (obj instanceof Enum) return parseEnum(obj)
  if (obj instanceof OneOf) return parseOneof(obj)
  if (obj instanceof Field) return parseField(obj)
  if (obj instanceof Type) return parseType(obj)
  if (obj instanceof Service) return parseService(obj)
  if (obj instanceof Namespace) return parseNamespace(obj)
  const _exhaustive: never = obj
  return _exhaustive
}

const typeMapper = (
  type: string,
  specialType?: 'long' | 'bytes',
  options: { useLong?: boolean; useBuffer?: boolean } = {},
) => {
  if (specialType === 'long') return options.useLong ? 'Long' : 'string'
  if (specialType === 'bytes') return options.useBuffer ? 'Buffer' : 'string'
  switch (type) {
    case 'string':
      return 'string'
    case 'double':
    case 'float':
    case 'int32':
    case 'uint32':
    case 'sint32':
    case 'fixed32':
    case 'sfixed32':
      return 'number'
    // case 'int64':
    // case 'uint64':
    // case 'sint64':
    // case 'fixed64':
    // case 'sfixed64':
    //   return useLong ? 'Long' : 'string'
    case 'bool':
      return 'boolean'
    case 'bytes':
      return 'string' // is this correct?
    default:
      return type
  }
}

const parseNamespace = (n: Namespace): string => {
  const objs = n.nestedArray.map(v => dispatcher(v as Service | Type))
  const indentedLines = objs
    .map(s => s.split('\n'))
    .reduce((p, c) => [...p, ...c], [])
  return ts`
  export namespace ${n.name} {
    ${indentedLines}
  }`
}

const parseService = (s: Service): string => {
  const serverMethods = s.methodsArray.map(parseMethodServer)
  const serverImpl = ts`
    export interface ${s.name}Implementation {
      ${serverMethods}
    }
  `
  const clientMethods = s.methodsArray.map(parseMethodClient)
  const clientImpl = ts`
    export interface ${s.name}Client extends grpc.Client {
      ${flatten(clientMethods.map(split('\n')))}
    }
  `

  return `${serverImpl}\n${clientImpl}`
}

const parseMethodServer = (m: Method): string => {
  const clientStreaming = !!m.requestStream
  const serverStreaming = !!m.responseStream
  const bidiStreaming = clientStreaming && serverStreaming
  const { name, requestType, responseType } = m
  const typeParam = `<${requestType}, ${responseType}>`
  const methodType = bidiStreaming
    ? `grpc.handleBidiStreamingCall`
    : serverStreaming
      ? `grpc.handleServerStreamingCall`
      : clientStreaming
        ? `grpc.handleClientStreamingCall`
        : `grpc.handleUnaryCall`
  return `${name}: ${methodType}${typeParam}`
}

const parseMethodClient = (m: Method): string => {
  const clientStreaming = !!m.requestStream
  const serverStreaming = !!m.responseStream
  const bidiStreaming = clientStreaming && serverStreaming
  const { name, requestType, responseType } = m
  const returnType = bidiStreaming
    ? `grpc.ClientDuplexStream<${requestType}, ${responseType}>`
    : serverStreaming
      ? `grpc.ClientReadableStream<${responseType}>`
      : clientStreaming
        ? `grpc.ClientWritableStream<${requestType}>`
        : `grpc.ClientUnaryCall`
  const params = bidiStreaming
    ? [
        'options?: grpc.CallOptions | null',
        'metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null',
      ]
    : serverStreaming
      ? [
          `argument: ${requestType}, options?: grpc.CallOptions | null`,
          `argument: ${requestType}, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null`,
        ]
      : clientStreaming
        ? [
            `callback: grpc.requestCallback<${responseType}>`,
            `options: grpc.CallOptions | null, callback: grpc.requestCallback<${responseType}>`,
            `metadata: grpc.Metadata | null, callback: grpc.requestCallback<${responseType}>`,
            `metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<${responseType}>`,
          ]
        : [
            `argument: ${requestType}, callback: grpc.requestCallback<${responseType}>`,
            `argument: ${requestType}, options: grpc.CallOptions | null, callback: grpc.requestCallback<${responseType}>`,
            `argument: ${requestType}, metadata: grpc.Metadata | null, callback: grpc.requestCallback<${responseType}>`,
            `argument: ${requestType}, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<${responseType}>`,
          ]
  const overloads = params.map(
    paramList => `${name}(${paramList}): ${returnType}`,
  )
  return overloads.join('\n')
}

const parseType = (t: Type): string => {
  const fields = t.fieldsArray.map(dispatcher)
  const unionFields = t.oneofsArray.map(dispatcher)
  const nestedNamespace = t.nestedArray.length > 0 && parseNamespace(t)

  return (
    ts`
    export interface ${t.name} {
      ${[...fields, ...unionFields]}
    }` + (nestedNamespace ? '\n' + nestedNamespace : '')
  )
}

// const getQualifiedName = (t: Namespace): string => {
//   const namespaceTypes = t.parent && t.parent.nestedArray.map(o => o.name)
//   const parentName =
//     namespaceTypes && namespaceTypes.includes(t.name) && t.parent!.name
//   return parentName
//     ? `${getQualifiedName(t.parent!)}.${parentName}.${t.name}`
//     : t.name
// }

const parseField = (f: Field) => {
  const repeated = f.repeated
  const optional = f.optional || !f.required
  const specialType = f.long ? 'long' : f.bytes ? 'bytes' : undefined
  const namespaceTypes = f.parent && f.parent.nestedArray.map(t => t.name)
  const typeQualifier =
    namespaceTypes && namespaceTypes.includes(f.type) && f.parent!.name

  const type = repeated
    ? `Array<${typeQualifier ? typeQualifier + '.' : ''}${typeMapper(
        f.type,
        specialType,
      )}>`
    : (typeQualifier ? typeQualifier + '.' : '') +
      typeMapper(f.type, specialType)

  return `${f.name}${optional ? '?' : ''}: ${type}`
}

const parseOneof = (o: OneOf) => {
  const name = o.name
  // will probably break on longs/buffers
  const types = o.oneof.map(v => typeMapper(v))
  return `${name}: ${types.join('|')}`
}

const parseEnum = (e: Enum) => {
  const pairs = Object.keys(e.values).map(k => tuple(k, e.values[k]))
  return ts`
  export const enum ${e.name} {
    ${pairs.map(([k, v]) => `${k} = ${v},`)}
  }
  `
}
