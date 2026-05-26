import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios.config';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/react';
import { ArrowLeft, MoreHorizontal, Paperclip, Phone, Send } from 'lucide-react';

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3002';

const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';

  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ChatPage = () => {
  const { id } = useParams(); // friend's _id
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [roomid, setRoomid] = useState('');

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
    if (!user || !friend || !isLoaded || !isSignedIn) return;
    let newSocket;

    async function connectSocket() {
      const token = await getToken();
      const activeRoomId = [user._id, friend._id].sort().join('');
      setRoomid(activeRoomId);
      newSocket = io(socketUrl, { auth: { token } });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log("user is connected");
        newSocket.emit("join-pslroom", activeRoomId);
      });

      newSocket.on('per_msg', (msg) => {
        if (
          (String(msg.SenderId) === user._id && String(msg.ReciverId) === friend._id) ||
          (String(msg.SenderId) === friend._id && String(msg.ReciverId) === user._id)
        ) {
          setMessages(prev => [...prev, msg]);
        }
      });
    }

    connectSocket();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [user, friend, getToken, isLoaded, isSignedIn]);

  const sendMessage = () => {
    const trimmedMessage = newMessage.trim();
    if (socket && trimmedMessage && user && friend) {
      socket.emit('prsnl_msg', {
        roomid,
        reciverId: id,
        msg: trimmedMessage,
      });
      setNewMessage('');
    }
  };

  if (!friend) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
          <p className="text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  const friendInitial = friend.username?.charAt(0)?.toUpperCase() || '?';
  const canSend = Boolean(newMessage.trim() && socket);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#d9d9d9] p-0 text-[#070b1a] md:p-5">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col overflow-hidden border border-[#eef2f8] bg-[#e5e5e5] shadow-2xl md:min-h-[calc(100vh-6.5rem)] md:rounded-[2rem]">
        <header className="border-b border-[#d8dee8] bg-[#e7e7e7] px-5 py-5 md:px-9 md:py-7">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate('/Chats')}
              aria-label="Back to chats"
              className="h-11 w-11 shrink-0 rounded-full bg-white/70 text-[#172033] shadow-sm hover:bg-white md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="relative h-16 w-16 shrink-0 overflow-visible rounded-[1.25rem] bg-[#171717] shadow-lg md:h-[4.7rem] md:w-[4.7rem] md:rounded-[1.4rem]">
              {friend.avatar ? (
                <img
                  src={friend.avatar}
                  alt={`${friend.username}'s avatar`}
                  className="h-full w-full rounded-[inherit] object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white md:text-3xl">
                  {friendInitial}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[5px] border-[#fff8ed] bg-[#8d8d8d] md:h-6 md:w-6" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black leading-tight tracking-[-0.02em] text-[#070b1a] md:text-3xl">
                {friend.username}
              </h1>
              <div className="mt-1 flex items-center gap-2 text-sm font-bold text-[#69768a] md:text-base">
                <span className="h-2.5 w-2.5 rounded-full bg-[#17bf7a]" />
                <span>Online now</span>
              </div>
            </div>

            <div className="ml-auto hidden items-center gap-3 sm:flex">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Call"
                className="h-14 w-14 rounded-full bg-[#f8fafc] text-[#172033] shadow-sm hover:bg-white md:h-16 md:w-16"
              >
                <Phone className="h-6 w-6" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="More options"
                className="h-14 w-14 rounded-full bg-[#f8fafc] text-[#172033] shadow-sm hover:bg-white md:h-16 md:w-16"
              >
                <MoreHorizontal className="h-7 w-7" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-7 md:px-9 md:py-9">
          {!Array.isArray(messages) || messages.length === 0 ? (
            <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 text-center text-[#8a96aa]">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#171717] text-2xl font-black text-white shadow-lg">
                {friendInitial}
              </div>
              <p className="max-w-xs text-lg font-bold">Start the conversation with {friend.username}.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-7">
              {messages.map((msg, idx) => {
                const mine = msg.Sendername === user?.username;

                return (
                  <div key={`${msg.timestamp || idx}-${idx}`} className={`flex w-full ${mine ? 'justify-end' : 'justify-start'}`}>
                    {!mine && (
                      <div className="mr-4 mt-auto hidden h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[#0e1528] text-xl font-black text-white shadow-sm sm:flex">
                        {friendInitial}
                      </div>
                    )}

                    <div className={`flex max-w-[88%] flex-col md:max-w-[76%] ${mine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-[1.55rem] px-5 py-4 shadow-md md:px-7 md:py-5 ${
                          mine
                            ? 'rounded-br-[0.45rem] bg-[#171717] text-white'
                            : 'rounded-bl-[0.45rem] border border-[#dce3ee] bg-[#fbfbfc] text-[#1d2738]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-[1rem] font-medium leading-7 md:text-[1.1rem]">
                          {msg.msg}
                        </p>
                      </div>
                      <time className="mt-3 text-sm font-bold text-[#91a0b7] md:text-base">
                        {formatMessageTime(msg.timestamp)}
                      </time>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="border-t border-[#d8dee8] bg-[#f4f4f4] px-5 py-5 md:px-9 md:py-7">
          <div className="flex items-end gap-3 md:gap-5">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Attach file"
              className="h-14 w-14 shrink-0 rounded-[1.25rem] bg-white text-[#223047] shadow-sm hover:bg-[#fafafa] md:h-[4.4rem] md:w-[4.4rem]"
            >
              <Paperclip className="h-6 w-6" />
            </Button>

            <textarea
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message..."
              rows={1}
              className="max-h-36 min-h-14 flex-1 resize-none rounded-[1.4rem] border border-[#dce3ee] bg-white px-5 py-4 text-base font-semibold leading-6 text-[#172033] shadow-sm outline-none transition placeholder:text-[#95a2b8] focus:border-[#bac5d6] focus:ring-2 focus:ring-white md:min-h-[4.4rem] md:px-7 md:py-5 md:text-lg"
            />
            <Button
              type="button"
              onClick={sendMessage}
              disabled={!canSend}
              className="h-14 shrink-0 rounded-[1.25rem] bg-[#171717] px-5 text-base font-black text-white shadow-lg hover:bg-[#262626] disabled:bg-[#171717]/40 md:h-[4.4rem] md:px-7 md:text-lg"
            >
              <span className="hidden sm:inline">Send</span>
              <Send className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default ChatPage; 
