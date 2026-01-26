import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";

const cookieOptions = { httpOnly: true, secure: true, sameSite: "none" };

const login = asyncHandler(async (req, res) => {
    const { username = undefined, email = undefined, password = undefined } = req.body;

    if (!(username || email)) throw new ApiError(400, "Username or Email required for Login", [{ code: "MISSING_FIELDS" }]);
    if (!password) throw new ApiError(400, "Password required", [{ code: "MISSING_FIELDS" }]);

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) throw new ApiError(404, "User not found", [{ code: "USER_NOT_FOUND" }]);
    //Edge case of recieving both username and email

    if (!(await user.isPasswordCorrect(password))) throw new ApiError(401, "Invalid Credientials", [{ code: "INVALID_CREDIENTIALS" }]);

    if (!user.isActivated) throw new ApiError(401, "User not actived", [{ code: "NOT_ACTIVATED" }]);
    if (user.isBlocked) throw new ApiError(401, "User blocked", [{ code: "BLOCKED" }]);

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

    const userToSend = { username: user.username, fullName: user.fullName, email: user.email, profilePicture: user.profilePicture };

    res.status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: userToSend, accessToken }, "User logged in and tokens generated successfully"));
});

const logout = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } }, { new: true });

    res.status(200)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refresh = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new ApiError(401, "No refreshToken recieved", [{ code: "REFRESH_TOKEN_MISSING" }]);

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decodedToken) throw new ApiError(401, "Invalid refreshToken", [{ code: "INVALID_REFRESH_TOKEN" }]);

    const user = await User.findById(decodedToken._id).select("-password");
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user);

    const userToSend = { username: user.username, fullName: user.fullName, email: user.email };

    res.status(200)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: userToSend, accessToken }, "Access token refreshed"));
});

const inviteUser = asyncHandler(async (req, res) => {
    const { email, username, fullName, role } = req.body;

    if ([email, username, fullName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Email, Username, and Full Name are required", [{ code: "MISSING_FIELDS" }]);
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists", [{ code: "USER_EXISTS" }]);
    }

    const invitationToken = crypto.randomBytes(32).toString("hex");

    const invitationExpiry = Date.now() + 24 * 60 * 60 * 1000;

    const user = await User.create({
        email,
        username,
        fullName,
        role: role || "viewer",
        invitationToken,
        invitationExpiry,
        isActivated: false
    });

    const inviteLink = `${process.env.CORS_ORIGIN}/activate-account?token=${invitationToken}`;

    return res.status(201).json(new ApiResponse(201, { inviteLink, invitationToken }, "User invited successfully. Share the link."));
});

const activateAccount = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        throw new ApiError(400, "Token and Password are required", [{ code: "MISSING_FIELDS" }]);
    }

    const user = await User.findOne({
        invitationToken: token,
        invitationExpiry: { $gt: Date.now() } // Checks if expiry is strictly greater than NOW
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired invitation token", [{ code: "TOKEN_REJECTED" }]);
    }

    user.password = password;
    user.invitationToken = undefined;
    user.invitationExpiry = undefined;
    user.isActivated = true;

    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Account activated successfully. You can now login."));
});

const checkUsername = asyncHandler(async (req, res, next) => {
    const { username } = req.body;
    if (!username) throw new ApiError(400, "No username recieved", [{ code: "USERNAME_MISSING" }]);

    if (await User.findOne({ username }))
        res.status(200).json(
            new ApiResponse(200, { username, userExists: true, usernameAvailable: false }, "User exists. Username already taken")
        );
    else
        res.status(200).json(
            new ApiResponse(200, { username, userExists: false, usernameAvailable: true }, "User does not exists. Username available")
        );
});

const checkEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "No email recieved", [{ code: "EMAIL_MISSING" }]);

    if (await User.findOne({ email }))
        res.status(200).json(new ApiResponse(200, { email, userExists: true, emailAvailable: false }, "User exists."));
    else res.status(200).json(new ApiResponse(200, { email, userExists: false, emailAvailable: true }, "User does not exists."));
});

const generateAccessAndRefreshToken = async (user) => {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        logger.debug(error.message);
        throw new ApiError(500, "Could not generate tokens", [{ code: "ERROR_GENERATING_TOKENS" }]);
    }
};

export { login, logout, refresh, inviteUser, activateAccount, checkUsername, checkEmail };
