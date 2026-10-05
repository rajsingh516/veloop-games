import { createContext, useContext } from 'react';

export const GameCoinContext = createContext();

export const useGameCoins = () => useContext(GameCoinContext);
