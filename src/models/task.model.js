import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    organizationPhone: {
        type: String,
        required: true,
        index: true
    },

    organizationName: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        enum: [
            "Waste Collection",
            "Recycling",
            "Community Education",
            "Tree Planting",
            "Urban Farming",
            "Climate Data"
        ],
        required: true
    },

    lga: {
        type: String,
        required: true,
        trim: true
    },

    location: {
        type: String,
        required: true,
        trim: true
    },

    neighborhood: {
        type: String,
        trim: true,
        default: ""
    },

    date: {
        type: Date,
        required: true
    },

    startTime: {
        type: String,
        required: true
    },

    endTime: {
        type: String,
        required: true
    },

    workersNeeded: {
        type: Number,
        required: true,
        min: 1
    },

    payPerWorker: {
        type: Number,
        default: 0,
        min: 0
    },

    volunteerOnly: {
        type: Boolean,
        default: false
    },

    proofRequirements: [{
        type: String,
        trim: true
    }],

    contactName: {
        type: String,
        required: true
    },

    contactPhone: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["published", "closed", "cancelled"],
        default: "published",
        index: true
    }
}, { timestamps: true });

taskSchema.index({ status: 1, date: 1, lga: 1 });

export const Task =
    mongoose.models.Task ||
    mongoose.model("Task", taskSchema);