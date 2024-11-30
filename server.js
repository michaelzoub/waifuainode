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
  "#FF6EC7", 
  "#39FF14",
  "#FFDF00", 
  "#FF073A", 
  "#00FFFF", 
  "#FF9933",
  "#9400D3", 
  "#7DF9FF", 
  "#FBEC5D", 
  "#FE59C2"  
];


const corsOptions = {
  origin: ['https://waifuai-olive.vercel.app', "http://localhost:3000", "https://www.asuna.chat"],  
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true, 
}

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: ["https://waifuai-olive.vercel.app", "http://localhost:3000", "https://www.asuna.chat"], 
    methods: ["GET", "POST"],        
    allowedHeaders: ["Content-Type"], 
  }
});

const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err)
  });

const waifuNumber = Math.floor(Math.random() * 50)
const colorNumber = Math.floor(Math.random() * 10)

const messageSchema = new mongoose.Schema({
  text: String,
  timestamp: { type: Number, default: Date.now }, 
  name: {type: String, 
    default: function() {
      return waifuNames[waifuNumber]; 
    }},
  color: {type: String, 
    default: function() {
      return neonColors[colorNumber]
    }}
})

const Message = mongoose.model("memecoin.delete after sunday", messageSchema)

const activeConnections = new Set()

io.on("connection", (socket) => {

  activeConnections.add(socket.id)

  io.emit("viewerCount", viewerCount)

  socket.on("message", async (msg) => {
    try {
      await Message.create(msg)
      io.emit("message", msg)     
    } catch (error) {
      console.error("Error saving message:", error)
    }
  })

  socket.on("loadMessages", async () => {
    try {
      const messages = await Message.find().sort({ timestamp: -1 }).limit(50)
      socket.emit("loadMessages", messages); 
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  })

  socket.on("username", async (sub) => {
    try {
      io.emit("username", sub)
    } catch (error) {
      console.error("Error emitting sub: ", error)
    }
  })

  socket.on("disconnect", () => {
    console.log("User disconnected")
    viewerCount--
  });
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});