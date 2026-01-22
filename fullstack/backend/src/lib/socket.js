// 

import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// used to store online users
const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  /* 🔹 ADD THIS BLOCK 🔹 */
  socket.on("sendMessage", (data) => {
    const {
      receiverId,
      text,
      image,
      status,
      toxicityScore,
    } = data;

    const receiverSocketId = getReceiverSocketId(receiverId);

    const messagePayload = {
      senderId: userId,
      receiverId,
      text,
      image,
      status, // safe | rephrased
      toxicityScore,
      createdAt: new Date(),
    };

    // Send to receiver if online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messagePayload);
    }

    // Optional: also send back to sender for optimistic UI sync
    socket.emit("newMessage", messagePayload);
  });
  /* 🔹 END BLOCK 🔹 */

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
