import Message from '../models/messageuser.js';

const solution = (io)=>{ io.on('connection',(socket)=>{
  console.log(`User connected to personal message socket: ${socket.id}`);

  socket.on('join_personal_chat', ({ roomId }) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined personal chat room: ${roomId}`);
  });

  socket.on('leave_personal_chat', ({ roomId }) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left personal chat room: ${roomId}`);
  });

  socket.on("prsnl_msg", async ({ roomId, msg, Sendername, recivername, timestamp }) => {
    try {
      const msgModel = new Message({ Sendername, recivername, msg, timestamp });
      await msgModel.save();
      io.to(roomId).emit("per_msg", { roomId, msg, Sendername, recivername, timestamp: msgModel.timestamp });
    } catch (error) {
      console.error("Error saving or sending personal message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected from personal message socket: ${socket.id}`);
  });
})}

export default solution;