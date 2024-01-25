import { StatusCodes } from "http-status-codes";
import { Chat } from "../models/Chat.js";
import { User } from "../models/User.js";
import { sendResponse } from "../services/CommonServices.js";
import { ResponseMessage } from "../utils/ResponseMessage.js";

// responsible for creating and accessing one on one chat...
export const accessChat = async (req, res) => {
  const { userId } = req.body;

  let isChat = await Chat.findOne({
    $and: [
      { users: { $elemMatch: { $eq: req.user } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate({path: "latestMessage", populate: {path: "sender"}});

  if (isChat) {
    sendResponse(
      res,
      StatusCodes.CREATED,
      ResponseMessage.CHAT_CREATED,
      isChat
    );
  } else {
    try {
      const createdChat = await Chat.create({ users: [req.user, userId] });
      if (createdChat) {
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
        sendResponse(
          res,
          StatusCodes.CREATED,
          ResponseMessage.CHAT_CREATED,
          fullChat
        );
      } else {
        sendResponse(
          res,
          StatusCodes.BAD_REQUEST,
          ResponseMessage.CHAT_NOT_CREATED
        );
      }
    } catch (error) {
      sendResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ResponseMessage.INTERNAL_SERVER_ERROR,
        [error.message]
      );
    }
  }
};

export const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user } },
    })
      .populate("users", "-password")
      .populate({path: "latestMessage", populate: {path: "sender"}})
      .sort({ updatedAt: -1 });
    sendResponse(res, StatusCodes.OK, ResponseMessage.CHAT_FETCHED, {chats});
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ResponseMessage.INTERNAL_SERVER_ERROR,
      [error.message]
    );
  }
};
