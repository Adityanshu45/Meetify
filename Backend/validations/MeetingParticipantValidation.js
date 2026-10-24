import Joi from "joi";

const sessionSchema = Joi.object({
  joinAt: Joi.date().allow(null).default(null),

  leftAt: Joi.date().allow(null).default(null),

  durationSeconds: Joi.number().min(0).default(0),
});

const meetingParticipantSchema = Joi.object({
  meetingId: Joi.string().hex().length(24).required(),
  userId: Joi.string().hex().length(24).required(),
  sessions: Joi.array().items(sessionSchema).default([]),
  totalDurationSeconds: Joi.number().min(0).default(0),
});

export { meetingParticipantSchema };
