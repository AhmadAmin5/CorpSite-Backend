import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Post from "../models/post.model.js";

const createPost = asyncHandler(async (req, res) => {
    const {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        category,
        tags,
        metaTitle,
        metaDescription
    } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required", [{ code: "MISSING_TITLE" }]);
    }

    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
        throw new ApiError(409, "A post with this URL already exists", [{ code: "SLUG_EXISTS" }]);
    }

    const post = await Post.create({
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        category,
        tags,
        metaTitle,
        metaDescription,
        author: req.user._id,
        publishedAt: status === "published" ? Date.now() : null
    });

    return res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
});

const getPosts = asyncHandler(async (req, res) => {
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

    if (req.query.category) {
        filter.category = req.query.category;
    }

    const posts = await Post.find(filter)
        .populate("author", "fullName username profilePicture _id role")
        .populate("featuredImage", "url")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalPosts = await Post.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                posts,
                pagination: {
                    totalPosts,
                    currentPage: page,
                    totalPages: Math.ceil(totalPosts / limit)
                }
            },
            "Posts fetched successfully"
        )
    );
});

const getPost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const isId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: id } : { slug: id };

    const post = await Post.findOne(query)
        .populate("author", "fullName username profilePicture _.id role")
        .populate("featuredImage");

    if (!post) {
        throw new ApiError(404, "Post not found", [{ code: "POST_NOT_FOUND" }]);
    }

    return res.status(200).json(new ApiResponse(200, post, "Post fetched successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        category,
        tags,
        metaTitle,
        metaDescription
    } = req.body;

    const post = await Post.findById(id);

    if (!post) {
        throw new ApiError(404, "Post not found", [{ code: "POST_NOT_FOUND" }]);
    }

    if (slug && slug !== post.slug) {
        const existingSlug = await Post.findOne({ slug });
        if (existingSlug) {
            throw new ApiError(409, "Slug already in use", [{ code: "SLUG_EXISTS" }]);
        }
    }

    post.title = title || post.title;
    post.slug = slug || post.slug;
    post.content = content !== undefined ? content : post.content;
    post.excerpt = excerpt !== undefined ? excerpt : post.excerpt;
    post.featuredImage = featuredImage !== undefined ? featuredImage : post.featuredImage;

    if (category) post.category = category;
    if (tags) post.tags = tags;
    if (metaTitle !== undefined) post.metaTitle = metaTitle;
    if (metaDescription !== undefined) post.metaDescription = metaDescription;

    if (status && status !== post.status) {
        post.status = status;
        if (status === "published" && !post.publishedAt) {
            post.publishedAt = Date.now();
        }
    }

    try {
        const updatedPost = await post.save();

        return res.status(200).json(new ApiResponse(200, updatedPost, "Post updated successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to update post");
    }
});

const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
        throw new ApiError(404, "Post not found", [{ code: "POST_NOT_FOUND" }]);
    }

    try {
        await post.deleteOne();

        return res.status(200).json(new ApiResponse(200, { id }, "Post deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to delete post");
    }
});

export { createPost, getPosts, getPost, updatePost, deletePost };
