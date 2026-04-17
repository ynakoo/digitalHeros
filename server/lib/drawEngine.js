/**
 * Draw Engine — Generates winning numbers and determines winners
 * Supports two modes: random and algorithmic (frequency-weighted)
 */

// Generate unique random numbers in range [1, 45]
function generateRandomNumbers(count = 5) {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// Algorithmic mode: weight by frequency (least frequent = higher chance)
function generateAlgorithmicNumbers(allScores, count = 5) {
  // Count frequency of each score value across all users
  const frequency = {};
  for (let i = 1; i <= 45; i++) frequency[i] = 0;

  allScores.forEach(s => {
    if (frequency[s.score] !== undefined) {
      frequency[s.score]++;
    }
  });

  // Invert frequencies — least common get highest weight
  const maxFreq = Math.max(...Object.values(frequency)) + 1;
  const weights = {};
  let totalWeight = 0;

  for (let i = 1; i <= 45; i++) {
    weights[i] = maxFreq - frequency[i];
    totalWeight += weights[i];
  }

  // Weighted random selection
  const selected = new Set();
  while (selected.size < count) {
    let rand = Math.random() * totalWeight;
    for (let i = 1; i <= 45; i++) {
      if (selected.has(i)) continue;
      rand -= weights[i];
      if (rand <= 0) {
        selected.add(i);
        totalWeight -= weights[i];
        break;
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

// Determine winners by comparing user scores against winning numbers
function determineWinners(winningNumbers, usersWithScores) {
  const winners = {
    match_5: [],
    match_4: [],
    match_3: []
  };

  usersWithScores.forEach(user => {
    const userScoreValues = user.scores.map(s => s.score);
    const matched = userScoreValues.filter(s => winningNumbers.includes(s));

    if (matched.length >= 5) {
      winners.match_5.push({ user_id: user.id, matched_numbers: matched.slice(0, 5), match_count: 5 });
    } else if (matched.length === 4) {
      winners.match_4.push({ user_id: user.id, matched_numbers: matched, match_count: 4 });
    } else if (matched.length === 3) {
      winners.match_3.push({ user_id: user.id, matched_numbers: matched, match_count: 3 });
    }
  });

  return winners;
}

module.exports = {
  generateRandomNumbers,
  generateAlgorithmicNumbers,
  determineWinners
};
