import Joi from "joi";

const meetingsSchema = Joi.object({
  meetingId: Joi.string().length(18).required(),
  title: Joi.string().trim().min(1).required(),
  hostId: Joi.string().hex().length(24).required(),
  scheduledAt: Joi.date().allow(null).default(null),
  startAt: Joi.date().allow(null).default(null),
  endAt: Joi.date().allow(null).default(null),
  status: Joi.string()
    .valid("scheduled", "live", "completed", "cancelled")
    .default("scheduled"),
});

export { meetingsSchema };
