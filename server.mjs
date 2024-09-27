import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import express from 'express';
import http2 from 'http2';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 50051;

// Load the .proto file
const PROTO_PATH = './realtime.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition).RealtimeService;

// Define gRPC server implementation
const subscribe = (call) => {
  let count = 0;
  const intervalId = setInterval(() => {
    // Send a message every second
    call.write({
      message: `Real-time message ${count}`,
      timestamp: Date.now(),
    });
    count++;
  }, 1000);

  // Close the stream when the client disconnects
  call.on('end', () => {
    clearInterval(intervalId);
    call.end();
  });
};

const server = new grpc.Server();
server.addService(proto.service, { Subscribe: subscribe });

// SSL credentials for HTTP/2 (for secure gRPC)
const serverOptions = {
  'grpc.ssl_target_name_override': 'localhost',
  'grpc.default_authority': 'localhost',
};

// Start Express server
// app.get('/', (req, res) => res.send('gRPC Server with HTTP/2 is running!'));
app.use(express.static('public')); // Serve static client HTML

// Listen for HTTP traffic on another port
app.listen(3000, () => {
  console.log('Express server is running on http://localhost:3000');
});

// Start gRPC server on HTTP/2 port with SSL
const sslCreds = grpc.ServerCredentials.createSsl(
  fs.readFileSync('certificate/server.crt'), // Your server certificate
  [{ cert_chain: fs.readFileSync('certificate/server.crt'), private_key: fs.readFileSync('certificate/server.key') }], // Your certificate and private key
  true
);
server.bindAsync(`localhost:${PORT}`, sslCreds, (err, port) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`gRPC server running at https://localhost:${PORT}`);
  server.start();
});
