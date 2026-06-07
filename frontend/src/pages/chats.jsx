import axios from 'axios.config'
import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { MessageCircle, UserRound } from "lucide-react";
import { Button } from '@/components/ui/button';

const Chats = () => {

  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      async function findfrineds() {
        const res = await axios.get('/api/chats');
        if (res.data.status === false) {
          navigate('/login');
        }
        setFriends(Array.isArray(res.data) ? res.data : []);
      }
      findfrineds();
    }
    catch (err) {
      console.log("error in finding friends", err);
    }
  }, []);

  const openChat = (friend) => {
    navigate(`/chat/${friend._id}`);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-6 text-foreground md:px-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">{friends.length} conversations</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {Array.isArray(friends) && friends.length > 0 ? (
            friends.map((friend) => (
              <button
                key={friend._id}
                onClick={() => { openChat(friend) }}
                className="flex w-full items-center gap-4 border-b border-border/70 px-4 py-4 text-left transition hover:bg-muted/50 last:border-b-0"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt={`${friend.username}'s avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                      <UserRound className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-medium text-card-foreground">{friend.username}</h2>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {friend.lastMessage || 'No recent messages'}
                  </p>
                </div>

                <Button type="button" size="icon" variant="ghost" className="shrink-0" aria-label={`Open chat with ${friend.username}`}>
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </button>
            ))
          ) : (
            <div className="flex min-h-[45vh] flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="h-7 w-7" />
              </div>
              <p className="text-sm">No friends found.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Chats
