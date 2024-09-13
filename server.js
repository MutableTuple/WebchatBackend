const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files (e.g., if you want to serve HTML, JS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Define a route for the root URL ("/")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Ensure you have an index.html in the public directory
});

// WebRTC signaling logic here
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", socket.id);
  });

  socket.on("signal", (data) => {
    const { peerId, signalData } = data;
    io.to(peerId).emit("signal", { peerId: socket.id, signalData });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    io.emit("user-disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
