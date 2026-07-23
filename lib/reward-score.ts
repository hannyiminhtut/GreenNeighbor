type RewardScoreRow = {
  userId: number;
  points: number;
};

export function calculateUserRewardScore(
  rewards: RewardScoreRow[],
  userId: number
): number {
  return rewards.reduce(
    (total, reward) =>
      reward.userId === userId ? total + (Number(reward.points) || 0) : total,
    0
  );
}
