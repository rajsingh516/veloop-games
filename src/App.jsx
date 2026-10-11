import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameCoinProvider } from './context/GameCoinContext';
import { resetAccountToDefault } from './context/accountStorage';
import GamesCarousel from './components/games/GamesCarousel';
import GameHome from './components/games/GameHome';
import GameRedeem from './components/games/GameRedeem';

export default function App() {
  useEffect(() => {
    const resetOnOpen = () => resetAccountToDefault();
    const resetOnLogin = () => resetAccountToDefault();

    window.addEventListener('veloop-app-open', resetOnOpen);
    window.addEventListener('veloop-user-login', resetOnLogin);

    resetOnOpen();

    if (!window.veloopResetGameAccount) {
      window.veloopResetGameAccount = resetOnLogin;
    }

    return () => {
      window.removeEventListener('veloop-app-open', resetOnOpen);
      window.removeEventListener('veloop-user-login', resetOnLogin);
    };
  }, []);

  return (
    <GameCoinProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GamesCarousel />} />
          <Route path="/games/:gameId" element={<GameHome />} />
          <Route path="/redeem" element={<GameRedeem />} />
          <Route path="*" element={<GameHome />} />
        </Routes>
      </BrowserRouter>
    </GameCoinProvider>
  );
}