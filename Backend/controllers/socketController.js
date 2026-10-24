import { Server } from "socket.io";
import meetingsModel from "../models/meetingsModel.js";
let connections = {};
let messages = {};
let timeOnline = {};
let userNames = {};
let presenters = {}; // { roomPath: socketId of the person presenting }
let emptyRoomTimeouts = {};

// socket ka room (path) dhundo
const getRoomOf = (socketId) =>
  Object.keys(connections).find((room) => connections[room].includes(socketId));

const connectToServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    //join call
    socket.on("join-call", (path, userMeetingName) => {
      //cancle timer
      if (emptyRoomTimeouts[path]) {
        clearTimeout(emptyRoomTimeouts[path]);
        delete emptyRoomTimeouts[path];
        console.log(`Meeting ${path} resumed. Auto-complete cancelled.`);
      }

      if (connections[path] === undefined) {
        connections[path] = [];
      }

      connections[path].push(socket.id);
      userNames[socket.id] = userMeetingName || "Guest";

      timeOnline[socket.id] = new Date();

      //send message to each user
      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          userNames,
          connections[path],
        );
      }

      //naya user aaye aur koi pehle se present kar raha ho to usko bata do
      if (presenters[path]) {
        io.to(socket.id).emit("screen-share-status", {
          socketId: presenters[path],
          sharing: true,
        });
      }

      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; ++a) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"],
          );
        }
      }
    });

    //signal
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    //screen share status
    socket.on("screen-share-status", ({ sharing }) => {
      const roomId = getRoomOf(socket.id);
      if (!roomId) return;

      if (sharing) {
        presenters[roomId] = socket.id;
      } else if (presenters[roomId] === socket.id) {
        delete presenters[roomId];
      }

      connections[roomId].forEach((id) => {
        if (id !== socket.id) {
          io.to(id).emit("screen-share-status", {
            socketId: socket.id,
            sharing,
          });
        }
      });
    });

    //chat messages
    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }

          return [room, isFound];
        },
        ["", false],
      );

      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    //user left
    socket.on("disconnect", async () => {
      var key;

      for (const [k, v] of JSON.parse(
        JSON.stringify(Object.entries(connections)),
      )) {
        for (let a = 0; a < v.length; ++a) {
          if (v[a] === socket.id) {
            key = k;

            for (let a = 0; a < connections[key].length; ++a) {
              io.to(connections[key][a]).emit("user-left", socket.id);
            }

            var index = connections[key].indexOf(socket.id);

            connections[key].splice(index, 1);
            delete userNames[socket.id];

            if (presenters[key] === socket.id) {
              delete presenters[key];
            }

            if (connections[key].length === 0) {
              delete connections[key];
              delete presenters[key];

              const waitTime = 5 * 60 * 1000;
              const actualEndTime = Date.now();

              emptyRoomTimeouts[key] = setTimeout(async () => {
                if (!connections[key] || connections[key].length === 0) {
                  try {
                    await meetingsModel.findOneAndUpdate(
                      { meetingId: key, status: "live" },
                      {
                        status: "completed",
                        endAt: actualEndTime,
                      },
                    );
                  } catch (err) {
                    console.log("Error Auto-Completing Meeting DB:", err);
                  }
                }

                delete emptyRoomTimeouts[key];
              }, waitTime);
            }
          }
        }
      }
    });
  });

  return io;
};

export default connectToServer;
