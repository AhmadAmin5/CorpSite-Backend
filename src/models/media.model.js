import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        format: {
            type: String
        },
        size: {
            type: Number
        },
        uploader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

const Media = mongoose.model("Media", mediaSchema);
export default Media;
