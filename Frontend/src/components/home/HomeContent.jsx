import style from "./HomeContent.module.css";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import { customAlphabet } from "nanoid";
const alphabet = "123456789abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 18);
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import api from "../../api/axios";

function HomeContent() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const { user } = useContext(AuthContext);
  const [joinMeetings, setJoinMeetings] = useState([]);
  const [hourInCall, setHourInCall] = useState(0);
  const [scheduledmeetings, setScheduledMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [meetingsViewData, setMeetingsViewData] = useState([]);
  const [meetingsView, setMeetingsView] = useState("upcoming");
  const [activeTab, setActiveTab] = useState("upcoming");

  //get schuduled (upcoming) meetings
  useEffect(() => {
    const getScheduledMeetings = async () => {
      if (!user?._id) return;
      try {
        const meetings = await api.get("/meeting/scheduledmeetings", {
          params: {
            hostId: user?._id,
            limit: 10,
          },
        });
        setScheduledMeetings(meetings.data.meetings);
      } catch (e) {
        console.log(e);
      }
    };
    getScheduledMeetings();
  }, [user?._id]);

  //get Past meetings
  useEffect(() => {
    const getPastMeetings = async () => {
      if (!user?._id) return;
      try {
        const meetings = await api.get("/meeting/pastmeetings", {
          params: {
            userId: user?._id,
            limit: 10,
          },
        });
        setPastMeetings(meetings.data.meetings);
      } catch (e) {
        console.log(e);
      }
    };
    getPastMeetings();
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

  //handle upcoming and past meetings
  useEffect(() => {
    if (meetingsView === "upcoming") {
      setMeetingsViewData(scheduledmeetings);
    } else {
      setMeetingsViewData(pastMeetings);
    }
  }, [meetingsView, scheduledmeetings, pastMeetings]);

  const handleupcomingClick = () => {
    setMeetingsView("upcoming");
    setActiveTab("upcoming");
  };
  const handlePastClick = () => {
    setMeetingsView("past");
    setActiveTab("past");
  };

  const handleJoinSubmit = () => {
    if (roomCode.trim() !== "") {
      navigate(`/room/${roomCode.trim().toLowerCase().replace(/\s+/g, "")}`);
    }
  };

  return (
    <div className={style.homeContant}>
      <div className={style.mainContent}>
        <div className={style.quickAction}>
          <div className={style.newMeeting}>
            <Link to={`/room/${nanoid()}`}>
              <i className="fa-solid fa-plus"></i>
              <h1>New Meeting</h1>
              <p>Start instantly</p>
            </Link>
          </div>
          <div
            className={style.joinMeeting}
            onClick={() => setShowPopup(true)}
            style={{ cursor: "pointer" }}
          >
            <i className="fa-solid fa-hashtag"></i>
            <h1>Join Meeting</h1>
            <p>Enter a code</p>
          </div>
          <div className={style.scheduleMeeting}>
            <Link to={"/schedulemeeting"}>
              <i className="fa-regular fa-calendar"></i>
              <h1>Schedule</h1>
              <p>Plan ahead</p>
            </Link>
          </div>
        </div>
        <div className={style.meetingPanel}>
          <div className={style.meetingHeader}>
            <div
              onClick={handleupcomingClick}
              className={`${style.upComing} ${activeTab == "upcoming" ? style.activeTab : " "}`}
            >
              Upcoming
            </div>
            <div
              onClick={handlePastClick}
              className={`${style.past}  ${activeTab == "past" ? style.activeTab : " "}`}
            >
              Past
            </div>
          </div>
          <div className={style.meetingsData}>
            {meetingsViewData?.length === 0 && (
              <p className={style.empty}>
                {meetingsView == "upcoming"
                  ? "No meetings scheduled yet."
                  : "No past meetings yet."}
              </p>
            )}
            {meetingsViewData?.map((meeting) => (
              <div key={meeting._id} className="meetingsData">
                <div className="meetingList">
                  <div className={style.meetingList}>
                    <div className={style.meetingListData}>
                      <div className={style.meetingListDataIcon}></div>
                      <div className={style.meetingListDataDetails}>
                        <h1>{meeting.title}</h1>
                        <p>
                          <i className="fa-regular fa-clock"></i>{" "}
                          <span>
                            {new Date(meeting.scheduledAt).toDateString() ===
                            new Date().toDateString()
                              ? "Today"
                              : new Date(
                                  meeting.scheduledAt,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                            {" • "}
                            {new Date(meeting.scheduledAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )}
                          </span>
                          {meetingsView == "upcoming" ? (
                            <span>Host: You</span>
                          ) : (
                            " "
                          )}
                        </p>
                      </div>
                    </div>
                    {meetingsView === "upcoming" ? (
                      <div className={style.meetingListLink}>
                        <Link to={`/room/${meeting.meetingId}`}>Join</Link>
                      </div>
                    ) : (
                      <div
                        className={`${style.meetingListLink} ${style.Rejoin}`}
                      >
                        <Link to={`/room/${meeting.meetingId}`}>Rejoin</Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={style.seeAll}>
            <Link
              to={
                meetingsView === "upcoming"
                  ? "/home/upcomingmeetings"
                  : "/home/pastmeetings"
              }
            >
              View All
            </Link>
          </div>
        </div>
      </div>
      <div className={style.sidebar}>
        <div className={style.profileCard}>
          <div className={style.logoBgColor}></div>
          <div className={style.profileDetails}>
            <div className={style.profileLogo}>A</div>
            <div className={style.profileData}>
              <h1>{user?.fullName}</h1>
              <p>{user?.email}</p>
            </div>
            <div className={style.profileStats}>
              <div className={style.profileStatsList}>
                <h1>{joinMeetings.length}</h1>
                <p>Meetings</p>
              </div>
              <div className={style.profileStatsList}>
                <h1>{hourInCall}h</h1>
                <p>CallTime</p>
              </div>
            </div>
          </div>
          <div className={style.viewProfile}>
            <Link to="/profile">View Full Profile</Link>
          </div>
        </div>
        <div className={style.calenderCard}>
          <Calendar />
        </div>
        {/* JOIN MEETING POPUP MODAL */}
        {showPopup && (
          <div
            className={style.modalOverlay}
            onClick={() => setShowPopup(false)}
          >
            <div
              className={style.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={style.modalHeader}>
                <h2>Join a Meeting</h2>
                <button
                  className={style.closeBtn}
                  onClick={() => setShowPopup(false)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className={style.modalBody}>
                <input
                  type="text"
                  placeholder="Enter meeting code (e.g. abc-defg-hij)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className={style.modalInput}
                />
                <button
                  className={style.modalJoinBtn}
                  onClick={handleJoinSubmit}
                >
                  Join Meeting
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeContent;
