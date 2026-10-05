import React, { useEffect, useState } from 'react';
import { createInitialAccount, storageKey } from './accountStorage';
import { GameCoinContext } from './useGameCoins';

export const GameCoinProvider = ({ children }) => {
  const [account, setAccount] = useState(createInitialAccount);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(account));
    } catch {
      return;
    }
  }, [account]);

  const setTokens = (value) => {
    setAccount((previous) => {
      const tokens = typeof value === 'function' ? value(previous.tokens) : value;
      return {
        ...previous,
        tokens,
        userInventory: { ...previous.userInventory, Tokens: tokens }
      };
    });
  };

  const deductTokens = (amount = 20) => {
    if (account.tokens >= amount) {
      setTokens((previous) => previous - amount);
      return true;
    }
    return false;
  };

  const addGameCoins = (amount) => {
    if (Number.isFinite(amount) && amount > 0) {
      setAccount((previous) => ({ ...previous, gameCoins: previous.gameCoins + amount }));
    }
  };

  const markGuideSeen = (gameId) => {
    setAccount((previous) => ({
      ...previous,
      seenGuides: { ...previous.seenGuides, [gameId]: true }
    }));
  };

  const redeemCurrency = (type, costInCoins, rewardAmount) => {
    if (account.gameCoins < costInCoins || !Object.hasOwn(account.userInventory, type)) return false;

    setAccount((previous) => ({
      ...previous,
      gameCoins: previous.gameCoins - costInCoins,
      tokens: type === 'Tokens' ? previous.tokens + rewardAmount : previous.tokens,
      userInventory: {
        ...previous.userInventory,
        [type]: previous.userInventory[type] + rewardAmount
      },
      redemptionHistory: [
        {
          id: `${Date.now()}-${type}`,
          type,
          cost: costInCoins,
          reward: rewardAmount,
          date: new Date().toISOString()
        },
        ...previous.redemptionHistory
      ].slice(0, 10)
    }));
    return true;
  };

  return (
    <GameCoinContext.Provider value={{ 
      tokens: account.tokens,
      setTokens,
      gameCoins: account.gameCoins,
      addGameCoins,
      userInventory: account.userInventory,
      deductTokens,
      redeemCurrency,
      seenGuides: account.seenGuides,
      markGuideSeen,
      redemptionHistory: account.redemptionHistory
    }}>
      {children}
    </GameCoinContext.Provider>
  );
};