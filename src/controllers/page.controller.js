import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Page from "../models/page.model.js";

const createPage = asyncHandler(async (req, res) => {
    const { title, slug, blocks, status, metaTitle, metaDescription } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required");
    }

    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
        throw new ApiError(409, "A page with this slug already exists");
    }

    const page = await Page.create({
        title,
        slug,
        blocks: blocks || [],
        status,
        metaTitle,
        metaDescription,
        author: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, page, "Page created successfully"));
});

const getPages = asyncHandler(async (req, res) => {
    const pageNum = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (pageNum - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) query.title = { $regex: req.query.search, $options: "i" };

    const pages = await Page.find(query)
        .populate("author", "fullName username profilePicture _id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalPagesCount = await Page.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                pages,
                pagination: {
                    totalItems: totalPagesCount,
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalPagesCount / limit)
                }
            },
            "Pages fetched successfully"
        )
    );
});

const getPage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: id } : { slug: id };

    const page = await Page.findOne(query).populate("author", "fullName username");
    if (!page) throw new ApiError(404, "Page not found");

    return res.status(200).json(new ApiResponse(200, page, "Page fetched successfully"));
});

const updatePage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const page = await Page.findById(id);
    if (!page) throw new ApiError(404, "Page not found");

    if (updates.slug && updates.slug !== page.slug) {
        const existing = await Page.findOne({ slug: updates.slug });
        if (existing) throw new ApiError(409, "Slug already in use");
    }

    // Update fields dynamically
    Object.keys(updates).forEach((key) => {
        page[key] = updates[key];
    });

    const updatedPage = await page.save();
    return res.status(200).json(new ApiResponse(200, updatedPage, "Page updated successfully"));
});

const deletePage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const page = await Page.findByIdAndDelete(id);
    if (!page) throw new ApiError(404, "Page not found");

    return res.status(200).json(new ApiResponse(200, { id }, "Page deleted successfully"));
});

export { createPage, getPages, getPage, updatePage, deletePage };
