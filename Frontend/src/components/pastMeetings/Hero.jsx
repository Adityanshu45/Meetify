import style from "../pastMeetings/Hero.module.css";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import api from "../../api/axios";

function Hero() {
  const { user } = useContext(AuthContext);
  const [pastmeetings, setPastMeetings] = useState([]);

  useEffect(() => {
    const getPastMeetings = async () => {
      if (!user?._id) return;
      try {
        const meetings = await api.get("/meeting/pastmeetings", {
          params: {
            userId: user?._id,
          },
        });
        setPastMeetings(meetings.data.meetings);
      } catch (e) {
        console.log(e);
      }
    };
    getPastMeetings();
  }, [user?._id]);

  return (
    <div className={style.container}>
      <div className={style.meetingsData}>
        <div className={style.header}>
          <div className={style.back}>
            <Link to="/home">
              <i className="fa-solid fa-circle-arrow-left"></i>
            </Link>
          </div>
          <h2 className={style.heading}>Past Meetings</h2>
        </div>

        <div className={style.scrollableList}>
          {pastmeetings?.length === 0 && (
            <p className={style.empty}>No past meetings yet.</p>
          )}

          {pastmeetings?.map((meeting) => {
            const date = new Date(meeting.scheduledAt);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div key={meeting._id} className={style.meetingList}>
                <div className={style.meetingListData}>
                  <div className={style.meetingListDataIcon}>
                    <i className="fa-solid fa-video"></i>
                  </div>
                  <div className={style.meetingListDataDetails}>
                    <h1>{meeting.title}</h1>
                    <p>
                      <i className="fa-regular fa-clock"></i>
                      <span>
                        {isToday
                          ? "Today"
                          : date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                        {" • "}
                        {date.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </p>
                  </div>
                </div>
                <div className={style.meetingListLink}>
                  <Link to={`/room/${meeting.meetingId}`}>Rejoin</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Hero;
