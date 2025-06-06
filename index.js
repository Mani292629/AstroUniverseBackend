const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;

// Local modules
const dbConnect = require("./config/Database");
const cloudinary = require("./config/cloudinary");

const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const astrologerRouter = require("./routes/astrologerRoutes");
const resetRouter = require("./routes/ResetOtp");
const paymentRouter = require("./routes/Payment");
const messageRouter = require("./routes/MessageRoutes");

// Init Express app
const app = express();

// Middleware
// app.use(cors({
//   origin: 'http://localhost:3000', // Adjust frontend origin as needed
//   credentials: true
// }));


app.use(cors({
  origin: 'https://astrouniverse-frontend.vercel.app', // React app origin
  credentials: true,               // Needed if using cookies, sessions, etc.
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));    // Parse incoming JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// DB & Cloudinary
dbConnect();
cloudinary();


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://astrouniverse-frontend.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// API Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/astrologer", astrologerRouter);
app.use("/api/reset-password", resetRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/message", messageRouter);

app.get("/", (req, res) => {
  res.send(`<h1>This is homepage</h1>`);
});

// Create HTTP server for both Express & Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://astrouniverse-frontend.vercel.app',
    methods: ['GET', 'POST']
  }
});

// Socket.IO basic connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', (data) => {
    io.emit('receiveMessage', data); // broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
