import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Media from "../models/media.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const uploadMedia = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded", [{ code: "NO_FILE_UPLOADED" }]);
    }

    let result;
    try {
        result = await uploadToCloudinary(req.file.buffer);
    } catch (error) {
        throw new ApiError(500, "Image upload to cloud failed" + error, [{ code: "UPLOAD_FAILED" }]);
    }

    const media = await Media.create({
        originalName: req.file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        uploader: req.user._id
    });

    if (!media) {
        throw new ApiError(500, "Internal Server Error while saving media", [{ code: "DB_ERROR" }]);
    }

    return res.status(201).json(new ApiResponse(201, media, "Media uploaded successfully"));
});

const getMedia = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const mediaList = await Media.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("uploader", "fullName username");

    const totalMedia = await Media.countDocuments();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                media: mediaList,
                pagination: {
                    totalMedia,
                    currentPage: page,
                    totalPages: Math.ceil(totalMedia / limit)
                }
            },
            "Media fetched successfully"
        )
    );
});

const deleteMedia = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
        throw new ApiError(404, "Media not found", [{ code: "MEDIA_NOT_FOUND" }]);
    }

    try {
        await deleteFromCloudinary(media.publicId);
    } catch (error) {
        throw new ApiError(500, "Failed to delete from cloud storage", [{ code: "CLOUD_DELETE_FAILED" }]);
    }

    await media.deleteOne();

    return res.status(200).json(new ApiResponse(200, { id }, "Media deleted successfully"));
});

export { uploadMedia, getMedia, deleteMedia };
