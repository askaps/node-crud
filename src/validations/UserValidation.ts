import { body } from "express-validator";
import IUser from "../interfaces/user";
import User from "../models/user";

class UserValidation {

    public UserLoginValidation  = [
        body("email").trim().custom((input: string) => {
            const isNumber = /^\d+$/.test(input);
            if (isNumber) {
                if (!this.validateMobile(input)) {
                    return Promise.reject("Please enter a valid 10 digit mobile number");
                }
            } else if (!this.validateEmail(input)) {
                return Promise.reject("Please enter a valid email");
            }
            return Promise.resolve("Success");
        }),
        body("password").trim().isLength({ min: 8 }).withMessage("Password must at least 8 characters long")
    ];

    public UserSignupValidation = [
        body("name").trim().isLength({ min: 4 }).withMessage("Name must at least 4 characters long"),
        body("email").trim().custom(async (input: string) => {
            if (!this.validateEmail(input)) {
                return Promise.reject("Please enter a valid email");
            }
            return this.userCheckByEmail(input);
        }),
        body("mobile").trim().custom(async (input: string) => {
            if (!this.validateMobile(input)) {
                return Promise.reject("Please enter a valid 10 digit mobile number");
            }
            return this.userCheckByMobile(input);
        }),
        body("password").trim().isLength({ min: 8 }).withMessage("Password must at least 8 characters long")
    ];

    public ForgotPasswordValidation = [
        body("email").trim().custom((input: string) => {
            if (!this.validateEmail(input)) {
                return Promise.reject("Please enter a valid email");
            }
            return Promise.resolve("Success");
        }),
    ];

    public ResetPasswordValidation = [
        body("password").trim().isLength({ min: 8 }).withMessage("Password must at least 8 characters long")
    ];

    private validateMobile = (mobile: string): boolean => {
        const regex = /^\d{10}$/;
        return regex.test(mobile);
    }

    private validateEmail = (email: string): boolean => {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    }

    private userCheckByEmail = async (input: string): Promise<string> => {
        await User.findOne({ email: input }, "_id").then((user: IUser) => {
            if (user) {
                return Promise.reject("This email address is already in use");
            }
        });
        return Promise.resolve("Success");
    }

    private userCheckByMobile = async (input: string): Promise<string> => {
        await User.findOne({ mobile: input }, "_id").then((user: IUser) => {
            if (user) {
                return Promise.reject("This mobile number is already in use");
            }
        });
        return Promise.resolve("Success");
    }

}

export default new UserValidation();
