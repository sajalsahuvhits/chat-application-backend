import { Router } from "express";
import { auth } from "../middleware/Auth.js";
import { accessChat, fetchChats } from "../controllers/ChatController.js";
const ChatRouter = Router();

ChatRouter.route("/").post(auth, accessChat).get(auth, fetchChats);

export { ChatRouter };
