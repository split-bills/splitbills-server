function optimizeTransactions(participants, expenses, paid) {
  const n = participants.length;
  const netBalances = new Array(n).fill(0);

  // Step 1: Calculate net balances
  for (let i = 0; i < n; i++) {
    netBalances[i] = paid[i] - expenses[i];
  }

  // Step 2: Sort participants by net balance
  const balances = netBalances.map((balance, index) => ({
    participant: participants[index],
    balance,
  }));
  balances.sort((a, b) => a.balance - b.balance);

  // Step 3: Minimize transactions
  const transactions = [];
  let i = 0;
  let j = balances.length - 1;

  while (i < j) {
    const debtor = balances[i];
    const creditor = balances[j];

    const amount = Math.min(-debtor.balance, creditor.balance);
    debtor.balance += amount;
    creditor.balance -= amount;

    transactions.push({
      from: debtor.participant,
      to: creditor.participant,
      amount: amount.toFixed(2),
    });

    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j--;
  }

  return transactions;
}

module.exports = optimizeTransactions;
