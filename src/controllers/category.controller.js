import Category from "../models/category.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
    let { name, description, slug } = req.body;

    if (!name) throw new ApiError(400, "Name is required");

    if (!slug) {
        slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    } else {
        slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }

    const existing = await Category.findOne({ slug });
    if (existing) throw new ApiError(409, "Category with this slug already exists");

    const category = await Category.create({ name, slug, description });

    return res.status(201).json(new ApiResponse(201, category, "Category created"));
});

const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json(new ApiResponse(200, { categories }, "Categories fetched"));
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let { name, description, slug } = req.body;

    const category = await Category.findById(id);
    if (!category) throw new ApiError(404, "Category not found");

    if (name) category.name = name;

    if (description !== undefined) category.description = description;

    if (slug && slug !== category.slug) {
        slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        
        const existing = await Category.findOne({ slug });
        if (existing && existing._id.toString() !== id) {
            throw new ApiError(409, "Slug is already in use");
        }
        category.slug = slug;
    } else if (!slug && name && name !== category.name) {
        //maybe if we need....
    }

    await category.save();

    return res.status(200).json(new ApiResponse(200, category, "Category updated"));
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, null, "Category deleted"));
});

export { createCategory, getCategories, updateCategory, deleteCategory };