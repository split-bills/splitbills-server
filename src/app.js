const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./config/db").pool;
require("dotenv").config();

// Import Routes
const homeRoutes = require("./routes/homeRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");
// const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust this to the origin of your frontend app
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ authenticated: false });
  }
}

// Routes
app.use("/home", isAuthenticated, homeRoutes); // Protecting the home route
app.use("/events", isAuthenticated, eventsRoutes); // Protecting the events route
app.use("/profile", isAuthenticated, profileRoutes); // Protecting the profile route
app.use("/auth", authRoutes);

module.exports = app;
