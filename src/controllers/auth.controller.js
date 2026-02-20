import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none"
};

const login = asyncHandler(async (req, res) => {
    const { username = undefined, email = undefined, password = undefined } = req.body;

    if (!(username || email))
        throw new ApiError(400, "Username or Email required for Login", [{ code: "MISSING_FIELDS" }]);
    if (!password) throw new ApiError(400, "Password required", [{ code: "MISSING_FIELDS" }]);

    const user = await User.findOne({
        $or: [{ email }, { username }],
        isDeleted: false
    }).select("-refreshToken");

    if (!user) throw new ApiError(404, "User not found", [{ code: "USER_NOT_FOUND" }]);

    if (!(await user.isPasswordCorrect(password)))
        throw new ApiError(401, "Invalid Credientials", [{ code: "INVALID_CREDIENTIALS" }]);

    if (!user.isActivated) throw new ApiError(401, "User not actived", [{ code: "NOT_ACTIVATED" }]);
    if (user.isBlocked) throw new ApiError(401, "User blocked", [{ code: "BLOCKED" }]);

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

    user.password = undefined;
    user.refreshToken = undefined;

    res.status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { user, accessToken }, "User logged in and tokens generated successfully")
        );
});

const logout = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } }, { new: true });

    res.status(200)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        throw new ApiError(401, "No refreshToken recieved", [{ code: "REFRESH_TOKEN_MISSING" }]);

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decodedToken) throw new ApiError(401, "Invalid refreshToken", [{ code: "INVALID_REFRESH_TOKEN" }]);

    const user = await User.findById(decodedToken._id).select("-password");
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user);

    const userToSend = {
        username: user.username,
        fullName: user.fullName,
        email: user.email
    };

    res.status(200)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: userToSend, accessToken }, "Access token refreshed"));
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

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Account activated successfully. You can now login."));
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { fullName, phone, gender, dateOfBirth, bio, username } = req.body;

    if (req.file) {
        try {
            const result = await uploadToCloudinary(req.file.buffer, "profilePictures");

            if (result?.secure_url) {
                user.profilePicture = result.secure_url;
            }
        } catch (error) {
            throw new ApiError(500, "Failed to upload profile picture");
        }
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (bio) user.bio = bio;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    if (username && username !== user.username) {
        const existingUser = await User.findOne({
            username,
            _id: { $ne: user._id }
        });

        if (existingUser) {
            throw new ApiError(409, "Username is already taken");
        }
        user.username = username;
    }

    const updatedUser = await user.save();

    updatedUser.password = undefined;
    updatedUser.refreshToken = undefined;

    return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const me = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, "User Profile sent"));
});

const generateAccessAndRefreshToken = async (user) => {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Could not generate tokens", [{ code: "ERROR_GENERATING_TOKENS" }]);
    }
};

export { me, login, logout, refresh, updateUser, activateAccount };
