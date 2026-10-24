import React, { useEffect } from "react";
import styles from "./Hero.module.css";
import { useForm } from "react-hook-form";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { customAlphabet } from "nanoid";
const alphabet = "123456789abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 18);

import AuthContext from "../../context/AuthContext.js";
import { useContext } from "react";
import api from "../../api/axios.js";
import { toast } from "react-toastify";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const frontendBaseUrl = import.meta.env.VITE_FRONTEND_BASE_URL;

function Hero() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [scheduledMeetings, setScheduledMeetings] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0], // Default to today (YYYY-MM-DD)
    },
  });

  const selectedDateStr = watch("date");
  const selectedDate = selectedDateStr ? new Date(selectedDateStr) : new Date();

  const onSubmit = async (data) => {
    const meetingId = nanoid();
    const scheduledAt = Date.parse(`${data.date}T${data.time}:00`);
    try {
      const response = await api.post("/meeting/create", {
        meetingId: meetingId,
        title: data.title,
        hostId: user._id,
        scheduledAt: scheduledAt,
        status: "scheduled",
      });
      setTimeout(() => {
        navigate("/home");
      }, 2000);
      toast.success(response.data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || "Somthing went wrong");
    }
  };

  const handleCancel = () => {
    navigate("/home");
  };

  // Update react-hook-form when Calendar is clicked
  const handleCalendarChange = (newDate) => {
    // Format to YYYY-MM-DD for the date input
    const offsetDate = new Date(
      newDate.getTime() - newDate.getTimezoneOffset() * 60000,
    );
    const formattedDate = offsetDate.toISOString().split("T")[0];
    setValue("date", formattedDate, { shouldValidate: true });
  };

  //get Scheduled meetings
  useEffect(() => {
    if (!user?._id) return;
    const fetchScheduledMeetings = async () => {
      try {
        const response = await api.get("/meeting/scheduledmeetings", {
          params: {
            hostId: user?._id,
            limit: 3,
          },
        });
        setScheduledMeetings(response.data.meetings);
      } catch (e) {
        console.log(e);
      }
    };
    fetchScheduledMeetings();
  }, [user?._id]);

  return (
    <div className={styles.scheduleContainer}>
      {/* Left Column - Form */}
      <div className={styles.scheduleCard}>
        <h1 className={styles.heading}>Meeting Details</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputGroup}>
            <label htmlFor="title">Meeting Title *</label>
            <input
              placeholder="e.g. Weekly Team Sync"
              {...register("title", {
                required: "Please enter meeting title",
                pattern: {
                  value: /^[A-Za-z0-9 ]+(?:[ -][A-Za-z0-9 ]+)*$/,
                  message: "Use only letters, numbers, spaces, or hyphens",
                },
              })}
              type="text"
              id="title"
            />
            {errors.title && (
              <div className={styles.errorMsg}>{errors.title.message}</div>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="date">Date *</label>
              <div className={styles.inputWithIcon}>
                <input
                  {...register("date", { required: "Date is required" })}
                  type="date"
                  id="date"
                />
              </div>
              {errors.date && (
                <div className={styles.errorMsg}>{errors.date.message}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="time">Time *</label>
              <div className={styles.inputWithIcon}>
                <input
                  {...register("time", { required: "Time is required" })}
                  type="time"
                  id="time"
                  defaultValue="10:00"
                />
              </div>
              {errors.time && (
                <div className={styles.errorMsg}>{errors.time.message}</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button
              type="submit"
              onSubmit={handleSubmit(onSubmit)}
              className={styles.submitBtn}
            >
              📅 Schedule Meeting
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Right Column - Calendar & Info */}
      <div className={styles.rightSidebar}>
        <div className={styles.sideCard}>
          <h2 className={styles.subHeading}>Pick a Date</h2>
          <div className={styles.customCalendarWrapper}>
            <Calendar
              onChange={handleCalendarChange}
              value={selectedDate}
              className={styles.customCalendar}
            />
          </div>
        </div>

        <div className={styles.sideCard}>
          <h2 className={styles.subHeading}>Upcoming Meetings</h2>
          {scheduledMeetings?.length === 0 && (
            <p className={styles.empty}>No meetings scheduled yet.</p>
          )}
          {scheduledMeetings?.map((meeting) => (
            <div key={meeting._id} className="meetingsData">
              <div className="meetingList">
                <div className={styles.meetingList}>
                  <div className={styles.meetingListData}>
                    <div className={styles.meetingListDataIcon}></div>
                    <div className={styles.meetingListDataDetails}>
                      <h1>{meeting.title}</h1>
                      <p>
                        <i className="fa-regular fa-clock"></i>{" "}
                        <span>
                          {new Date(meeting.scheduledAt).toDateString() ===
                          new Date().toDateString()
                            ? "Today"
                            : new Date(meeting.scheduledAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
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
                        Host: You
                      </p>
                    </div>
                  </div>
                  <div className={styles.meetingListLink}>
                    <Link to={`${frontendBaseUrl}/room/${meeting.meetingId}`}>
                      Join
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hero;
