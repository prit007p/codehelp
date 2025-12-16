import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios.config';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ChatPage = () => {
  const { id } = useParams(); // friend's _id
  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  
  const [roomid,setRoomid] = useState('');

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch current user info
  useEffect(() => {
    async function fetchuser() {
      try {
        const res = await axios.get('/api/profile');
        setUser(res.data);
        if (res.data && id) {
          const found = res.data.friends.find(f => f._id === id);
          setFriend(found);
        }
        let h = [res.data._id, id].sort();
        setRoomid(h[0] + h[1]);
      } catch (err) {
        console.log("error in fetching user");
      }
    }
    fetchuser();
  }, [id]); 


  // Fetch chat history
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await axios.get(`/api/psl_msg/messages/${id}`); 
        setMessages(res.data);
      } catch (err) {
        setMessages([]);
      }
    }
    fetchMessages();
  }, [id]);

  // Socket connection
  useEffect(() => {
    if (!user || !friend) return;
    const newSocket = io('http://localhost:3002');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log("user is connected");
      newSocket.emit("join-pslroom",roomid);
    });

    newSocket.on('per_msg', (msg) => {
      if (
        (msg.SenderId === user._id && msg.ReciverId === friend._id) ||
        (msg.SenderId === friend._id && msg.ReciverId === user._id)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, friend]);

  const sendMessage = () => {
    if (socket && newMessage.trim() && user && friend) {
      socket.emit('prsnl_msg', {
        roomid,
        senderId: user._id,
        reciverId: id,
        msg: newMessage,
      });
      setNewMessage('');
    }
  };

  if (!friend) {
    return <div className="flex justify-center items-center min-h-screen bg-background text-foreground">Loading chat...</div>;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex items-center space-x-4 bg-card text-card-foreground p-4 rounded-lg shadow-md mb-4">
        {friend.avatar ? (
          <img
            src={friend.avatar}
            alt={`${friend.username}'s Avatar`}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground border-2 border-primary">
            {friend.username[0]}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">{friend.username}</h2>
          <p className="text-muted-foreground">Personal Chat</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-card rounded-lg shadow-md p-4 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 p-2 rounded-md max-w-lg ${msg.Sendername === user.username ? 'bg-primary text-primary-foreground self-end' : 'bg-muted text-muted-foreground self-start'}`}
            >
              <div className="font-semibold text-primary text-sm">{msg.Sendername === user.username ? 'You' : msg.Sendername}:</div>
              <div className="text-foreground text-base break-words">{msg.msg}</div>
              <div className="text-right text-xs text-muted-foreground">{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex space-x-2">
        <Input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
        />
        <Button
          onClick={sendMessage}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition duration-200"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatPage; 