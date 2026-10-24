import style from "./Stats.module.css";
import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import api from "../../api/axios";

function Stats() {
  const { user } = useContext(AuthContext);
  const [joinMeetings, setJoinMeetings] = useState([]);
  const [hourInCall, setHourInCall] = useState(0);
  const [meetingsThisMonth, setMeetingsThisMonth] = useState([]);
  const [hostMeetings, setHostMeetings] = useState([]);

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
  }, [joinMeetings]);

  return (
    <div className={style.stats}>
      <div className={style.info}>
        <h1>Your Meeting Stats</h1>
      </div>
      <div className={style.data}>
        <div className={style.meetings}>
          <h1>{joinMeetings?.length}</h1>
          <p>Total Joined Meetings</p>
        </div>
        <div className={style.callTime}>
          <h1>{hourInCall}</h1>
          <p>Call Time</p>
        </div>
        <div className={style.meetingsThisMonth}>
          <h1>{meetingsThisMonth?.length}</h1>
          <p>Meetings this months</p>
        </div>
        <div className={style.totalHostedMeetings}>
          <h1>{hostMeetings?.length}</h1>
          <p>Total Hosted Meetings</p>
        </div>
      </div>
    </div>
  );
}

export default Stats;
