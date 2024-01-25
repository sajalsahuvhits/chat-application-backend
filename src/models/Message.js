import mongoose from "mongoose";
import { Chat } from "./Chat.js";
import { User } from "./User.js";
const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "chats" },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model("messages", messageSchema);
