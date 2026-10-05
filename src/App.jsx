import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameCoinProvider } from './context/GameCoinContext';
import GamesCarousel from './components/games/GamesCarousel';
import GameHome from './components/games/GameHome';
import GameRedeem from './components/games/GameRedeem';

export default function App() {
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