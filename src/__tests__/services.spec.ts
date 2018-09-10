import { cli } from '../cli'
import { stripIndent } from 'common-tags'

describe('services.proto', () => {
  it('successfully parses a proto3 file with grpc service definition', async () => {
    expect.assertions(1)
    const result = await cli({ files: ['src/__tests__/services.proto'] })
    expect(result[0]).toEqual(
      stripIndent`
        import * as grpc from 'grpc'

        export interface ServiceImplementation {
          UnaryCall: grpc.handleUnaryCall<IntValue, DoubleValue>
          ClientStreamingCall: grpc.handleClientStreamingCall<IntValue, DoubleValue>
          ServerStreamingCall: grpc.handleServerStreamingCall<IntValue, DoubleValue>
          BidiStreamingCall: grpc.handleBidiStreamingCall<IntValue, DoubleValue>
        }
        export interface ServiceClient extends grpc.Client {
          UnaryCall(argument: IntValue, callback: grpc.requestCallback<DoubleValue>): grpc.ClientUnaryCall
          UnaryCall(argument: IntValue, options: grpc.CallOptions | null, callback: grpc.requestCallback<DoubleValue>): grpc.ClientUnaryCall
          UnaryCall(argument: IntValue, metadata: grpc.Metadata | null, callback: grpc.requestCallback<DoubleValue>): grpc.ClientUnaryCall
          UnaryCall(argument: IntValue, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<DoubleValue>): grpc.ClientUnaryCall
          ClientStreamingCall(callback: grpc.requestCallback<DoubleValue>): grpc.ClientWritableStream<IntValue>
          ClientStreamingCall(options: grpc.CallOptions | null, callback: grpc.requestCallback<DoubleValue>): grpc.ClientWritableStream<IntValue>
          ClientStreamingCall(metadata: grpc.Metadata | null, callback: grpc.requestCallback<DoubleValue>): grpc.ClientWritableStream<IntValue>
          ClientStreamingCall(metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<DoubleValue>): grpc.ClientWritableStream<IntValue>
          ServerStreamingCall(argument: IntValue, options?: grpc.CallOptions | null): grpc.ClientReadableStream<DoubleValue>
          ServerStreamingCall(argument: IntValue, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<DoubleValue>
          BidiStreamingCall(options?: grpc.CallOptions | null): grpc.ClientDuplexStream<IntValue, DoubleValue>
          BidiStreamingCall(metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientDuplexStream<IntValue, DoubleValue>
        }
        export interface IntValue {
          value?: number
        }
        export interface DoubleValue {
          value?: number
        }
      `,
    )
  })
})
