import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatRoom",
        required: true
    },
    callerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    status: {
        type: String,
        enum: ["MISSED", "COMPLETED", "REJECTED", "BUSY"],
        default: "COMPLETED"
    },
    type: {
        type: String,
        enum: ["AUDIO", "VIDEO"],
        default: "VIDEO"
    }
}, { timestamps: true });

export const CallLog = mongoose.model("CallLog", callLogSchema);
