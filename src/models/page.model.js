import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        pageType: {
            type: String,
            enum: ["generic", "hardcoded", "functional"],
            default: "generic",
            index: true
        },
        componentName: {
            type: String,
            required: function () {
                return this.pageType !== "generic";
            },
            trim: true
        },
        content: {
            type: String,
            required: false
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Page",
            default: null
        },
        fullPath: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        status: {
            type: String,
            enum: ["draft", "published", "archived", "private"],
            default: "draft"
        },
        metaTitle: String,
        metaDescription: String,
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

pageSchema.pre("save", async function () {
    if (this.title && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }

    if (this.isModified("slug") || this.isModified("parent")) {
        if (!this.parent) {
            this.fullPath = this.slug;
        } else {
            const parentPage = await mongoose.model("Page").findById(this.parent);

            if (parentPage) {
                this.fullPath = `${parentPage.fullPath}/${this.slug}`;
            } else {
                this.fullPath = this.slug;
            }
        }
    }
});

const Page = mongoose.model("Page", pageSchema);
export default Page;
