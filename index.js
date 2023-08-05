const express = require("express");
const path = require("path");
const homeRouter = require("./routes/homeRoutes");
const { createServer } = require("http");
const { Server } = require("socket.io");
// const { v4: uuidv4 } = require("uuid");
const {
  users,
  userJoined,
  getUser,
  deleteUser,
  usersInRoom,
} = require("./users");

const app = express();
const PORT = 8002;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static(path.resolve("public")));
app.use(express.urlencoded({ extended: false }));

app.use("/", homeRouter);

var server = createServer(app);
var io = new Server(server);

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const user = userJoined(socket.id, data.name, data.room);
    socket.join(user.room);
    const count = usersInRoom(data.room);

    io.to(user.room).emit("update-people", count);
    socket.broadcast.to(user.room).emit("user-joined", { name: user.name });
  });
  socket.on("user-message", (message) => {
    const user = getUser(socket.id);
    socket.broadcast.to(user.room).emit("user-sent-message", {
      message,
      name: user.name,
    });
  });

  socket.on("user-typing", (name) => {
    const user = getUser(socket.id);
    socket.broadcast.to(user.room).emit("user-is-typing", name);
  });

  socket.on("user-stopped-typing", (name) => {
    const user = getUser(socket.id);
    socket.broadcast.to(user.room).emit("user-stopped-typing", name);
  });

  socket.on("disconnect", (message) => {
    const user = getUser(socket.id);
    if (user) {
      const room = user.room;
      const count = usersInRoom(room);
      socket.broadcast
        .to(user.room)
        .emit(`left`, { name: user.name, count: count - 1 });
      deleteUser(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log("Server started on port: " + PORT);
});
