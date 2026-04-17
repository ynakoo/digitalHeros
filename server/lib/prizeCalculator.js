/**
 * Prize Calculator
 * Pool contribution: $2 per active subscriber
 * Distribution:
 *   5-Number Match: 40% (jackpot, rolls over if unclaimed)
 *   4-Number Match: 35%
 *   3-Number Match: 25%
 * Prizes split equally among winners per tier
 */

const POOL_CONTRIBUTION_PER_SUBSCRIBER = 2.00;

const POOL_DISTRIBUTION = {
  match_5: 0.40,
  match_4: 0.35,
  match_3: 0.25
};

function calculatePrizePool(activeSubscriberCount, jackpotRollover = 0) {
  const totalPool = activeSubscriberCount * POOL_CONTRIBUTION_PER_SUBSCRIBER;

  const match5Pool = (totalPool * POOL_DISTRIBUTION.match_5) + jackpotRollover;
  const match4Pool = totalPool * POOL_DISTRIBUTION.match_4;
  const match3Pool = totalPool * POOL_DISTRIBUTION.match_3;

  return {
    totalPool,
    match_5_pool: parseFloat(match5Pool.toFixed(2)),
    match_4_pool: parseFloat(match4Pool.toFixed(2)),
    match_3_pool: parseFloat(match3Pool.toFixed(2)),
    jackpot_carried: jackpotRollover
  };
}

function calculatePrizes(prizePool, winners) {
  const results = [];
  let newJackpotRollover = 0;

  // 5-match prizes
  if (winners.match_5.length > 0) {
    const prizePerWinner = parseFloat((prizePool.match_5_pool / winners.match_5.length).toFixed(2));
    winners.match_5.forEach(w => {
      results.push({ ...w, match_type: 'match_5', prize_amount: prizePerWinner });
    });
  } else {
    // Jackpot rolls over
    newJackpotRollover = prizePool.match_5_pool;
  }

  // 4-match prizes
  if (winners.match_4.length > 0) {
    const prizePerWinner = parseFloat((prizePool.match_4_pool / winners.match_4.length).toFixed(2));
    winners.match_4.forEach(w => {
      results.push({ ...w, match_type: 'match_4', prize_amount: prizePerWinner });
    });
  }

  // 3-match prizes
  if (winners.match_3.length > 0) {
    const prizePerWinner = parseFloat((prizePool.match_3_pool / winners.match_3.length).toFixed(2));
    winners.match_3.forEach(w => {
      results.push({ ...w, match_type: 'match_3', prize_amount: prizePerWinner });
    });
  }

  return { results, newJackpotRollover };
}

module.exports = {
  POOL_CONTRIBUTION_PER_SUBSCRIBER,
  POOL_DISTRIBUTION,
  calculatePrizePool,
  calculatePrizes
};
