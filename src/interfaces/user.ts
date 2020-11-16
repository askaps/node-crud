import mongoose from "mongoose";

export default interface IUser extends mongoose.Document {
    name: string;
    email: string;
    mobile: string;
    password: string;
    resetPasswordToken: string;
    resetPasswordExpires: number;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
