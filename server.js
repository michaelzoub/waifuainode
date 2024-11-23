const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// Configure CORS to allow requests from localhost:3000
const io = new Server(server, {
  cors: {
    origin: ["https://waifuai-olive.vercel.app/", "localhost:3000"],  // Allow only requests from this origin
    methods: ["GET", "POST"],        // Specify allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Allowed headers
  }
});

const mongoURI = process.env.MONGO_URI

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Define the Message schema
const messageSchema = new mongoose.Schema({
  text: String,
  timestamp: { type: Number, default: Date.now }, // Use current timestamp by default
});

// Define the Message model
const Message = mongoose.model("memecoin.delete after sunday", messageSchema);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Save incoming messages
  socket.on("message", async (msg) => {
    try {
      await Message.create(msg);  // Save message to MongoDB
      io.emit("message", msg);     // Broadcast message to all clients
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Load previous messages on connection
  socket.on("loadMessages", async () => {
    try {
      const messages = await Message.find(); // Retrieve all previous messages from MongoDB
      socket.emit("loadMessages", messages); // Send the messages back to the client
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  });

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server on port 3001
server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});