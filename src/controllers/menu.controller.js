import Menu from "../models/menu.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createMenu = asyncHandler(async (req, res) => {
    let { name, slug, description, items } = req.body;

    if (!name) throw new ApiError(400, "Name is required");

    if (!slug) {
        slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }

    const existing = await Menu.findOne({ slug });
    if (existing) throw new ApiError(409, "Menu with this slug already exists");

    const menu = await Menu.create({ name, slug, description, items });

    return res.status(201).json(new ApiResponse(201, menu, "Menu created successfully"));
});

const getAllMenus = asyncHandler(async (req, res) => {
    const menus = await Menu.find().sort({ name: 1 });
    return res.status(200).json(new ApiResponse(200, menus, "Menus fetched"));
});

const getMenuBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const menu = await Menu.findOne({ slug });

    if (!menu) throw new ApiError(404, "Menu not found");

    await menu.populate({
        path: "items.resource",
        select: "title name slug fullPath"
    });

    await menu.populate({
        path: "items.children.resource",
        select: "title name slug fullPath"
    });

    return res.status(200).json(new ApiResponse(200, menu, "Menu fetched successfully"));
});

const updateMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, items, slug } = req.body;

    const menu = await Menu.findById(id);
    if (!menu) throw new ApiError(404, "Menu not found");

    if (name) menu.name = name;
    if (description !== undefined) menu.description = description;
    if (items) menu.items = items;

    if (slug && slug !== menu.slug) {
        const existing = await Menu.findOne({ slug });
        if (existing) throw new ApiError(409, "Slug already in use");
        menu.slug = slug;
    }

    await menu.save();

    return res.status(200).json(new ApiResponse(200, menu, "Menu updated successfully"));
});

const deleteMenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Menu.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, null, "Menu deleted successfully"));
});

export { createMenu, getAllMenus, getMenuBySlug, updateMenu, deleteMenu };
