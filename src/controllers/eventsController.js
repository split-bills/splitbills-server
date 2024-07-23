const pool = require("../config/db").pool;
const optimizeTransactions = require("../utils/optimizeTransactions");

// All get requests

// Get names from emails
exports.getNames = async (req, res) => {
  console.log("getNames from emails started..");
  try {
    const emails = req.query.emails;
    console.log("emails: ", emails);
    const client = await pool.connect();
    let userNames = [];
    for (let i = 0; i < emails.length; i++) {
      const result = await client.query(
        "SELECT first_name, last_name FROM users WHERE email = $1",
        [emails[i]]
      );
      const full_name =
        result.rows[0].first_name + " " + result.rows[0].last_name;
      userNames.push(full_name);
    }
    client.release();
    console.log("userNames: ", userNames);
    res.json({ names: userNames });
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("getNames from emails completed..");
  }
};

// Get all events you are involved in
exports.getEvents = async (req, res) => {
  console.log("getEvents started..");
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT e.name, e.date
      FROM events e
      JOIN eventpayments ep ON e.id = ep.event_id
      JOIN users u ON ep.user_id = u.id
      WHERE u.id = $1`,
      [req.session.userId]
    );
    const events = result.rows;
    client.release();
    console.log("events: ", events);
    res.json({ events: events });
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("getEvents completed..");
  }
};

// get the user email
exports.getEmail = async (req, res) => {
  console.log("getEmail started..");
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT email FROM users WHERE id = $1", [
      req.session.userId,
    ]);
    const email = result.rows[0].email;
    client.release();
    console.log("email: ", email);
    res.json({ email: email });
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("getEmail completed..");
  }
};

// All post requests

// post a new event
exports.postEvent = async (req, res) => {
  console.log("postEvent started..");
  try {
    const event = req.body;
    console.log("event: ", event);
    const minimized = optimizeTransactions(
      event.participants,
      event.expenses,
      event.paidAmounts
    );
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO events (name, date, owner_user_id)
      VALUES ($1, $2, $3
      ) RETURNING id`,
      [event.name, event.date, req.session.userId]
    );
    const eventId = result.rows[0].id;
    console.log("eventId: ", eventId);

    for (let i = 0; i < event.participants.length; i++) {
      await client.query(
        `INSERT INTO eventpayments (event_id, user_id, spent, paid)
        VALUES ($1,
          (SELECT id FROM users WHERE email = $2),
            $3, $4)`,
        [
          eventId,
          event.participants[i],
          event.expenses[i],
          event.paidAmounts[i],
        ]
      );
    }

    for (let i = 0; i < minimized.length; i++) {
      await client.query(
        `INSERT INTO expenses (user_id, other_user_id, event_id, reason, amount)
        VALUES (
          (SELECT id FROM users WHERE email = $1),
          (SELECT id FROM users WHERE email = $2),
          $3, $4, $5)`,
        [
          minimized[i].from,
          minimized[i].to,
          eventId,
          event.name,
          minimized[i].amount,
        ]
      );
    }

    client.release();
    res.json({ message: "Event created successfully" });
  } catch {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("postEvent completed..");
  }
};
