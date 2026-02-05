import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import crypto from "crypto";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";


const checkUsername = asyncHandler(async (req, res) => {
    const { username } = req.body;
    if (!username) throw new ApiError(400, "No username recieved", [{ code: "USERNAME_MISSING" }]);

    if (await User.findOne({ username }))
        res.status(200).json(
            new ApiResponse(
                200,
                {
                    username,
                    userExists: true,
                    usernameAvailable: false
                },
                "User exists. Username already taken"
            )
        );
    else
        res.status(200).json(
            new ApiResponse(
                200,
                {
                    username,
                    userExists: false,
                    usernameAvailable: true
                },
                "User does not exists. Username available"
            )
        );
});

const checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "No email recieved", [{ code: "EMAIL_MISSING" }]);

    if (await User.findOne({ email }))
        res.status(200).json(
            new ApiResponse(200, { email, userExists: true, emailAvailable: false }, "User exists.")
        );
    else
        res.status(200).json(
            new ApiResponse(200, { email, userExists: false, emailAvailable: true }, "User does not exists.")
        );
});

const inviteUser = asyncHandler(async (req, res) => {
    const { email, username, fullName, role } = req.body;

    if ([email, username, fullName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Email, Username, and Full Name are required", [{ code: "MISSING_FIELDS" }]);
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
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

    if (!user) throw new ApiError(500, "Internal Server Error");

    const inviteLink = `${process.env.CORS_ORIGIN}/activate-account?token=${invitationToken}`;

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { user, inviteLink, invitationToken },
                "User invited successfully. Share the link."
            )
        );
});

const getAllUsers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, role, status } = req.query;

    const query = { isDeleted: false };

    if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        query.$or = [{ fullName: searchRegex }, { username: searchRegex }, { email: searchRegex }];
    }

    if (role && role !== "all") {
        query.role = role;
    }
    if (status && status !== "all") {
        if (status === "blocked") {
            query.isBlocked = true;
        } else if (status === "active") {
            query.isBlocked = false;
            query.isActivated = true;
        } else if (status === "invited") {
            query.isBlocked = false;
            query.isActivated = false;
        }
    }

    try {
        const users = await User.find(query)
            .select("-password  -refreshToken")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments(query); // Count documents matching the filters

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    users,
                    pagination: {
                        totalUsers,
                        currentPage: page,
                        totalPages: Math.ceil(totalUsers / limit)
                    }
                },
                "Users sent"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Internal Server Error");
    }
});

const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).select("-password  -refreshToken");
    if (!user || user.isDeleted) throw new ApiError(404, "User not found", [{ code: "USER_NOT_FOUND" }]);
    res.status(200).json(new ApiResponse(200, user, "User found"));
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { fullName, email, username, role, phone, gender, bio, dateOfBirth, isBlocked } = req.body;

    const user = await User.findById(id);

    if (!user || user.isDeleted) {
        throw new ApiError(404, "User not found");
    }

    if (req.file) {
        try {
            const result = await uploadToCloudinary(req.file.buffer);
            
            if (result?.secure_url) {
                user.profilePicture = result.secure_url;
            }
        } catch (error) {
            throw new ApiError(500, "Failed to upload profile picture: " + error.message, [{ code: "UPLOAD_FAILED" }]);
        }
    }

    if (email && email !== user.email) {
        const existedUser = await User.findOne({
            email: email,
            _id: { $ne: id }
        });
        if (existedUser) {
            throw new ApiError(409, "Email is already in use by another account", [{ code: "EMAIL_EXISTS" }]);
        }
        user.email = email;
    }

    if (username && username !== user.username) {
        const existedUser = await User.findOne({
            username: username,
            _id: { $ne: id }
        });
        if (existedUser) {
            throw new ApiError(409, "Username is already taken", [{ code: "USERNAME_EXISTS" }]);
        }
        user.username = username;
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (bio) user.bio = bio;

    if (role) user.role = role;
    if (typeof isBlocked === "boolean") user.isBlocked = isBlocked;

    const updatedUser = await user.save();

    if (!updatedUser) throw new ApiError(500, "Internal Server Error while updating user");

    const responseUser = await User.findById(id).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, responseUser, "User details updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) throw new ApiError(404, "User not found", [{ code: "USER_NOT_FOUND" }]);

    user.isDeleted = true;

    //freeing up username and email uniqueness
    const timestamp = Date.now();
    user.username = `${user.username}_deleted_${timestamp}`;
    user.email = `${user.email}_deleted_${timestamp}`;

    user.refreshToken = undefined;

    await user.save();

    res.status(200).json(new ApiResponse(200, null, "User Deleted"));
});

export { checkUsername, checkEmail, inviteUser, getAllUsers, getUser, updateUser, deleteUser };
