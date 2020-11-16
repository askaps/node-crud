import dotenv from "dotenv";
import express from "express";
import { checkJwt } from "../middlewares/checkJwt";
import UserService from "../services/userService";
import UserValidation from "../validations/UserValidation";

class UserController {
    public path = "/users";
    public router = express.Router();

    constructor() {
        this.initRoutes();
        dotenv.config();
    }

    public initRoutes() {
        this.router.get("/getUser", [checkJwt], UserService.getUser);
        this.router.post("/login", UserValidation.UserLoginValidation, UserService.login);
        this.router.post("/", UserValidation.UserSignupValidation, UserService.create);
        this.router.post("/resetPassword", UserValidation.ResetPasswordValidation, UserService.resetPassword);

        this.router.patch("/forgotPasswordToken",
            UserValidation.ForgotPasswordValidation,
            UserService.forgotPasswordToken
        );

        this.router.get("/reset-password/:resetPasswordToken", (req: express.Request, res: express.Response) => {
            res.render("views/reset-password", {
                baseUrl: process.env.BASE_URL,
                title: "Reset Password",
                resetPasswordToken: req.params.resetPasswordToken
            });
        });

        this.router.get("/", (req: express.Request, res: express.Response) => {
            res.render("views/login", {
                baseUrl: process.env.BASE_URL,
                title: "Login"
            });
        });

        this.router.get("/seed", UserService.seed);
    }
}

export default new UserController().router;
