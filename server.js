const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

 const waifuNames = [
  "Akiyama Rika", "Takahashi Yumi", "Fujimoto Haruka", "Hoshino Mei", "Sakamoto Rina",
  "Matsuda Akari", "Tanaka Nao", "Yamashita Sakura", "Hirano Ami", "Suzuki Eri",
  "Ogawa Yuna", "Ito Nana", "Kobayashi Sora", "Shimizu Rei", "Yamaguchi Kaho",
  "Kaneko Aoi", "Nishida Miku", "Moriyama Chiyo", "Kondo Sayaka", "Okada Hina",
  "Hashimoto Mayu", "Kurata Kaede", "Nakamura Mio", "Shiraishi Sana", "Hamada Nozomi",
  "Ishikawa Riko", "Oda Arisa", "Kawai Chiho", "Matsui Hinata", "Tsubaki Yume",
  "Saeki Koharu", "Kitagawa Asuka", "Takeda Rin", "Uchida Hana", "Nakagawa Emi",
  "Saito Rumi", "Tsuchiya Eriko", "Murakami Kira", "Kawakami Yui", "Fujisawa Rio",
  "Yoshikawa Yuki", "Oshima Ayaka", "Shibata Saya", "Aoyama Yuri", "Takahata Fumi",
  "Kikuchi Ami", "Nagase Yuka", "Hoshikawa Tomoka", "Tsukamoto Anzu", "Endo Mio"
];

 const neonColors = [
  "#FF6EC7", // Neon Pink
  "#39FF14", // Neon Green
  "#FFDF00", // Neon Yellow
  "#FF073A", // Neon Red
  "#00FFFF", // Neon Cyan
  "#FF9933", // Neon Orange
  "#9400D3", // Neon Purple
  "#7DF9FF", // Neon Sky Blue
  "#FBEC5D", // Neon Gold
  "#FE59C2"  // Neon Magenta
];


const corsOptions = {
  origin: ['https://waifuai-olive.vercel.app', "http://localhost:3000", "https://www.asuna.chat"],  // Replace with your Vercel app URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true, // Allow cookies if needed
};

app.use(cors(corsOptions));

// Configure CORS to allow requests from localhost:3000
const io = new Server(server, {
  cors: {
    origin: ["https://waifuai-olive.vercel.app", "http://localhost:3000", "https://www.asuna.chat"],  // Allow only requests from this origin
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

//random number between 0-50
const waifuNumber = Math.floor(Math.random() * 50)
const colorNumber = Math.floor(Math.random() * 10)

// Define the Message schema
const messageSchema = new mongoose.Schema({
  text: String,
  timestamp: { type: Number, default: Date.now }, // Use current timestamp by default
  name: {type: String, 
    default: function() {
      return waifuNames[waifuNumber]; // Use a function for dynamic default
    }},
  color: {type: String, 
    default: function() {
      return neonColors[colorNumber]; // Use a function for dynamic default
    }}
});

// Define the Message model
const Message = mongoose.model("memecoin.delete after sunday", messageSchema);

io.on("connection", (socket) => {

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
