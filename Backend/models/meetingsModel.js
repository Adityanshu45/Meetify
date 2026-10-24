import mongoose, { Schema } from "mongoose";

const meetingsSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    startAt: {
      type: Date,
      default: null,
    },
    endAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  },
);

//create model
const meetingsModel = mongoose.model("Meeting", meetingsSchema);

export default meetingsModel;
