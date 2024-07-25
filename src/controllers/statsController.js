const pool = require("../config/db").pool;
const aggregateAmountsByDate = require("../utils/aggregateAmounts");

// All get requests
exports.getExpenses = async (req, res) => {
  console.log("Get Expenses Started...");
  const userId = req.session.userId;
  console.log("User ID: ", userId);

  try {
    const client = await pool.connect();

    const incoming_result = await client.query(
      `SELECT created_at, amount FROM 
      expenses e join users u 
      on e.user_id = u.id WHERE u.id = $1 AND is_cleared = false`,
      [userId]
    );

    const outgoing_result = await client.query(
      `SELECT created_at, amount FROM 
      expenses e join users u 
      on e.other_user_id = u.id WHERE u.id = $1 AND is_cleared = false`,
      [userId]
    );

    client.release();

    const incoming_expenses = incoming_result.rows.map((expense) => ({
      ...expense,
      created_at: new Date(expense.created_at).toISOString().split("T")[0],
    }));
    const outgoing_expenses = outgoing_result.rows.map((expense) => ({
      ...expense,
      created_at: new Date(expense.created_at).toISOString().split("T")[0],
    }));

    incoming_expenses.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
    outgoing_expenses.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    const final_result = {
      incoming: aggregateAmountsByDate(incoming_expenses),
      outgoing: aggregateAmountsByDate(outgoing_expenses),
    };

    res.status(200).json(final_result);
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("Get Expenses completed..");
  }
};
