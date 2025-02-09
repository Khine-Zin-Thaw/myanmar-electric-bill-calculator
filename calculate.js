// api/calculateBill.js

module.exports = (req, res) => {
  // Extract query parameters
  const { lastReading, currentReading } = req.query;

  // Validation
  if (!lastReading || !currentReading) {
    return res.status(400).json({ error: 'Please provide both lastReading and currentReading.' });
  }

  const units = parseFloat(currentReading) - parseFloat(lastReading);

  const tiers = [
    [50, 50],  // First 50 units at 50/unit
    [50, 100], // Next 50 units at 100/unit
    [100, 150] // Next 100 units at 150/unit
  ];

  // Function to calculate the bill
  function calculateBill(units, tiers) {
    let totalCost = 0;
    let remainingUnits = units;
    let breakdown = [];

    for (let tier of tiers) {
      if (remainingUnits <= 0) {
        break;
      }

      const [tierUnits, price] = tier;

      const currentUnits = Math.min(remainingUnits, tierUnits);
      const cost = currentUnits * price;
      totalCost += cost;

      breakdown.push([currentUnits, price, cost]);
      remainingUnits -= currentUnits;
    }

    if (remainingUnits > 0) {
      const highestPrice = tiers[tiers.length - 1][1];
      const cost = remainingUnits * highestPrice;
      totalCost += cost;
      breakdown.push([remainingUnits, highestPrice, cost]);
    }

    return [totalCost, breakdown];
  }

  // Calculate the bill
  const [totalCost, breakdown] = calculateBill(units, tiers);

  // Return the result as a JSON response
  res.status(200).json({
    lastReading,
    currentReading,
    breakdown,
    totalUnits: units,
    totalCost
  });
};
