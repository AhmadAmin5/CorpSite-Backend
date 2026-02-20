import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        subject: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["unread", "read", "replied", "archived"],
            default: "unread",
            index: true
        },
        notes: {
            type: String,
            trim: true,
            default: null // For admins to leave internal notes on a query
        }
    },
    { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;