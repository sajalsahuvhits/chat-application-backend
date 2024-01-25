import mongoose from "mongoose";
import { Message } from "./Message.js";
import { User } from "./User.js";
const chatSchema = mongoose.Schema(
    {
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
      latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages",
      },
    },
    { timestamps: true }
  );
  
  export const Chat = mongoose.model("chats", chatSchema)
  