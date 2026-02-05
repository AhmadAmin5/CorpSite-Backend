import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Page from "../models/page.model.js";

const createPage = asyncHandler(async (req, res) => {
    const {
        title,
        slug,
        content,
        parent,
        status,
        metaTitle,
        metaDescription
    } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required", [{ code: "MISSING_TITLE" }]);
    }

    if (slug) {
        const existingPage = await Page.findOne({ slug });
        if (existingPage) {
            throw new ApiError(409, "A page with this slug already exists", [{ code: "SLUG_EXISTS" }]);
        }
    }

    if (parent) {
        const parentPage = await Page.findById(parent);
        if (!parentPage) {
            throw new ApiError(404, "Parent page not found", [{ code: "PARENT_NOT_FOUND" }]);
        }
    }

    const page = await Page.create({
        title,
        slug,
        content,
        parent: parent || null,
        status,
        metaTitle,
        metaDescription,
        author: req.user._id,
        publishedAt: status === "published" ? Date.now() : null
    });

    return res.status(201).json(new ApiResponse(201, page, "Page created successfully"));
});

const getPages = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
        filter.status = req.query.status;
    }

    if (req.query.search) {
        filter.title = { $regex: req.query.search, $options: "i" };
    }

    const pages = await Page.find(filter)
        .populate("author", "fullName username profilePicture _id role")
        .populate("parent", "title slug fullPath")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalPages = await Page.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                pages,
                pagination: {
                    totalPages,
                    currentPage: page,
                    totalPages: Math.ceil(totalPages / limit)
                }
            },
            "Pages fetched successfully"
        )
    );
});

const getPage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const isId = id.match(/^[0-9a-fA-F]{24}$/);

    let query;
    if (isId) {
        query = { _id: id };
    } else {
        query = { $or: [{ fullPath: id }, { slug: id }] };
    }

    const page = await Page.findOne(query)
        .populate("author", "fullName username profilePicture _id role")
        .populate("parent", "title slug fullPath");

    if (!page) {
        throw new ApiError(404, "Page not found", [{ code: "PAGE_NOT_FOUND" }]);
    }

    return res.status(200).json(new ApiResponse(200, page, "Page fetched successfully"));
});

const updatePage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, slug, content, parent, status, metaTitle, metaDescription } = req.body;

    const page = await Page.findById(id);

    if (!page) {
        throw new ApiError(404, "Page not found", [{ code: "PAGE_NOT_FOUND" }]);
    }

    if (slug && slug !== page.slug) {
        const existingSlug = await Page.findOne({ slug });
        if (existingSlug && existingSlug._id.toString() !== id) {
            throw new ApiError(409, "Slug already in use", [{ code: "SLUG_EXISTS" }]);
        }
        page.slug = slug;
    }

    if (parent !== undefined && parent !== page.parent?.toString()) {
        if (parent === id) {
            throw new ApiError(400, "Page cannot be its own parent", [{ code: "INVALID_PARENT" }]);
        }

        if (parent) {
            const parentPage = await Page.findById(parent);
            if (!parentPage) {
                throw new ApiError(404, "Parent page not found", [{ code: "PARENT_NOT_FOUND" }]);
            }
        }

        page.parent = parent || null;
    }

    if (title) page.title = title;
    if (content !== undefined) page.content = content;
    if (metaTitle !== undefined) page.metaTitle = metaTitle;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;

    if (status && status !== page.status) {
        page.status = status;
        if (status === "published" && !page.publishedAt) {
            page.publishedAt = Date.now();
        }
    }

    try {
        const updatedPage = await page.save();
        return res.status(200).json(new ApiResponse(200, updatedPage, "Page updated successfully"));
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(409, "Page URL/Path collision detected", [{ code: "PATH_EXISTS" }]);
        }
        throw new ApiError(500, "Failed to update page");
    }
});

const deletePage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const page = await Page.findById(id);

    if (!page) {
        throw new ApiError(404, "Page not found", [{ code: "PAGE_NOT_FOUND" }]);
    }

    const children = await Page.findOne({ parent: id });
    if (children) {
        throw new ApiError(400, "Cannot delete page because it has child pages", [{ code: "HAS_CHILDREN" }]);
    }

    await page.deleteOne();

    return res.status(200).json(new ApiResponse(200, { id }, "Page deleted successfully"));
});

export { createPage, getPages, getPage, updatePage, deletePage };