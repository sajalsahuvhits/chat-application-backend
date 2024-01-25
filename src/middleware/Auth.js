import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { ResponseMessage } from "../utils/ResponseMessage.js";
import { User } from "../models/User.js";

export const auth = async (req, res, next) => {
  const bearertoken = req.headers.authorization;
  if (!bearertoken) {
    res.status(401).json({ message: "Token not authorized" });
  } else {
    try {
      const token = bearertoken.split(" ").pop();
      const decode = jwt.verify(token, process.env.SECRET_KEY);
      if (decode.user) {
        const validUser = await User.findById(decode.user.id);
        if (validUser) {
          if (validUser.isActive) {
            req.user = decode.user.id;
            next();
          } else {
            res.status(401).json({
              status: StatusCodes.UNAUTHORIZED,
              message: ResponseMessage.ACCOUNT_DEACTIVATED,
              data: [],
            });
          }
        } else {
          res.status(401).json({
            status: StatusCodes.UNAUTHORIZED,
            message: ResponseMessage.TOKEN_NOT_VALID,
            data: [],
          });
        }
      } else {
        res.status(401).json({
          status: StatusCodes.UNAUTHORIZED,
          message: ResponseMessage.TOKEN_NOT_VALID,
          data: [],
        });
      }
      // next();
    } catch (err) {
      if (err.name == "JsonWebTokenError") {
        res.status(401).json({
          status: StatusCodes.UNAUTHORIZED,
          message: ResponseMessage.AUTHENTICATION_FAILED,
          data: [err.message],
        });
      } else {
        res.status(500).json({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: err.message,
        });
      }
    }
  }
};
