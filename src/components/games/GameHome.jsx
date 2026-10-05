import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { gamesData } from '../../data/gamesData';
import { useGameCoins } from '../../context/useGameCoins';
import styles from '../../styles/GamePlay.module.css';

const roundLength = 30;

export default function GameHome() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    tokens,
    gameCoins,
    deductTokens,
    addGameCoins,
    seenGuides,
    markGuideSeen
  } = useGameCoins();
  const game = location.state?.game || gamesData.find((item) => item.route === gameId);
  const [gameState, setGameState] = useState('home');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(roundLength);
  const [playerLane, setPlayerLane] = useState(1);
  const [lives, setLives] = useState(3);
  const [aim, setAim] = useState(50);
  const [power, setPower] = useState(70);
  const [pinsRemaining, setPinsRemaining] = useState(10);
  const [throwsLeft, setThrowsLeft] = useState(3);
  const [hazard, setHazard] = useState({ lane: 0, progress: 0 });
  const [notice, setNotice] = useState('');
  const [rewardNotice, setRewardNotice] = useState(0);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const playerLaneRef = useRef(playerLane);
  const timeLeftRef = useRef(roundLength);
  const livesRef = useRef(3);
  const hazardRef = useRef(hazard);
  const hazardResolvedRef = useRef(false);
  const startTimeoutRef = useRef(null);

  useEffect(() => () => window.clearTimeout(startTimeoutRef.current), []);

  const moveToLane = (lane) => {
    playerLaneRef.current = lane;
    setPlayerLane(lane);
  };

  useEffect(() => {
    if (gameState !== 'playing') return undefined;

    const clock = window.setInterval(() => {
      const remaining = Math.max(0, timeLeftRef.current - 1);
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);
      if (remaining === 0) setGameState('gameover');
    }, 1000);

    if (game.mode !== 'shooter') return () => window.clearInterval(clock);

    const obstacleTimer = window.setInterval(() => {
      const current = hazardRef.current;
      const progress = current.progress + 16;
      if (progress >= 96 && !hazardResolvedRef.current) {
        hazardResolvedRef.current = true;
        if (current.lane === playerLaneRef.current) {
          const remainingLives = Math.max(0, livesRef.current - 1);
          livesRef.current = remainingLives;
          setLives(remainingLives);
          if (remainingLives === 0) setGameState('gameover');
        }
      }

      const next = progress >= 100
        ? { lane: Math.floor(Math.random() * 3), progress: 0 }
        : { ...current, progress };
      if (progress >= 100) hazardResolvedRef.current = false;
      hazardRef.current = next;
      setHazard(next);
    }, 700);

    return () => {
      window.clearInterval(clock);
      window.clearInterval(obstacleTimer);
    };
  }, [game?.mode, gameState]);

  useEffect(() => {
    if (gameState !== 'playing' || game?.mode !== 'shooter') return undefined;

    const movePilot = (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const nextLane = Math.max(0, Math.min(2, playerLaneRef.current + (event.key === 'ArrowLeft' ? -1 : 1)));
      playerLaneRef.current = nextLane;
      setPlayerLane(nextLane);
    };

    window.addEventListener('keydown', movePilot);
    return () => window.removeEventListener('keydown', movePilot);
  }, [game?.mode, gameState]);

  if (!game) {
    return (
      <main className={styles.lightThemeContainer}>
        <div className={styles.errorPanel}>
          <p className={styles.eyebrow}>GAME UNAVAILABLE</p>
          <h1>We couldn’t open this game.</h1>
          <p>Return to the games library and choose one of the available challenges.</p>
          <div className={styles.errorActions}>
            <button className={styles.secondaryAction} onClick={() => navigate(0)}>Try Again</button>
            <button className={styles.primaryAction} onClick={() => navigate('/')}>Back to Games</button>
          </div>
        </div>
      </main>
    );
  }

  if (!game.playable) {
    return (
      <main className={styles.lightThemeContainer}>
        <div className={styles.errorPanel}>
          <p className={styles.eyebrow}>COMING SOON</p>
          <h1>{game.name} is not playable yet.</h1>
          <p>This game is available as a banner preview. Try one of the two playable challenges.</p>
          <button className={styles.primaryAction} onClick={() => navigate('/')}>Back to Games</button>
        </div>
      </main>
    );
  }

  const startRound = () => {
    setNotice('');
    setRewardNotice(0);
    setScore(0);
    setTimeLeft(roundLength);
    timeLeftRef.current = roundLength;
    setPlayerLane(1);
    playerLaneRef.current = 1;
    setLives(3);
    livesRef.current = 3;
    const firstHazard = { lane: Math.floor(Math.random() * 3), progress: 0 };
    hazardRef.current = firstHazard;
    hazardResolvedRef.current = false;
    setHazard(firstHazard);
    setReviveUsed(false);
    setAim(50);
    setPower(70);
    setPinsRemaining(10);
    setThrowsLeft(3);
    setGameState('playing');
  };

  const handlePlay = () => {
    if (isStarting) return;
    if (!deductTokens(game.cost)) {
      setNotice(`You need ${game.cost} Tokens to play. Your balance: ${tokens} Tokens.`);
      return;
    }

    setNotice('');
    setIsStarting(true);
    startTimeoutRef.current = window.setTimeout(() => {
      setIsStarting(false);
      if (!seenGuides[game.route]) setGameState('guide');
      else startRound();
    }, 250);
  };

  const handleGuideComplete = () => {
    markGuideSeen(game.route);
    startRound();
  };

  const handleShoot = () => {
    const shotLane = playerLaneRef.current;
    if (hazardRef.current.lane === shotLane && hazardRef.current.progress > 16) {
      setScore((previous) => previous + 15);
      const clearedHazard = { lane: (shotLane + 1 + Math.floor(Math.random() * 2)) % 3, progress: 0 };
      hazardRef.current = clearedHazard;
      hazardResolvedRef.current = false;
      setHazard(clearedHazard);
    } else {
      setScore((previous) => previous + 2);
    }
  };

  const handleBowl = () => {
    const accuracy = Math.max(0, 1 - Math.abs(aim - 50) / 65);
    const knockedPins = Math.min(pinsRemaining, Math.max(0, Math.round(accuracy * power / 10)));
    const remainingPins = pinsRemaining - knockedPins;
    const remainingThrows = throwsLeft - 1;
    setScore((previous) => previous + knockedPins * 10);
    setPinsRemaining(remainingPins);
    setThrowsLeft(remainingThrows);
    if (remainingPins === 0 || remainingThrows === 0) setGameState('gameover');
  };

  const handleRevive = () => {
    setReviveUsed(true);
    setTimeLeft(15);
    timeLeftRef.current = 15;
    if (game.mode === 'bowler') {
      setPinsRemaining(10);
      setThrowsLeft(3);
    }
    const safeHazard = { lane: (playerLaneRef.current + 1) % 3, progress: 0 };
    hazardRef.current = safeHazard;
    hazardResolvedRef.current = false;
    setHazard(safeHazard);
    if (game.mode === 'shooter') {
      const restoredLives = Math.max(1, livesRef.current);
      livesRef.current = restoredLives;
      setLives(restoredLives);
    }
    setGameState('playing');
  };

  const earnedCoins = Math.min(20, Math.floor(score / (game.mode === 'bowler' ? 10 : 5)));
  const finishRound = () => {
    addGameCoins(earnedCoins);
    setRewardNotice(earnedCoins);
    setGameState('home');
  };

  return (
    <main className={styles.lightThemeContainer}>
      <header className={styles.topHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← Games</button>
        <div className={styles.coinBalanceBadge}>
          <img src="/assets/tokens/game_coin.png" alt="" className={styles.miniCoin} />
          <span><strong>{gameCoins}</strong> Game Coins</span>
        </div>
      </header>

      {gameState === 'home' && (
        <section className={styles.homeContent}>
          <div className={`${styles.gameIllustrationBox} ${game.mode === 'bowler' ? styles.bowlerTheme : styles.shooterTheme}`}>
            <img className={styles.gameArtwork} src={game.image} alt={`${game.name} game artwork`} />
            <div className={styles.gameIntro}>
              <p className={styles.eyebrow}>{game.mode === 'bowler' ? 'BOWLING CHALLENGE' : 'SPACE SHOOTER'}</p>
              <h1>{game.name}</h1>
              <p>{game.description}</p>
            </div>
          </div>

          <section className={styles.entryPanel} aria-label="Game entry">
            <div>
              <p className={styles.eyebrow}>ENTRY FEE</p>
              <p className={styles.entryCost}><img src="/assets/tokens/multi_token.png" alt="" />20 Tokens</p>
            </div>
            <button className={styles.primaryAction} onClick={handlePlay} disabled={isStarting} aria-live="polite">
              {isStarting && <span className={styles.loadingSpinner} aria-hidden="true" />}
              {isStarting ? 'Starting...' : 'Play Now'} {!isStarting && <span aria-hidden="true">→</span>}
            </button>
          </section>

          {notice && (
            <div className={styles.notice} role="alert">
              <span>{notice}</span>
              <div className={styles.noticeActions}>
                <button onClick={() => navigate('/redeem', { state: { returnTo: `/games/${game.route}` } })}>Earn More Tokens</button>
                <button onClick={() => setNotice('')}>Dismiss</button>
              </div>
            </div>
          )}
          {rewardNotice > 0 && <div className={styles.rewardNotice} role="status">+{rewardNotice} Game Coins added. Your balance is now {gameCoins}.</div>}

          <section className={styles.howToPlaySection}>
            <div>
              <p className={styles.eyebrow}>HOW TO PLAY</p>
              <h2>{game.mode === 'bowler' ? 'Set your line. Knock down the pins.' : 'Dodge the wave. Fire when lined up.'}</h2>
            </div>
            <p>{game.mode === 'shooter'
              ? 'Use the left and right arrow keys or tap a lane to dodge the incoming ships. Tap Fire when an enemy enters your lane to earn extra score.'
              : 'Adjust aim and power, then roll. Centered shots with higher power knock down more pins. You have three throws.'}</p>
            <div className={styles.rewardSummary}><img src="/assets/tokens/game_coin.png" alt="" /> Earn up to 20 Game Coins each round</div>
          </section>
        </section>
      )}

      {gameState === 'guide' && (
        <div className={styles.modalOverlay}>
          <section className={styles.guideModal} role="dialog" aria-modal="true" aria-labelledby="guide-title">
            <p className={styles.eyebrow}>YOUR FIRST ROUND</p>
            <h2 id="guide-title">How to play</h2>
            <p>{game.mode === 'shooter'
              ? 'Use the arrow keys or tap a lane to dodge ships. Tap Fire when a ship is in your lane to blast it for bonus points. Three hits end the run.'
              : 'Set the aim and power sliders, then roll. Better alignment and more power knock down more pins. Clear the rack within three throws.'}</p>
            <p className={styles.guideMeta}>{game.mode === 'shooter' ? '30 seconds · 3 shields · keyboard or touch' : '10 pins · 3 throws · adjustable aim and power'}</p>
            <button className={styles.primaryAction} onClick={handleGuideComplete}>Got it, play <span aria-hidden="true">→</span></button>
          </section>
        </div>
      )}

      {gameState === 'playing' && (
        <section className={styles.activePlayArea} aria-label={`${game.name} gameplay`}>
          <header className={styles.gameHud}>
            <span>Score <strong>{score}</strong></span>
            {game.mode === 'bowler'
              ? <span>Pins <strong>{pinsRemaining}</strong></span>
              : <span>Shields <strong>{'●'.repeat(lives)}{'○'.repeat(3 - lives)}</strong></span>}
            <span>Time <strong>{timeLeft}s</strong></span>
          </header>

          {game.mode === 'bowler' ? (
            <div className={styles.bowlingPlayfield}>
              <div className={styles.pinRack} aria-label={`${pinsRemaining} pins remaining`}>
                {'●'.repeat(pinsRemaining)}<span>{'○'.repeat(10 - pinsRemaining)}</span>
              </div>
              <label className={styles.rangeControl}>Aim <span>{Math.round(aim)}%</span>
                <input type="range" min="0" max="100" value={aim} onChange={(event) => setAim(Number(event.target.value))} aria-label="Bowling aim" />
              </label>
              <label className={styles.rangeControl}>Power <span>{Math.round(power)}%</span>
                <input type="range" min="25" max="100" value={power} onChange={(event) => setPower(Number(event.target.value))} aria-label="Bowling power" />
              </label>
              <button className={styles.rollButton} onClick={handleBowl} disabled={throwsLeft === 0}>Roll · {throwsLeft} {throwsLeft === 1 ? 'throw' : 'throws'} left</button>
              <p className={styles.gameHint}>Center your aim and build enough power</p>
            </div>
          ) : (
            <div className={styles.shooterPlayfield}>
              <div className={styles.laneTrack}>
                {[0, 1, 2].map((lane) => (
                  <button key={lane} className={styles.shooterLane} onClick={() => moveToLane(lane)} aria-label={`Move to lane ${lane + 1}`}>
                    {hazard.lane === lane && <span className={styles.shooterHazard} style={{ top: `${hazard.progress}%` }} aria-label="Incoming hazard">!</span>}
                    {playerLane === lane && <span className={styles.shooterPlayer} aria-label="Your ship">●</span>}
                  </button>
                ))}
              </div>
              <div className={styles.shooterControls}>
                <p className={styles.gameHint}>Tap a lane or use ← → to move</p>
                <button className={styles.fireButton} onClick={handleShoot}>Fire</button>
              </div>
            </div>
          )}
        </section>
      )}

      {gameState === 'gameover' && (
        <div className={styles.modalOverlay}>
          <section className={styles.gameOverModal} role="dialog" aria-modal="true" aria-labelledby="game-over-title">
            <p className={styles.eyebrow}>ROUND COMPLETE</p>
            <h2 id="game-over-title">{game.mode === 'bowler' ? (pinsRemaining === 0 ? 'Strike!' : 'Round complete') : (timeLeft > 0 ? 'Ship hit' : 'Time is up')}</h2>
            <p className={styles.finalScore}>Final score <strong>{score}</strong></p>
            <p className={styles.rewardSummary}><img src="/assets/tokens/game_coin.png" alt="" /> Collect {earnedCoins} Game Coins</p>
            {!reviveUsed && <button className={styles.secondaryAction} onClick={handleRevive}>Revive · continue round</button>}
            <button className={styles.primaryAction} onClick={finishRound}>No Thanks · collect reward</button>
          </section>
        </div>
      )}

      <nav className={styles.bottomNav} aria-label="Game navigation">
        <button className={gameState === 'home' ? styles.activeNavItem : ''} onClick={() => setGameState('home')}>Home</button>
        <button onClick={() => navigate('/redeem', { state: { returnTo: `/games/${game.route}` } })}>Redeem Game Coins</button>
      </nav>
    </main>
  );
}