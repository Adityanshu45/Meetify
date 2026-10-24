import style from "./HomeHeaderStats.module.css";

import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { customAlphabet } from "nanoid";
const alphabet = "123456789abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 18);

import AuthContext from "../../context/AuthContext.js";
import api from "../../api/axios.js";

function HomeHeaderStats() {
  const { user } = useContext(AuthContext);
  const [hostMeetings, setHostMeetings] = useState([]);
  const [joinMeetings, setJoinMeetings] = useState([]);
  const [meetingsThisMonth, setMeetingsThisMonth] = useState([]);
  const [hourInCall, setHourInCall] = useState(0);
  const [scheduledmeetings, setScheduledmeetings] = useState([]);

  //get schuduled meetings
  useEffect(() => {
    const getScheduledMeetings = async () => {
      if (!user?._id) return;
      try {
        const meetings = await api.get("/meeting/scheduledmeetings", {
          params: {
            hostId: user?._id,
          },
        });
        setScheduledmeetings(meetings.data.meetings);
      } catch (e) {
        console.log(e);
      }
    };
    getScheduledMeetings();
  }, [user?._id]);

  //get hosted meeting of user
  useEffect(() => {
    if (!user?._id) return;
    const getHostedMeetings = async () => {
      try {
        const response = await api.get("/meeting/hostmeetings", {
          params: {
            hostId: user?._id,
          },
        });
        setHostMeetings(response.data.data);
      } catch (e) {
        console.log(e);
      }
    };
    getHostedMeetings();
  }, [user?._id]);

  // get join meetings of user
  useEffect(() => {
    if (!user?._id) return;

    const getJoinMeetings = async () => {
      try {
        const response = await api.get("/meeting/joinmeetings", {
          params: {
            userId: user._id,
          },
        });

        const meetings = response.data.data;
        setJoinMeetings(meetings);

        let secondsInCall = 0;

        for (const meeting of meetings) {
          secondsInCall += meeting.totalDurationSeconds || 0;
        }

        setHourInCall((secondsInCall / 3600).toFixed(1));
      } catch (e) {
        console.log(e);
      }
    };

    getJoinMeetings();
  }, [user?._id]);

  //Get no of meetings in this month
  useEffect(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const meetings = joinMeetings.filter((meeting) => {
      return meeting.sessions.some((session) => {
        const joinDate = new Date(session.joinAt);

        return joinDate >= oneMonthAgo && joinDate <= Date.now();
      });
    });
    setMeetingsThisMonth(meetings);

    // console.log(meetings);
  }, [joinMeetings]);

  const date = new Date(Date.now());

  const greet = () => {
    const hour = Number(date.getHours());
    if (hour >= 5 && hour < 12) {
      return "Good morning!";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon!";
    } else {
      return "Good evening!";
    }
  };

  return (
    <div className={style.HomeHeaderStats}>
      <div className={style.HomeHeader}>
        <div className={style.headerGreet}>
          <h1>
            {greet()}, {user?.fullName || ""}
          </h1>
          {/* TODO */}
          <p>You have {scheduledmeetings?.length} upcoming meetings.</p>
        </div>
        <div className={style.newMeeting}>
          <Link to={`/room/${nanoid()}`}>New Meeting</Link>
        </div>
      </div>
      <div className={style.stats}>
        <div className={style.statsList}>
          <i className="fa-solid fa-video"></i>
          <div className={style.statsData}>
            <h1>{meetingsThisMonth?.length}</h1>
            <p>Meetings this month</p>
          </div>
        </div>
        <div className={style.statsList}>
          <i className="fa-regular fa-clock"></i>
          <div className={style.statsData}>
            <h1>{hourInCall}h</h1>
            <p>Hours in call</p>
          </div>
        </div>
        <div className={style.statsList}>
          <i className="fa-brands fa-slack"></i>
          <div className={style.statsData}>
            <h1>{joinMeetings?.length}</h1>
            <p>Meetings Joined</p>
          </div>
        </div>
        <div className={style.statsList}>
          <i className="fa-regular fa-star"></i>
          <div className={style.statsData}>
            <h1>{hostMeetings?.length}</h1>
            <p>Meetings hosted</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeHeaderStats;
