const app = require("./src/app");
const { connectDB } = require("./src/config/db");

const PORT = process.env.PORT || 8080;

// Connect to database
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
