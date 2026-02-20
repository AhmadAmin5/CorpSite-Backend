import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        description: {
            type: String,
            trim: true
        },
        group: {
            type: String,
            default: "general",
            index: true
        }
    },
    { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);
export default Setting;
