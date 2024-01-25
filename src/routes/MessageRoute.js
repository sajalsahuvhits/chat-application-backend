import { Router } from "express";
import { auth } from "../middleware/Auth.js";
import { allMessages, sendMessage } from "../controllers/MessageController.js";
const MessageRouter = Router()
MessageRouter.route("/send-message").post(auth, sendMessage)
MessageRouter.route("/:chatId").get(auth, allMessages)

export {MessageRouter}