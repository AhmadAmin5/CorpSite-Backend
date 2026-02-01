import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        content: {
            type: String,
            required: false
        },
        excerpt: {
            type: String
        },
        category: {
            type: String,
            default: "Uncategorized",
            index: true
        },
        tags: {
            type: [String],
            default: []
        },
        metaTitle: {
            type: String,
            trim: true
        },
        metaDescription: {
            type: String,
            trim: true
        },
        featuredImage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media"
        },
        status: {
            type: String,
            enum: ["draft", "published", "archived", "private"],
            default: "draft"
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        publishedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

postSchema.pre("validate", function () {
    if (this.title && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
});

const Post = mongoose.model("Post", postSchema);
export default Post;
