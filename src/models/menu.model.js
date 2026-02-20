import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["custom", "page", "post", "category"],
        required: true
    },
    url: {
        type: String,
        default: ""
    },
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "items.resourceModel",
        default: null
    },
    resourceModel: {
        type: String,
        enum: ["Page", "Post", "Category"],
        default: null
    },
    target: {
        type: String,
        enum: ["_self", "_blank"],
        default: "_self"
    }
});

// Allow one level of nesting for dropdowns
menuItemSchema.add({
    children: [menuItemSchema]
});

const menuSchema = new mongoose.Schema(
    {
        name: {
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
        description: {
            type: String,
            trim: true
        },
        items: [menuItemSchema]
    },
    { timestamps: true }
);

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
