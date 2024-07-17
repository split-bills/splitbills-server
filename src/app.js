const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import Routes
const homeRoutes = require("./routes/homeRoutes");
// const eventRoutes = require('./routes/eventRoutes');
// const statsRoutes = require('./routes/statsRoutes');
// const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parse application/json requests as well

// Routes
app.use("/", homeRoutes);
// app.use('/events', eventRoutes);
// app.use('/stats', statsRoutes);
// app.use('/profile', profileRoutes);

module.exports = app;
