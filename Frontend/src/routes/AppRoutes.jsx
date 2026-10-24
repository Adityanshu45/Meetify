import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../components/layouts/PublicLayout.jsx";
import AuthLayout from "../components/layouts/AuthLayout.jsx";
import PrivateLayout from "../components/layouts/PrivateLayout.jsx";
import MeetingLayout from "../components/layouts/MeetingLayout.jsx";

import Landing from "../pages/Landing.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Home from "../pages/Home.jsx";
import MeetingRoom from "../pages/MeetingRoom.jsx";
import Profile from "../pages/Profile.jsx";
import ScheduleMeeting from "../pages/ScheduleMeeting.jsx";
import UpcomingMeetings from "../pages/UpcomingMeetings.jsx";
import PastMeetings from "../pages/PastMeetings.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Landing />} />
        </Route>
        {/* AUTH ROUTES */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* PRIVATE ROUTES */}
        <Route element={<PrivateLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/schedulemeeting" element={<ScheduleMeeting />} />
          <Route path="/home/upcomingmeetings" element={<UpcomingMeetings />} />
          <Route path="/home/pastmeetings" element={<PastMeetings />} />
        </Route>

        <Route element={<MeetingLayout />}>
          <Route path="/room/:id" element={<MeetingRoom />} />
          <Route path="/join" element={<MeetingRoom />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
