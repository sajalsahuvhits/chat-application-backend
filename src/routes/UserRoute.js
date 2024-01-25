import { Router } from "express";
import { addEditUser, getAllUsers, userLogin } from "../controllers/UserController.js";
import { auth } from "../middleware/Auth.js";

// const { verifyUser } = require("../middleware/auth.middleware");
const UserRouter = Router();

UserRouter.route("/add-edit-user").post(addEditUser);
UserRouter.route("/login").post(userLogin);
UserRouter.route("/get-users").get(auth, getAllUsers)


export { UserRouter };
