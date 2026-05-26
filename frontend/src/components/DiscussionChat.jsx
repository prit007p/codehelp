import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios.config';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/react';

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3002';

const DiscussionChat = ({ problemId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {

    console.log(problemId);
    if (problemId && isLoaded && isSignedIn) {
      let newSocket;

      async function connectSocket() {
        const token = await getToken();
        newSocket = io(socketUrl, { query: { problemId }, auth: { token } });
        setSocket(newSocket);

        newSocket.on('connect', () => {
          console.log('Connected to socket.io');
          newSocket.emit('join_discussion_room', problemId);
        });


        newSocket.on('receive_discussion_message', (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });
      }

      connectSocket();

      return () => {
        if (newSocket) newSocket.disconnect();
      };
    }
  }, [problemId, getToken, isLoaded, isSignedIn]);

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
      socket.emit('send_discussion_message', { discussionId: problemId, text: newMessage, timestamp: new Date() });
      setNewMessage('');
      fetchMessages();
    }
  };

  return (
    <Card className="flex h-full min-h-[28rem] flex-col rounded-lg bg-card p-3 shadow-md sm:p-4">
     
      <CardContent className="mb-4 flex max-h-[60vh] min-h-0 flex-col gap-1 overflow-y-auto rounded-md border-none p-2 sm:p-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet. Be the first to start a discussion!</p>
        ) : (
          messages.map((msg, index) => (
            <Card key={index} className="mb-2 rounded-lg p-3 last:mb-0">
              <CardContent className="p-0">
                <div className="break-words text-sm font-semibold text-primary">{msg.username || 'Anonymous'}:</div>
                <div className="text-foreground text-base break-words">{msg.text}</div>
                <div className="mt-1 text-right text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleString()}</div>
              </CardContent>
            </Card>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-0 sm:flex-row">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="min-h-10 flex-1 rounded-md p-2 focus:outline-none focus:ring-2"
        />
        <Button
          onClick={sendMessage}
          className="w-full rounded-md px-4 py-2 transition duration-200 sm:w-auto"
        >
          Send
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DiscussionChat; 
