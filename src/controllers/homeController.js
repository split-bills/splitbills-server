const pool = require("../config/db").pool;
const groupTransactions = require("../utils/groupTransactions");

// All get requests

// Get user by email
exports.getFirstName = async (req, res) => {
  console.log("getFirstName started");
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT first_name FROM users WHERE id = $1",
      [req.session.userId]
    );
    res.json(result.rows[0]);
    client.release();
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("getFirstName completed");
  }
};

// Get user balances
exports.getBalance = async (req, res) => {
  console.log("getBalance started");
  try {
    const client = await pool.connect();
    // get the user id
    // const user_data = await client.query("SELECT id FROM users WHERE id = $1", [
    //   req.session.userId,
    // ]);
    // if (user_data.rows.length === 0) {
    //   return res.status(404).json({ message: "User not found" });
    // }
    const incoming = await client.query(
      `SELECT COALESCE(SUM(amount), 0) as incoming_balance FROM expenses WHERE
      user_id = $1 AND is_cleared = false AND amount > 0;
      `,
      [req.session.userId]
    );
    const outgoing = await client.query(
      `SELECT COALESCE(SUM(amount), 0) as outgoing_balance FROM expenses WHERE
      other_user_id = $1 AND is_cleared = false AND amount > 0;
      `,
      [req.session.userId]
    );
    res.json({
      incoming: incoming.rows[0].incoming_balance,
      outgoing: outgoing.rows[0].outgoing_balance,
    });
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("getBalance completed");
  }
};

// Get user transactions
exports.getTransactions = async (req, res) => {
  console.log("getTransactions started");
  try {
    const client = await pool.connect();

    // Get incoming transactions
    const incoming_transactions = await client.query(
      `SELECT e.id, e.amount, e.reason, e.created_at, 
              u.first_name, u.last_name, u.email 
       FROM expenses e
       JOIN users u ON e.other_user_id = u.id
       WHERE e.user_id = $1 AND e.is_cleared = false AND e.amount > 0;`,
      [req.session.userId]
    );

    // Get outgoing transactions
    const outgoing_transactions = await client.query(
      `SELECT e.id, e.amount, e.reason, e.created_at, 
              u.first_name, u.last_name, u.email 
       FROM expenses e
       JOIN users u ON e.user_id = u.id
       WHERE e.other_user_id = $1 AND e.is_cleared = false AND e.amount > 0;`,
      [req.session.userId]
    );

    // Create the final array
    const final_array = await groupTransactions(
      incoming_transactions.rows,
      outgoing_transactions.rows
    );

    // console.log(final_array[0]);
    console.log(final_array[0].incoming_transactions);

    res.json(final_array);

    client.release();
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("getTransactions completed");
  }
};

// All post requests

// Post transaction
exports.postTransaction = async (req, res) => {
  console.log("postTransaction started");
  try {
    const client = await pool.connect();
    const user_data = await client.query(
      "SELECT email from users WHERE id = $1",
      [req.session.userId]
    );

    let userEmail, friendEmail;
    if (req.body.type === "Incoming") {
      userEmail = user_data.rows[0].email;
      friendEmail = req.body.friendEmail;
    } else {
      userEmail = req.body.friendEmail;
      friendEmail = user_data.rows[0].email;
    }
    const reason = req.body.reason;
    const amount = req.body.amount;

    const result_ = await client.query("SELECT * FROM users WHERE email = $1", [
      req.body.friendEmail,
    ]);
    if (result_.rows.length === 0) {
      res.status(400).json({ message: "User not found" });
      client.release();
      return;
    }

    console.dir({
      userEmail: userEmail,
      friendEmail: friendEmail,
      reason: reason,
      amount: amount,
    });

    const result = await client.query(
      `INSERT INTO expenses (user_id, other_user_id, event_id, reason, amount, is_cleared, created_at)
        VALUES (
                  (SELECT id FROM users WHERE email = $1),
                  (SELECT id FROM users WHERE email = $2),
                  NULL, $3, $4, false, NOW()
              );
      `,
      [userEmail, friendEmail, reason, amount]
    );
    res.sendStatus(200);
    client.release();
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("postTransaction completed");
  }
};

// All patch requests

// Clear transaction
exports.clearTransaction = async (req, res) => {
  console.log("clearTransaction started");
  try {
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE expenses SET is_cleared = true WHERE id = $1;`,
      [req.body.expenses_id]
    );
    res.sendStatus(200);
    client.release();
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("clearTransaction completed");
  }
};
