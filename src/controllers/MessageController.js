import { User } from "../models/User.js";
import { Chat } from "../models/Chat.js";
import { Message } from "../models/Message.js";
import { ResponseMessage } from "../utils/ResponseMessage.js";
import { sendResponse } from "../services/CommonServices.js";
import { StatusCodes } from "http-status-codes";

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  let newMessage = {
    sender: req.user,
    content,
    chat: chatId,
  };

  try {
    let messageCreate = await Message.create(newMessage);
    let message = await Message.findById(messageCreate._id)
      .populate("sender")
      .populate({ path: "chat", populate: { path: "users" } });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message._id,
    });
    sendResponse(res, StatusCodes.OK, ResponseMessage.MESSAGE_SEND, message);
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ResponseMessage.INTERNAL_SERVER_ERROR,
      [error.message]
    );
  }
};

export const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender")
      .populate("chat");
    sendResponse(
      res,
      StatusCodes.OK,
      ResponseMessage.MESSAGE_FETCHED,
      messages
    );
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ResponseMessage.INTERNAL_SERVER_ERROR,
      [error.message]
    );
  }
};
