import { Router } from "express";
import {
  createMeeting,
  getSchedualedMeeting,
  meetingExist,
  joinMeeting,
  leaveMeeting,
  hostedMeetings,
  joinedMeetings,
  pastMeetings,
} from "../controllers/meetingsController.js";

const meetingsRoute = Router();

//POST-> /api/meeting/create
meetingsRoute.post("/create", createMeeting);

//GET-> /api/meeeting/scheduledmeetings
meetingsRoute.get("/scheduledmeetings", getSchedualedMeeting);

//GET-> /api/meeting/isExist
meetingsRoute.get("/isexist", meetingExist);

//POST-> /api/meeting/participant/join
meetingsRoute.post("/participant/join", joinMeeting);

//POST-> /api/meeting/participant/leave
meetingsRoute.post("/participant/leave", leaveMeeting);

//GET -> /api/meeting/hostmeetings
meetingsRoute.get("/hostmeetings", hostedMeetings);

//GET-> /api/meeting/joinmeetings
meetingsRoute.get("/joinmeetings", joinedMeetings);

//get-> /api/meeting/pastmeetings
meetingsRoute.get("/pastmeetings", pastMeetings);

export default meetingsRoute;
