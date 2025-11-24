import axios from 'axios'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { MdAccountCircle } from "react-icons/md";

const Chats = () => {

  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      async function  findfrineds() {
        const res =await axios.get('/api/profile');
        setFriends(res.data.friends);
        console.log(res.data.friends);
      }
      findfrineds();
    }
    catch (err) {
      console.log("error in finding friends", err);
    }
  },[]);

  const openChat = (friend) => {
    navigate(`/chat/${friend._id}`);
  }

  return (
    <Card className="min-h-screen bg-background text-foreground border-none rounded-none">
      <CardHeader className="px-4">
      <h1 className="text-3xl font-bold text-card-foreground mb-6">Your Friends</h1>
      </CardHeader>
      <CardContent className="px-4">
      <div className="space-y-4">
        {friends.length > 0 ? (
          friends.map((friend) => (
              <Card key={friend._id} onClick={()=>{openChat(friend)}} className="flex items-center space-x-4 bg-card text-card-foreground p-4 rounded-lg shadow-md">
              {friend.avatar ? (
                <img
                  src={friend.avatar}
                  alt={`${friend.username}'s Avatar`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <MdAccountCircle className="w-16 h-16 rounded-full border-2 border-primary p-2" />
              )}
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">{friend.username}</h2>
                <p className="text-muted-foreground">Recent Message: {friend.lastMessage || 'No recent messages'}</p>
              </div>
              </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No friends found.</p>
        )}
      </div>
      </CardContent>
    </Card>
  )
}

export default Chats