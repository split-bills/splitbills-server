const pool = require("../config/db").pool;

// All get requests

// Get user details
exports.getUserDetails = async (req, res) => {
  console.log("getUserDetails started");
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT first_name, last_name, email FROM users WHERE id = $1",
      [req.session.userId]
    );
    res.json(result.rows[0]);
    client.release();
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("getUserDetails completed");
  }
};

// All patch requests
exports.patchDetails = async (req, res) => {
  console.log("patchDetails started");
  try {
    const client = await pool.connect();
    const result = await client.query(
      "UPDATE users SET first_name = $1, last_name = $2, updated_at = $3 WHERE id = $4",
      [req.body.first_name, req.body.last_name, new Date(), req.session.userId]
    );
    res.json({ message: "Details updated successfully" });
    client.release();
  } catch (error) {
    console.error("Error updating data in database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("patchDetails completed");
  }
};
