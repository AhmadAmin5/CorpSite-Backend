import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
    {
        id: { type: String, required: true }, // Unique ID for frontend drag-and-drop
        type: {
            type: String,
            required: true,
            enum: ["hero", "text", "features", "testimonial"]
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        settings: {
            backgroundColor: { type: String, default: "transparent" },
            paddingTop: { type: String, default: "md" },
            paddingBottom: { type: String, default: "md" }
        }
    },
    { _id: false }
);

const pageSchema = new mongoose.Schema(
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
        blocks: [blockSchema],
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
        }
    },
    { timestamps: true }
);

pageSchema.pre("validate", function () {
    if (this.title && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
});

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
