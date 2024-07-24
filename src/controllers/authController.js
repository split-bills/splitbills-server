const pool = require("../config/db").pool;
const bcrypt = require("bcrypt");

const saltRounds = 10;

// All get requests
exports.check = (req, res) => {
  console.log("Check started...");
  if (req.session.userId) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
  console.log("Check completed..");
};

// All post requests
exports.signUp = async (req, res) => {
  console.log("SignUp Started...");
  const signUpDetails = req.body;
  console.log("Signup Details: ", signUpDetails);

  try {
    const client = await pool.connect();

    const checkResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [signUpDetails.email]
    );

    if (checkResult.rows.length > 0) {
      res.status(401).json({ message: "User already exists" });
    }

    // Password hashing
    bcrypt.hash(signUpDetails.password, saltRounds, async (err, hash) => {
      if (err) {
        console.error("Error hashing password: ", err);
        res.status(500).json({ message: "Internal server error" });
      }
      const result = await client.query(
        `INSERT INTO users (first_name, last_name, email, hashed_password)
      VALUES ($1, $2, $3, $4)`,
        [
          signUpDetails.firstName,
          signUpDetails.lastName,
          signUpDetails.email,
          hash,
        ]
      );
    });

    client.release();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("SignUp completed..");
  }
};

exports.login = async (req, res) => {
  console.log("Login started...");
  const loginDetails = req.body;
  console.log("Login details: ", loginDetails);

  try {
    const client = await pool.connect();

    const result = await client.query(
      "SELECT id, hashed_password, email FROM users WHERE email = $1",
      [loginDetails.email]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.hashed_password;
      bcrypt.compare(
        loginDetails.password,
        storedHashedPassword,
        (err, result) => {
          if (err) {
            console.error("Error comparing passwords: ", err);
          } else {
            if (result) {
              req.session.userId = user.id; // Store user ID in session
              console.log("Authenticated!!!");
              res.json({ authenticated: true });
            } else {
              console.log("Authentication failed!!!");
              res.json({ authenticated: false });
            }
          }
        }
      );
    }

    client.release();
  } catch (error) {
    console.error("Error retrieving data from database", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("Login completed..");
  }
};
