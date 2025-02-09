module.exports = (req, res) => {
  // Function to calculate the bill based on tiered pricing
  function calculateBill(units, tiers) {
    let totalCost = 0;
    let remainingUnits = units;
    let breakdown = [];

    // Loop through each tier to calculate cost
    for (let tier of tiers) {
      if (remainingUnits <= 0) {
        break;
      }

      const [tierUnits, price] = tier;

      // Calculate units for the current tier
      const currentUnits = Math.min(remainingUnits, tierUnits);
      const cost = currentUnits * price;
      totalCost += cost;

      // Add to breakdown
      breakdown.push([currentUnits, price, cost]);

      remainingUnits -= currentUnits;
    }

    // If there are remaining units beyond the tiers, calculate using the last tier price
    if (remainingUnits > 0) {
      const highestPrice = tiers[tiers.length - 1][1]; // Get the price of the last tier
      const cost = remainingUnits * highestPrice;
      totalCost += cost;
      breakdown.push([remainingUnits, highestPrice, cost]);
    }

    return [totalCost, breakdown];
  }

  // Extract query parameters
  const { lastReading, currentReading } = req.query;

  if (!lastReading || !currentReading) {
    return res.status(400).json({ error: 'Please provide both lastReading and currentReading.' });
  }

  const units = currentReading - lastReading;

  const tiers = [
    [50, 50],  // First 50 units at 50/unit
    [50, 100], // Next 50 units at 100/unit
    [100, 150] // Next 100 units at 150/unit
  ];

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
