import Setting from "../models/setting.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getSettings = asyncHandler(async (req, res) => {
    const settings = await Setting.find({});

    // Convert array to object for easier frontend access: { menu_locations: {...}, site_title: "..." }
    const settingsMap = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    return res.status(200).json(new ApiResponse(200, settingsMap, "Settings fetched"));
});

const updateSetting = asyncHandler(async (req, res) => {
    const { key, value, group, description } = req.body;

    if (!key) throw new ApiError(400, "Key is required");

    const setting = await Setting.findOneAndUpdate(
        { key },
        {
            value,
            group: group || "general",
            description: description || ""
        },
        { new: true, upsert: true }
    );

    return res.status(200).json(new ApiResponse(200, setting, "Setting updated"));
});

export { getSettings, updateSetting };
