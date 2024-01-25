import express from "express";
import * as dotenv from "dotenv";
import { UserRouter } from "./src/routes/UserRoute.js";
import { dbConnection } from "./src/config/Db.config.js";
import cors from "cors";
import { Server } from "socket.io";
import { ChatRouter } from "./src/routes/ChatRoute.js";
import { MessageRouter } from "./src/routes/MessageRoute.js";
dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();
dbConnection();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/user", UserRouter);
app.use("/api/chat", ChatRouter);
app.use("/api/message", MessageRouter);
const server = app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
const io = new Server(server, { cors: "http://localhost:3000" });

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (loggedInUser) => {
    socket.join(loggedInUser._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: ", room);
  });

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;
    let sendMsgToUser = chat.users.find(
      (user) => user._id != newMessageRecieved.sender._id
    );
    socket.in(sendMsgToUser._id).emit("message recieved", newMessageRecieved);
  });

});
