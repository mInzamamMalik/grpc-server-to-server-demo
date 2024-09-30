import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.resolve('./proto/helloworld.proto');

// Load the protobuf definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const helloProto = grpc.loadPackageDefinition(packageDefinition).helloworld;

// Define the client
const client = new helloProto.Greeter('localhost:50051', grpc.credentials.createInsecure());

// Invoke the SayHello method
const request = { name: 'World' };

client.SayHello(request, (error, response) => {
  if (!error) {
    console.log('Greeting:', response.message);
  } else {
    console.error('Error:', error.message);
  }
});

client.SayHi(request, (error, response) => {
  if (!error) {
    console.log('Greeting:', response.message);
  } else {
    console.error('Error:', error.message);
  }
});
