import bcrypt from "bcrypt";
import mongoose from "mongoose";
import IUser from "../interfaces/user";

const Schema = mongoose.Schema;

const User = new Schema({
    name: {
        type: String,
        trim: true,
        lowercase : true
    },
    email: {
        type: String,
        index: true,
        trim: true,
        lowercase : true,
        unique : true,
        sparse: true
    },
    mobile: {
        type: String,
        index: true,
        trim: true,
        unique : true,
        sparse: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Schema.Types.Date,
        select: false
    },
    enabled: {
        type: Schema.Types.Boolean,
        default: true
    }
}, {
    timestamps: true
});

/**
 * Password hash middleware.
 */
User.pre("save", function save(next) {
    const user = this as IUser;

    if (!user.isModified("password")) { return next(); }

    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, (err: mongoose.Error, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

User.methods.comparePassword = function(candidatePassword: string): Promise<boolean> {
    const user = this as IUser;
    const password = user.password;

    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, password, (err, success) => {
            if (err) { return reject(err); }
            return resolve(success);
        });
    });
};

export default mongoose.model<IUser>("User", User);
