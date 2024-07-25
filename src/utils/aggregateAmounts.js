const aggregateAmountsByDate = (expenses) => {
  const dateMap = {};

  expenses.forEach(({ created_at, amount }) => {
    if (dateMap[created_at]) {
      dateMap[created_at] += parseFloat(amount);
    } else {
      dateMap[created_at] = parseFloat(amount);
    }
  });

  return Object.keys(dateMap).map((date) => ({
    date,
    amount: dateMap[date].toFixed(2),
  }));
};

module.exports = aggregateAmountsByDate;
