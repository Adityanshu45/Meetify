import styles from "./MeetingRoom.module.css";
import React, { useContext, useEffect, useState, useRef } from "react";
import SocketContext from "../context/SocketContext";
import AuthContext from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
var connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function MeetingRoom() {
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef(); //here is my video
  let isInitialMount = useRef(true); // to start getUserMedia() on render page

  //handle ON OFF video and audio
  let [video, setVideo] = useState(true);
  let [audio, setAudio] = useState(true);

  //screen sharing
  let [isScreenSharing, setIsScreenSharing] = useState(false);

  //massage
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [isChatOpen, setIsChatOpen] = useState(false);

  let [askedForUsername, setAskedForUsername] = useState(true);

  let [videos, setVideos] = useState([]);

  const [remotePresenterId, setRemotePresenterId] = useState(null);
  const [pinnedId, setPinnedId] = useState(null); // jis tile pe click kiya

  // priority: screen share > pin
  const presenterId = isScreenSharing ? "local" : remotePresenterId || pinnedId;

  let [userMeetingName, setUserMeetingName] = useState(user?.fullName || "");
  let [meetingName, setMeetingName] = useState("Untitled");

  let [joinMeeting, setJoinMeeting] = useState(false);
  let [joinedMeetingName, setJoinedMeetingName] = useState("");

  const dbMeetingIdRef = useRef(null);
  const hasLeftRef = useRef(false);

  //userJoin and left notification
  let [notification, setNotification] = useState("");
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const togglePin = (id) => {
    if (isScreenSharing || remotePresenterId) return; // screen share chal rha ho to pin ignore
    setPinnedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (user?.fullName) {
      setUserMeetingName(user.fullName);
    }
  }, []);

  useEffect(() => {
    const meetingId = window.location.pathname.split("/").pop();
    const isExist = async () => {
      try {
        const response = await api.get("/meeting/isexist", {
          params: {
            meetingId: meetingId,
          },
        });
        //newMeeting -> false
        //existMeeting-> true
        setJoinMeeting(response.data.message.isExist);
        setJoinedMeetingName(response.data?.message?.title || " ");
      } catch (e) {
        console.log(e);
      }
    };

    isExist();
  });

  //----------------Get hardware permission-----------------------
  const getPermissions = async () => {
    try {
      // get camera and video access permission
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (userMediaStream) {
        //if already have any stream remove it first
        if (window.localStream) {
          window.localStream.getTracks().forEach((track) => track.stop());
        }

        window.localStream = userMediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
        }
      }
    } catch (e) {
      console.log("Permission denied or no device found: ", e);
    }
  };

  useEffect(() => {
    getPermissions();
    // 2. CLEANUP FUNCTION (Jab user back dabaye ya page chhode)
    return () => {
      // close camera and mic
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }

      // close web RTC PIP
      for (let id in connections) {
        connections[id].close();
        delete connections[id];
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  //----------------------manage audio and video on off using toggle button-----------------
  let getUserMedia = async () => {
    // Agar hardware access pehle mil chuka hai
    if (window.localStream) {
      // AUDIO LOGIC: Track ko delete mat karo, sirf enable/disable karo
      let audioTracks = window.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = audio;
      }

      // VIDEO LOGIC: Track ko delete mat karo, sirf enable/disable karo
      let videoTracks = window.localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = video;
      }
    }
  };

  useEffect(() => {
    //stop if page load frist time
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  //----------------------
  let gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);

    if (!connections[fromId]) return;

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let sendMessage = () => {
    if (message.trim() !== "") {
      //send message data and senderName to backend
      socketRef.current.emit("chat-message", message, userMeetingName);
      setMessage(""); //clear message box
    }
  };

  //----------------------screen share feature--------------------

  //stop screen share
  let stopScreenShare = async () => {
    //get camra track
    let cameraTrack = window.localStream.getVideoTracks()[0];

    //send camera track to each user
    for (let id in connections) {
      let sender = connections[id]
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender && cameraTrack) {
        sender.replaceTrack(cameraTrack).catch((e) => console.log(e));
      }
    }

    //share camera screen to mySelf
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = window.localStream;
    }
    setIsScreenSharing(false);
  };

  //Screen share On/Off function
  let handleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        // get screen
        let screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        window.screenStream = screenStream;
        let screenTrack = screenStream.getVideoTracks()[0];

        //share screen in place of video
        for (let id in connections) {
          let sender = connections[id]
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(screenTrack).catch((e) => console.log(e));
          }
        }

        //share my screen to mySelf
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        socket.emit("screen-share-status", { sharing: true });
        setIsScreenSharing(true);

        //stop screen share
        screenTrack.onended = () => {
          stopScreenShare();
          socket.emit("screen-share-status", { sharing: false });
        };
      } catch (e) {
        console.log("User cancelled screen share: ", e);
      }
    } else {
      stopScreenShare();
      socket.emit("screen-share-status", { sharing: false });
    }
  };

  //-------------------------connect to server ---------------
  let connectToSocketServer = () => {
    socketRef.current = socket; //context socket
    socketRef.current.on("signal", gotMessageFromServer);

    const joinAndSetupCall = async () => {
      let codeToJoin = window.location.pathname.split("/").pop();
      socketRef.current.emit("join-call", codeToJoin, userMeetingName);
      //update socketRefId
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", (data, sender, senderSocketId) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: sender, data: data, socketId: senderSocketId },
        ]);
      });

      //user-joined
      socketRef.current.on("user-joined", (id, allUsersData, clients) => {
        if (id !== socketIdRef.current) {
          let newUserName = allUsersData[id] || "Guest";
          setNotification(`${newUserName} joined the meeting`);
        }

        clients.forEach((socketListId) => {
          // BUG FIX 1: Apne khud ke ID ke sath connection mat banao
          if (socketListId === socketIdRef.current) return;

          // BUG FIX 2: Agar connection pehle se bana hua hai, toh usko over-write mat karo
          if (!connections[socketListId]) {
            connections[socketListId] = new RTCPeerConnection(
              peerConfigConnections,
            );

            connections[socketListId].onicecandidate = (event) => {
              if (event.candidate != null) {
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({ ice: event.candidate }),
                );
              }
            };

            connections[socketListId].onaddstream = (event) => {
              let currentUserName = allUsersData[socketListId] || "Guest";

              setVideos((videos) => {
                let videoExists = videos.find(
                  (video) => video.socketId === socketListId,
                );
                if (videoExists) {
                  return videos.map((video) =>
                    video.socketId === socketListId
                      ? {
                          ...video,
                          stream: event.stream,
                          name: currentUserName,
                        }
                      : video,
                  );
                } else {
                  let newVideo = {
                    socketId: socketListId,
                    stream: event.stream,
                    autoplay: true,
                    playsinline: true,
                    name: currentUserName,
                  };
                  return [...videos, newVideo];
                }
              });
            };

            if (window.screenStream && window.localStream) {
              let audioTrack = window.localStream.getAudioTracks()[0];
              let videoTrack = window.screenStream.getVideoTracks()[0];

              if (audioTrack && videoTrack) {
                let mixedStream = new MediaStream([audioTrack, videoTrack]);
                connections[socketListId].addStream(mixedStream);
              } else {
                connections[socketListId].addStream(window.screenStream);
              }
            } else if (window.localStream) {
              connections[socketListId].addStream(window.localStream);
            }
          }
        });

        // Sirf naya aane wala user sabko Offer bhejega
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });

      //screen share status
      socket.on("screen-share-status", ({ socketId, sharing }) => {
        setRemotePresenterId(sharing ? socketId : null);
      });

      //user-left
      socketRef.current.on("user-left", (id) => {
        setVideos((prevVideos) => {
          let leavingUser = prevVideos.find((v) => v.socketId === id);
          if (leavingUser) {
            setNotification(`${leavingUser.name} left the meeting`);
          }

          return prevVideos.filter((v) => v.socketId !== id);
        });

        setRemotePresenterId((prev) => (prev === id ? null : prev));
        setPinnedId((prev) => (prev === id ? null : prev));
      });
    };

    if (socketRef.current.connected) {
      // socket already connected
      joinAndSetupCall();
    } else {
      socketRef.current.connect();
      socketRef.current.on("connect", joinAndSetupCall);
    }
  };

  let getMedia = () => {
    connectToSocketServer();
  };

  useEffect(() => {
    if (
      askedForUsername === false &&
      localVideoRef.current &&
      window.localStream
    ) {
      localVideoRef.current.srcObject = window.localStream;
    }
  }, [askedForUsername]);

  const handleJoinNewMeetingBtn = async () => {
    console.log("working");
    //save meeting data in DB
    const meetingId = window.location.pathname.split("/").pop();
    //is new meeting
    if (!joinMeeting) {
      try {
        const response = await api.post("/meeting/create", {
          meetingId: meetingId,
          title: meetingName,
          hostId: user._id,
          scheduledAt: Date.now(),
          startAt: Date.now(),
          status: "live",
        });
      } catch (e) {
        console.log(e);
      }
    }

    //JoinMeeting
    try {
      //get meeting id
      const meetingData = await api.get("/meeting/isexist", {
        params: {
          meetingId: meetingId,
        },
      });

      dbMeetingIdRef.current = meetingData.data.message.id;

      const response = await api.post("/meeting/participant/join", {
        meetingId: meetingData.data.message.id,
        userId: user._id,
        sessions: [
          {
            joinAt: Date.now(),
          },
        ],
      });
    } catch (e) {
      console.log(e);
    }
    setAskedForUsername(false);
    getMedia();
  };

  const leaveMeetingAPI = () => {
    if (hasLeftRef.current) return;

    if (dbMeetingIdRef.current && user?._id) {
      hasLeftRef.current = true;

      const url = `${VITE_API_BASE_URL}/meeting/participant/leave`;
      const payload = JSON.stringify({
        meetingId: dbMeetingIdRef.current,
        userId: user._id,
        sessions: [
          {
            leftAt: Date.now(),
          },
        ],
      });

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
        keepalive: true,
      }).catch((e) => console.log("Leave API Error:", e));
    }
  };

  const handleEndCallMeetingBtn = async () => {
    const meetingId = window.location.pathname.split("/").pop();
    leaveMeetingAPI();
    navigate("/home");
  };

  useEffect(() => {
    // run when page refress or tab close
    const handleTabClose = () => {
      leaveMeetingAPI();
    };

    window.addEventListener("beforeunload", handleTabClose);

    //when user click on back button
    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
      leaveMeetingAPI();

      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }

      for (let id in connections) {
        connections[id].close();
      }
      connections = {};

      // 2. Socket disconnect aur clean karo
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off();
      }
    };
  }, [user]);

  return (
    <div>
      {askedForUsername === true ? (
        // preJoin view
        <div className={styles.preJoinContainer}>
          <div className={styles.preJoinHeading}>
            <h2 className={styles.heading}>Ready to join?</h2>
            <p className={styles.para}>
              Check your audio and video before entering the meeting
            </p>
          </div>

          <div className={styles.preJoinAction}>
            <div className={styles.preJoinPreview}>
              <div className={styles.statusRow}>
                <span
                  className={`${styles.badge} ${audio ? styles.badgeOn : styles.badgeOff}`}
                >
                  <i
                    className={`fa-solid ${audio ? "fa-microphone" : "fa-microphone-slash"}`}
                  ></i>
                  {audio ? "Mic on" : "Mic off"}
                </span>
                <span
                  className={`${styles.badge} ${video ? styles.badgeOn : styles.badgeOff}`}
                >
                  <i
                    className={`fa-solid ${video ? "fa-video" : "fa-video-slash"}`}
                  ></i>
                  {video ? "Camera on" : "Camera off"}
                </span>
              </div>

              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`${styles.previewVideo} ${!video ? styles.hidden : ""}`}
              ></video>

              {!video && (
                <div className={styles.avatarBox}>
                  <div className={styles.avatar}>
                    {(user?.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                  <h3 className={styles.avatarName}>
                    {user?.fullName || "Guest"}
                  </h3>
                  <p className={styles.avatarHint}>Camera is off</p>
                </div>
              )}

              <div className={styles.preJoinControls}>
                <button
                  className={`${styles.audioControl} ${!audio ? styles.off : ""}`}
                  onClick={() => setAudio(!audio)}
                >
                  <i
                    className={`fa-solid ${audio ? "fa-microphone" : "fa-microphone-slash"} ${audio ? styles.audioTrue : styles.audioFalse}`}
                  ></i>
                </button>
                <button
                  className={`${styles.videoControl} ${!video ? styles.off : ""}`}
                  onClick={() => setVideo(!video)}
                >
                  <i
                    className={`fa-solid ${video ? "fa-video" : "fa-video-slash"} ${video ? styles.videoTrue : styles.videoFalse}`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Form */}
            <div className={styles.preJoinForm}>
              <h2 className={styles.hedding}>Join meeting</h2>
              {joinMeeting == true ? (
                <div className="existedMeeting">
                  <p
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: "400",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: " #7d84a6",
                      margin: "0",
                    }}
                  >
                    Meeting name
                  </p>
                  <h1 style={{ fontSize: "1.5rem", padding: "0.5rem" }}>
                    {joinedMeetingName}
                  </h1>
                </div>
              ) : (
                <div className={styles.inputGroup}>
                  <label htmlFor="meetingName">Meeting Name</label>
                  <input
                    id="meetingName"
                    type="text"
                    value={meetingName}
                    onChange={(e) => {
                      setMeetingName(e.target.value);
                    }}
                    placeholder="Enter meeting name"
                  />
                </div>
              )}
              <div className={styles.inputGroup}>
                <label htmlFor="fullName">Your name</label>
                <input
                  id="fullName"
                  type="text"
                  value={userMeetingName}
                  onChange={(e) => {
                    setUserMeetingName(e.target.value);
                  }}
                  placeholder="Enter your name"
                />
              </div>

              <div className={styles.info}>
                <i className="fa-solid fa-user-group"></i>
                <p>
                  Other participants will see your name and camera. You can
                  change these after joining.
                </p>
              </div>

              <button
                className={styles.joinBtn}
                onClick={handleJoinNewMeetingBtn}
              >
                Join now <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        //postJoin View
        <div className="afterContainer">
          <div
            className={`${styles.conferenceView} ${presenterId ? styles.presenting : ""}`}
          >
            {/* Apna Video */}
            <div
              onClick={() => togglePin("local")}
              className={`${styles.videoWrapper}
      ${presenterId === "local" ? styles.presenterTile : ""}
      ${isScreenSharing ? styles.screenTile : ""}
      ${pinnedId === "local" ? styles.pinnedTile : ""}`}
            >
              <video
                className={`${styles.meetUserVideo} ${isScreenSharing ? styles.noMirror : ""}`}
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
              ></video>
              <span className={styles.pinHint}>
                <i className="fa-solid fa-thumbtack"></i>
              </span>
              <span className={styles.nameLabel}>
                {userMeetingName || ""} (You)
              </span>
            </div>

            {/* Dusre logo ka video */}
            {videos.map((video) => (
              <div
                key={video.socketId}
                onClick={() => togglePin(video.socketId)}
                className={`${styles.videoWrapper}
        ${presenterId === video.socketId ? styles.presenterTile : ""}
        ${remotePresenterId === video.socketId ? styles.screenTile : ""}
        ${pinnedId === video.socketId ? styles.pinnedTile : ""}`}
              >
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream && ref.srcObject !== video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                ></video>
                <span className={styles.pinHint}>
                  <i className="fa-solid fa-thumbtack"></i>
                </span>
                <span className={styles.nameLabel}>{video.name}</span>
              </div>
            ))}
          </div>

          {/* IN-CALL TEXT CHAT PANEL */}
          {isChatOpen && (
            <div className={styles.chatSidebar}>
              <div className={styles.chatHeader}>
                <h3>In-call Messages</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className={styles.closeChatBtn}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className={styles.chatArea}>
                {messages.map((msg, index) => {
                  let isMe = msg.socketId === socketIdRef.current;
                  return (
                    <div
                      key={index}
                      className={isMe ? styles.myMsgBox : styles.otherMsgBox}
                    >
                      <span className={styles.msgSender}>
                        {isMe ? "You" : msg.sender}
                      </span>
                      <div
                        className={
                          isMe ? styles.myMsgBubble : styles.otherMsgBubble
                        }
                      >
                        {msg.data}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.chatInputBox}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => (e.key === "Enter" ? sendMessage() : null)}
                />
                <button onClick={sendMessage}>
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATION POPUP */}
          {notification && (
            <div className={styles.notificationBadge}>{notification}</div>
          )}

          {/*  IN-CALL CONTROLS  */}
          <div className={styles.inCallControlsBar}>
            <button
              className={`${styles.audioControl} ${!audio ? styles.off : ""}`}
              onClick={() => setAudio(!audio)}
            >
              <i
                className={`fa-solid ${audio ? "fa-microphone" : "fa-microphone-slash"} ${audio ? styles.audioTrue : styles.audioFalse}`}
              ></i>
            </button>

            <button
              className={`${styles.videoControl} ${!video ? styles.off : ""}`}
              onClick={() => setVideo(!video)}
            >
              <i
                className={`fa-solid ${video ? "fa-video" : "fa-video-slash"} ${video ? styles.videoTrue : styles.videoFalse}`}
              ></i>
            </button>

            {/* Screen share button */}
            <button
              className={`${styles.videoControl} ${isScreenSharing ? styles.activeScreenShare : ""}`}
              onClick={handleScreenShare}
              title="Present Now"
            >
              <i
                className={`fa-solid ${isScreenSharing ? "fa-circle-stop" : "fa-display"}`}
                style={{ color: isScreenSharing ? "#ff4757" : "white" }}
              ></i>
            </button>

            {/* chat button */}
            <button
              className={`${styles.videoControl} ${isChatOpen ? styles.activeScreenShare : ""}`}
              onClick={() => setIsChatOpen(!isChatOpen)}
              title="Chat"
            >
              <i
                className="fa-solid fa-message"
                style={{ color: isChatOpen ? "#7c3aed" : "white" }}
              ></i>
            </button>

            {/* End Call Button */}
            <button
              className={styles.endCallBtn}
              onClick={handleEndCallMeetingBtn}
            >
              <i className="fa-solid fa-phone-slash"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeetingRoom;
