import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DiscussionChat = ({ problemId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const token = Cookies.get('token');
  useEffect(() => {

    console.log(problemId);
    if (problemId) {
      const newSocket = io('http://localhost:3002', { query: { problemId } });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to socket.io');
        newSocket.emit('join_discussion_room',problemId);
      });


      newSocket.on('receive_discussion_message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [problemId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/problems/${problemId}/discussions`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [problemId]);

  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      socket.emit('send_discussion_message',{discussionId:problemId,text:newMessage,timestamp:new Date(),token:token});
      setNewMessage('');
      fetchMessages();
    }
  };

  return (
    <Card className="flex flex-col h-full bg-card rounded-lg shadow-md p-4 ">
     
      <CardContent className="flex flex-col gap-1 overflow-y-auto mb-4 p-4 border rounded-md border-none">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet. Be the first to start a discussion!</p>
        ) : (
          messages.map((msg, index) => (
            <Card key={index} className="mb-2 p-3 rounded-lg last:mb-0">
              <CardContent className="p-0">
                <div className="font-semibold text-primary text-sm">{msg.username || 'Anonymous'}:</div>
                <div className="text-foreground text-base break-words">{msg.text}</div>
                <div className="text-right text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleString()}</div>
              </CardContent>
            </Card>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="flex space-x-2 p-0">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-2 rounded-md focus:outline-none focus:ring-2"
        />
        <Button
          onClick={sendMessage}
          className="px-4 py-2 rounded-md transition duration-200"
        >
          Send
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DiscussionChat; 