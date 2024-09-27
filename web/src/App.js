import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { grpc } from "@improbable-eng/grpc-web";
import { RealtimeService } from './realtime_pb_service'; // gRPC service
import { Empty } from './realtime_pb'; // gRPC message types

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const client = grpc.client(RealtimeService.Subscribe, {
      host: "https://localhost:50051"  // Proxy URL for gRPC-Web
    });

    client.onMessage = (message) => {
      setMessages(prevMessages => [
        ...prevMessages, 
        `Message: ${message.getMessage()} at ${message.getTimestamp()}`
      ]);
    };

    client.start();
    client.send(new Empty());  // Send empty request to start the stream

    return () => {
      client.finish();
    };
  }, []);

  return (
    <div>
      <h1>Real-time Data from gRPC Server</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
