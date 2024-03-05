const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());

// connecting database
// mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.kfwmszy.mongodb.net/${process.env.DB_NAME}`, {

// connecting database
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.kfwmszy.mongodb.net/${process.env.DB_NAME}`, {
    useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('Database Connected'))
    .catch((err) => console.log(err))
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// mongoose
//   .connect(process.env.MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("DB Connetion Successfull");
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });

// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

const io = new socket(server, {
  cors: {
      origin: `${process.env.CLIENT_URL}`,
      methods: ['GET', 'POST']
  }
})

// const io = socket(server, {
//   cors: {
//     origin: "https://chatz-seven.vercel.app",
//     credentials: true,
//   },
// });

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
