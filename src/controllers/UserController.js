import { StatusCodes } from "http-status-codes";
import {
  encryptPassword,
  genrateToken,
  sendResponse,
} from "../services/CommonServices.js";
import { User } from "../models/User.js";
import { ResponseMessage } from "../utils/ResponseMessage.js";
import bcrypt from "bcryptjs";

//register user or update user info
export const addEditUser = async (req, res) => {
  try {
    const checkUser = await User.find({
      email: req.body.email,
    });
    if (checkUser.length) {
      return sendResponse(res, StatusCodes.CONFLICT, ResponseMessage.USER_ALREADY_CREATED);
    } else {
      req.body.email = req.body.email.toLowerCase();
      req.body.password = await encryptPassword(req.body.password);
      const saveUser = await User.create(req.body);
      if (saveUser) {
        sendResponse(res, StatusCodes.CREATED, ResponseMessage.USER_CREATED, { saveUser });
      } else {
        sendResponse(res, StatusCodes.BAD_REQUEST, ResponseMessage.USER_NOT_CREATED);
      }
    }
  } catch (error) {
    console.log(error);
    sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, ResponseMessage.INTERNAL_SERVER_ERROR, [error.message]);
  }
};

export const userLogin = async ({ body }, res) => {
  try {
    let { email, password } = body;

    if (!email || !password) {
      return sendResponse(res, StatusCodes.BAD_REQUEST, ResponseMessage.ALL_FIELDS_REQUIRED);
    }

    const findUser = await User.findOne({ email }).select("+password -otp");

    if (!findUser) {
      return sendResponse(res, StatusCodes.BAD_REQUEST, ResponseMessage.USER_NOT_FOUND);
    }

    if (!findUser.isVerified) {
      return sendResponse(res, StatusCodes.BAD_REQUEST, ResponseMessage.YOUR_ACCOUNT_NOT_VERIFIED);
    }

    if (!findUser.isActive) {
      return sendResponse(res, StatusCodes.BAD_REQUEST, ResponseMessage.ACCOUNT_IS_INACTIVE);
    }

    const passwordMatch = await bcrypt.compare(password, findUser.password);

    if (!passwordMatch) {
      return sendResponse(res, StatusCodes.UNAUTHORIZED, ResponseMessage.INVALID_CREDENTIALS);
    }

    const payload = { user: { id: findUser._id } };
    const token = genrateToken({
      payload,
      ExpiratioTime: "7d",
    });

    let user = JSON.parse(JSON.stringify(findUser));
    delete user.password;

    sendResponse(res, StatusCodes.OK, ResponseMessage.USER_LOGGED_IN, { user, token });
  } catch (error) {
    console.log(error);
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ResponseMessage.INTERNAL_SERVER_ERROR,
      [error.message]
    );
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user;
    const { search } = req.query;
    const keyword = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find({ _id: { $ne: userId }, ...keyword });
    sendResponse(res, StatusCodes.OK, ResponseMessage.USER_FETCHED, { users });
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ResponseMessage.INTERNAL_SERVER_ERROR,
      [error.message]
    );
  }
};
