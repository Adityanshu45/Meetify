import { meetingsSchema } from "../validations/meetingsValidation.js";
import { meetingParticipantSchema } from "../validations/MeetingParticipantValidation.js";

import meetingsModel from "../models/meetingsModel.js";
import MeetingParticipantModel from "../models/MeetingParticipantModel.js";

//create new Meetings
async function createMeeting(req, res) {
  let data = req.body;
  //validate Schema
  const { error, value } = meetingsSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((e) => ({
        field: e.path[0],
        message: e.message.replace(/['"]/g, ""),
      })),
    });
  }

  //check if schedulemeeting time is less than current time return err
  const currentTime = Date.now();
  if (value.status == "scheduled") {
    const buffer = 5 * 60 * 1000; //5min
    if (value.scheduledAt < currentTime - buffer) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot schedule the meeting because the selected time has already passed",
      });
    }
  }

  try {
    //save in dataBase
    const newMeeting = new meetingsModel(value);
    await newMeeting.save();
    res.status(201).json({
      success: true,
      message: "Meeting create successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error in DB",
    });
  }
}

//get schedualed meetings
async function getSchedualedMeeting(req, res) {
  const { hostId } = req.query;
  const limit = req.query.limit ? req.query.limit : 0;

  try {
    const schedualedMeetingData = await meetingsModel
      .find({
        hostId: hostId,
        status: "scheduled",
      })
      .sort({ scheduledAt: 1 })
      .limit(limit);
    return res.status(200).json({
      message: true,
      meetings: schedualedMeetingData,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error in DB",
    });
  }
}

//check meeting exist or not
async function meetingExist(req, res) {
  const { meetingId } = req.query;
  try {
    const isExist = await meetingsModel.find({ meetingId: meetingId });
    if (isExist.length == 0) {
      return res.status(200).json({
        success: true,
        message: {
          isExist: false,
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: {
          isExist: true,
          title: isExist[0].title,
          id: isExist[0]._id,
        },
      });
    }
  } catch (e) {
    return res.status(200).json({
      message: "Internal Server error in DB",
    });
  }
}

//save meeting participant data
async function joinMeeting(req, res) {
  const data = req.body;

  const { error, value } = meetingParticipantSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((e) => ({
        field: e.path[0],
        message: e.message.replace(/['"]/g, ""),
      })),
    });
  }

  //chenge status of scheduled meeting to live
  try {
    const meeting = await meetingsModel.findById(value.meetingId);
    if (
      meeting &&
      meeting.hostId.toString() === value.userId.toString() &&
      meeting.status === "scheduled"
    ) {
      meeting.status = "live";
      meeting.startAt = Date.now();
      await meeting.save();
    }
  } catch (e) {
    console.log(e);
  }

  const meetingParticipant = await MeetingParticipantModel.find({
    meetingId: data.meetingId,
    userId: data.userId,
  });
  //meetingParticipant Not exist
  if (meetingParticipant.length === 0) {
    try {
      //save new meetingParticipant data in dataBase
      const newMeetingParticipant = new MeetingParticipantModel(value);
      await newMeetingParticipant.save();
      res.status(201).json({
        success: true,
        message: "Meeting Participant create successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server error in DB",
      });
    }
  } else {
    //add new sessions in dataBase
    try {
      const updatedMeetingParticipant = await MeetingParticipantModel.updateOne(
        //find
        { meetingId: value.meetingId, userId: value.userId },
        //update
        {
          $push: {
            sessions: {
              joinAt: value.sessions[0].joinAt,
              leftAt: null,
              durationSeconds: 0,
            },
          },
        },
      );
      return res.status(200).json({
        success: true,
        message: "Create New Session",
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Internal Server error in DB",
      });
    }
  }
}

//database update when user leave meeting
async function leaveMeeting(req, res) {
  const data = req.body;

  const { error, value } = meetingParticipantSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((e) => ({
        field: e.path[0],
        message: e.message.replace(/['"]/g, ""),
      })),
    });
  }

  try {
    //find meetingParticipant data
    let participant = await MeetingParticipantModel.findOne({
      meetingId: value.meetingId,
      userId: value.userId,
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    let activeSession = participant.sessions.find(
      (session) => session.leftAt === null,
    );

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        message: "No active session found",
      });
    }

    activeSession.leftAt = value.sessions[0].leftAt;

    activeSession.durationSeconds = Math.floor(
      (activeSession.leftAt.getTime() - activeSession.joinAt.getTime()) / 1000,
    );

    //update totalDurationSeconds
    participant.totalDurationSeconds =
      participant.totalDurationSeconds + activeSession.durationSeconds;

    // save in database
    await participant.save();
    return res.status(200).json({
      success: true,
      message: "User left updated in participant",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error in DB",
    });
  }
}

//get total no. of hosted meeting of user
async function hostedMeetings(req, res) {
  const { hostId } = req.query;

  try {
    const response = await meetingsModel.find({ hostId: hostId });
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server error in DB",
    });
  }
}

//get total joined meeting of user
async function joinedMeetings(req, res) {
  const { userId } = req.query;

  try {
    const response = await MeetingParticipantModel.find({ userId: userId });
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server error in DB",
    });
  }
}

//get past meetings
async function pastMeetings(req, res) {
  const { userId } = req.query;
  const limit = req.query.limit ? req.query.limit : 0;
  try {
    //get total joined meetings
    const meetings = await MeetingParticipantModel.find({ userId: userId });
    const joinedMeetingIds = meetings.map((item) => item.meetingId);

    // If the user hasn't joined any meetings,
    if (joinedMeetingIds.length === 0) {
      return res.status(200).json({
        success: true,
        meetings: [],
      });
    }
    //fetch all past meetings
    const pastMeetings = await meetingsModel
      .find({
        _id: { $in: joinedMeetingIds },
        status: "completed",
      })
      .sort({ scheduledAt: -1 })
      .limit(limit);
    res.status(200).json({
      success: true,
      meetings: pastMeetings,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server error in DB",
    });
  }
}

export {
  createMeeting,
  getSchedualedMeeting,
  meetingExist,
  joinMeeting,
  leaveMeeting,
  hostedMeetings,
  joinedMeetings,
  pastMeetings,
};
