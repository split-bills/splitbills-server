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
// const statsRoutes = require('./routes/statsRoutes');
// const profileRoutes = require('./routes/profileRoutes');

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
app.use("/home", isAuthenticated, homeRoutes);
app.use("/events", isAuthenticated, eventsRoutes); // Protecting the events route

app.post("/signup", async (req, res) => {
  console.log("SignUp Started...");
  try {
    const signUpDetails = req.body;
    console.log("Signup Details: ", signUpDetails);
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO users (first_name, last_name, email, hashed_password)
      VALUES ($1, $2, $3, $4) RETURNING user_id`,
      [
        signUpDetails.firstName,
        signUpDetails.lastName,
        signUpDetails.email,
        signUpDetails.password,
      ]
    );
    client.release();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("SignUp completed..");
  }
});

app.post("/login", async (req, res) => {
  console.log("Login started...");
  try {
    const loginDetails = req.body;
    console.log("Login details: ", loginDetails);
    const client = await pool.connect();
    const result = await client.query(
      "SELECT id, hashed_password, email FROM users WHERE email = $1",
      [loginDetails.email]
    );

    if (
      result.rows.length > 0 &&
      result.rows[0].hashed_password === loginDetails.password
    ) {
      req.session.userId = result.rows[0].id; // Store user ID in session
      console.log("Authenticated!!!");
      res.json({ authenticated: true });
    } else {
      console.log("Authentication failed!!!");
      res.json({ authenticated: false });
    }
    client.release();
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("Login completed..");
  }
});

module.exports = app;
