const groupTransactions = (incoming, outgoing) => {
  const userMap = new Map();

  // Process incoming transactions
  incoming.forEach((transaction) => {
    const email = transaction.email;
    if (!userMap.has(email)) {
      userMap.set(email, {
        name: `${transaction.first_name} ${transaction.last_name}`,
        balance: 0,
        email: email,
        incoming_transactions: [],
        outgoing_transactions: [],
      });
    }
    const user = userMap.get(email);
    user.balance += parseFloat(transaction.amount);
    user.incoming_transactions.push(transaction);
  });

  // Process outgoing transactions
  outgoing.forEach((transaction) => {
    const email = transaction.email;
    if (!userMap.has(email)) {
      userMap.set(email, {
        name: `${transaction.first_name} ${transaction.last_name}`,
        balance: 0,
        email: email,
        incoming_transactions: [],
        outgoing_transactions: [],
      });
    }
    const user = userMap.get(email);
    user.balance -= parseFloat(transaction.amount);
    transaction.amount = -transaction.amount;
    user.outgoing_transactions.push(transaction);
  });

  // Convert the map to an array
  return Array.from(userMap.values());
};

module.exports = groupTransactions;
