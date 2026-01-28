import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        role: {
            type: String,
            enum: ["admin", "manager", "editor", "viewer"],
            default: "viewer"
        },

        password: String,

        gender: {
            type: String,
            enum: ["male", "female", "other",],
            default: null
        },

        isActivated: {
            type: Boolean,
            default: false
        },

        isBlocked: {
            type: Boolean,
            default: false
        },

        isDeleted: {
            type: Boolean,
            default: false
        },

        invitationToken: String,

        invitationExpiry: Date,

        dateOfBirth: Date,

        refreshToken: String,

        profilePicture: String
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const User = mongoose.model("User", userSchema);

export default User;
