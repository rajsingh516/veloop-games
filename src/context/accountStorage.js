export const storageKey = 'veloop-game-account';

export const createInitialAccount = () => {
  const fallback = {
    tokens: 150,
    gameCoins: 40,
    userInventory: { VEs: 10, SVEs: 5, Gems: 50, Tokens: 150, Spins: 2 },
    seenGuides: {},
    redemptionHistory: []
  };

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved) return fallback;
    const tokens = saved.tokens ?? fallback.tokens;

    return {
      ...fallback,
      ...saved,
      tokens,
      userInventory: { ...fallback.userInventory, ...saved.userInventory, Tokens: tokens },
      seenGuides: saved.seenGuides || {},
      redemptionHistory: saved.redemptionHistory || []
    };
  } catch {
    return fallback;
  }
};
