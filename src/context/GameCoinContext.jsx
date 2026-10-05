import React, { useEffect, useRef, useState } from 'react';
import { createInitialAccount, storageKey } from './accountStorage';
import { GameCoinContext } from './useGameCoins';

export const GameCoinProvider = ({ children }) => {
  const [account, setAccount] = useState(createInitialAccount);
  const accountRef = useRef(account);

  const updateAccount = (update) => {
    const nextAccount = update(accountRef.current);
    accountRef.current = nextAccount;
    setAccount(nextAccount);
    return nextAccount;
  };

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(account));
    } catch {
      return;
    }
  }, [account]);

  const setTokens = (value) => {
    updateAccount((previous) => {
      const tokens = typeof value === 'function' ? value(previous.tokens) : value;
      return {
        ...previous,
        tokens,
        userInventory: { ...previous.userInventory, Tokens: tokens }
      };
    });
  };

  const deductTokens = (amount = 20) => {
    if (!Number.isFinite(amount) || amount <= 0) return false;
    let deducted = false;
    updateAccount((previous) => {
      if (previous.tokens < amount) return previous;
      deducted = true;
      const tokens = previous.tokens - amount;
      return {
        ...previous,
        tokens,
        userInventory: { ...previous.userInventory, Tokens: tokens }
      };
    });
    return deducted;
  };

  const addGameCoins = (amount) => {
    if (Number.isFinite(amount) && amount > 0) {
      updateAccount((previous) => ({ ...previous, gameCoins: previous.gameCoins + amount }));
    }
  };

  const recordGameRound = (gameId, score, reward) => {
    if (typeof gameId !== 'string' || !gameId
      || !Number.isFinite(score) || score < 0
      || !Number.isFinite(reward) || reward < 0) return false;
    updateAccount((previous) => {
      const currentRecord = previous.gameRecords[gameId] || { bestScore: 0, roundsPlayed: 0 };
      return {
        ...previous,
        gameCoins: previous.gameCoins + reward,
        gameRecords: {
          ...previous.gameRecords,
          [gameId]: {
            bestScore: Math.max(currentRecord.bestScore, score),
            roundsPlayed: currentRecord.roundsPlayed + 1
          }
        }
      };
    });
    return true;
  };

  const markGuideSeen = (gameId) => {
    updateAccount((previous) => ({
      ...previous,
      seenGuides: { ...previous.seenGuides, [gameId]: true }
    }));
  };

  const redeemCurrency = (type, costInCoins, rewardAmount) => {
    if (!Number.isFinite(costInCoins) || costInCoins <= 0
      || !Number.isFinite(rewardAmount) || rewardAmount <= 0) return false;
    let redeemed = false;
    updateAccount((previous) => {
      if (previous.gameCoins < costInCoins || !Object.hasOwn(previous.userInventory, type)) return previous;
      redeemed = true;
      const tokens = type === 'Tokens' ? previous.tokens + rewardAmount : previous.tokens;
      return {
        ...previous,
        gameCoins: previous.gameCoins - costInCoins,
        tokens,
        userInventory: {
          ...previous.userInventory,
          [type]: previous.userInventory[type] + rewardAmount,
          Tokens: tokens
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
      };
    });
    return redeemed;
  };

  return (
    <GameCoinContext.Provider value={{ 
      tokens: account.tokens,
      setTokens,
      gameCoins: account.gameCoins,
      addGameCoins,
      gameRecords: account.gameRecords,
      recordGameRound,
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