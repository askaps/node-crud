import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import IUser from "../interfaces/user";
import User from "../models/user";

class UserService {

    constructor() {
        dotenv.config();
    }

    public login = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: false, data: { errors: errors.array() } });
            }

            const {
                email,
                password
            } = req.body;

            const response: IUser = await User.findOne(
                { $or: [{ email }, { mobile: email }] },
                "name email mobile password enabled"
            );

            if (response) {
                const passwordCompareResponse = await response.comparePassword(password);
                if (!passwordCompareResponse) {
                    return res.status(403).json({ status: false, data: "Incorrect Password" });
                }

                if (!response.enabled) {
                    return res.status(403).json({ status: false, data: "You have been blocked. Contact Support." });
                }

                const user = {
                    id: response._id,
                    name: response.name,
                    email: response.email,
                    mobile: response.mobile
                };

                const token = jwt.sign({ user }, process.env.JWT_SECRET);
                return res.status(200).json({ status: true, data: user, token });
            }

            return res.status(404).json({
                status: false,
                data: "Account not found"
            });

        } catch (error) {
            return res.status(500).json({
                status: false,
                data: "Something went wrong, Please try again"
            });
        }
    }

    public create = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: false, data: { errors: errors.array() } });
            }

            const data = req.body;

            data.enabled = true;

            const response: IUser = await User.create(data);

            if (response) {
                return res.status(201).json({ status: true, data: "Account Created Successfully." });
            }
            return res.status(500).json({
                status: false,
                data: "Something went wrong, Please try again"
            });

        } catch (error) {
            return res.status(500).json({
                status: false,
                data: "Something went wrong, Please try again"
            });
        }
    }

    public forgotPasswordToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: false, data: { errors: errors.array() } });
            }

            const email = req.body.email;

            const isUserExists: IUser = await User.findOne({ email }, "-password");

            if (!isUserExists) {
                return res.status(404).json({
                    status: false,
                    data: "User not found"
                });
            }

            isUserExists.resetPasswordToken = crypto.randomBytes(20).toString("hex");
            isUserExists.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            const response = await isUserExists.save();

            if (response) {

                const demoResponse = `<strong>DEMO (should be on email)</strong><br><br><br><br>
                Dear ${isUserExists.name},<br><br>
                Click below link to reset your password.<br><br>
                <a class="btn" href="${process.env.BASE_URL}public/reset-password/${isUserExists.resetPasswordToken}">Reset Password</a>
                <br><br><b>Note: This link is valid for next 1 hour.</b>`;

                return res.status(200).json({
                    status: true,
                    data: demoResponse
                });
            } else {
                return res.status(500).json({
                    status: false,
                    data: "something went wrong, Please try again"
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                data: "something went wrong, Please try again"
            });
        }
    }

    public resetPassword = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: false, data: { errors: errors.array() } });
            }

            const { resetPasswordToken, password } = req.body;

            if (resetPasswordToken === undefined || resetPasswordToken === "") {
                return res.status(422).json({
                    status: false,
                    data: "Invalid Request"
                });
            }

            const isUserExists = await User.findOne({
                resetPasswordToken
            });

            if (!isUserExists) {
                return res.status(404).json({
                    status: false,
                    data: "User not found"
                });
            }

            isUserExists.password = password;
            isUserExists.resetPasswordToken = "";
            const updateUser = await isUserExists.save();

            if (updateUser) {
                return res.status(200).json({
                    status: true,
                    data: "Your password has been changed."
                });
            } else {
                return res.status(500).json({
                    status: false,
                    data: "Something went wrong, Please try again"
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                data: "Something went wrong, Please try again"
            });
        }
    }

    public getUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const userId = res.locals.jwtPayload.user.id;

            const user: IUser = await User.findById(userId, "-password");

            if (user) {
                return res.status(200).json({
                    status: true,
                    data: user
                });
            }

            return res.status(404).json({
                status: false,
                data: "No data found"
            });

        } catch (error) {
            return res.status(500).json({
                status: false,
                data: "Something went wrong, Please try again"
            });
        }
    }

    public seed = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const response = User.create({
            name: "Abhishek Pratap Singh",
            email: "apsingh.algr@gmail.com",
            mobile: "9015044485",
            password: "Abhi1234#",
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        if (response) {
            return res.status(201).json({ status: true, data: response });
        } else {
            return res.status(500).json({
                status: false,
                data: "Something went wrong, Please try again"
            });
        }
    }

}

export default new UserService();
