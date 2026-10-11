export const storageKey = 'veloop-game-account';

export const DEFAULT_ACCOUNT = {
  tokens: 200,
  gameCoins: 200,
  userInventory: { VEs: 10, SVEs: 5, Gems: 50, Tokens: 200, Spins: 2 },
  seenGuides: {},
  redemptionHistory: [],
  gameRecords: {}
};

export const getDefaultAccount = () => ({
  ...DEFAULT_ACCOUNT,
  userInventory: { ...DEFAULT_ACCOUNT.userInventory }
});

export const resetAccountToDefault = () => {
  const resetAccount = getDefaultAccount();

  try {
    localStorage.setItem(storageKey, JSON.stringify(resetAccount));
  } catch {
    // Ignore localStorage write failures and still return the reset state.
  }

  return resetAccount;
};

export const createInitialAccount = () => resetAccountToDefault();
