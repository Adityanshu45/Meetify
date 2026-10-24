import mongoose, { Schema } from "mongoose";

const MeetingParticipantSchema = new mongoose.Schema(
  {
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessions: [
      {
        joinAt: {
          type: Date,
          default: null,
        },
        leftAt: {
          type: Date,
          default: null,
        },
        durationSeconds: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalDurationSeconds: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

//both combination is unique
MeetingParticipantSchema.index({ meetingId: 1, userId: 1 }, { unique: true });

//create model
const MeetingParticipantModel = mongoose.model(
  "MeetingParticipant",
  MeetingParticipantSchema,
);

export default MeetingParticipantModel;
