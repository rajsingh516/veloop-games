import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { gamesData } from '../../data/gamesData';
import { useGameCoins } from '../../context/useGameCoins';
import styles from '../../styles/GamePlay.module.css';

const roundLength = 30;
const wordLength = 60;
const mergeLength = 120;
const wordDictionary = new Set(`able acid aged also area army away baby back bake ball band bank base bath bear beat been beer bell belt best bill bird blow blue boat body bold bone book born both bowl busy cake call calm came camp card care case cash cast cave cell chat chip city club coal coat cold come cook cool copy cost crew crop dark data date dawn days dead deal dear deep desk diet dirt dish does done door down draw drew drop dual dust duty each earn ease east easy edge else even ever evil exit face fact fail fair fall farm fast fate fear feel feet fell felt file fill film find fine fire firm fish five flat flow food foot form four free from fuel full fund game gate gave gear gift girl give glad goal goes gold golf gone good grow grew hair half hand hang hard harm hate have head hear heat held help here hero hide high hill hire hold hole holy home hope host hour huge hung hunt hurt idea inch iron item jack join jump just keen keep kept kick kill kind king knew knee knew know lack lady laid lake land last late lead leaf left lend less life lift like line link list live load lock long look lord lose loss lost love luck made mail main make male many mark mass mate meal mean meat meet menu mere mesh mild mile milk mind mine miss mode moon more most move much must name near neck need news next nice nine node none nose note okay once only open oral other oven over pace page paid pain pair park part pass past path pave peak pick pine pink pipe plan play plot plum plus poem poet pole poll pond pool poor post pour push race rail rain raise rank rate rest rice rich ride ring rise risk rock role roll roof room root rope rose rule rush safe said sail same sand save seat seed seem seen self sell send sent ship shoe shot show shut sick side sign silk sing site size slow snow soft soil sold solo some song soon sort soul star stay step stop such suit sure swim tail take tale talk tall task team tell tend term text than thank that them then thin this thus tide tied tile time tiny tired told toll tone took tool town trip true tune turn type unit unto upon used user very view vote wage wait wake walk wall want warm wash wave ways weak wear week well went were west what when whom wide wife wild will wind wine wing wise wish with wood word work yard yeah year your zone`.split(' '));
const fourLetterWords = [...wordDictionary].filter((word) => word.length === 4);
const letterPool = 'AAAAAEEEEEEIIIIIIOOOOONNNRRRSSSSTTTLLDDGG';
const getWordPoints = (word) => {
  if (word.length < 5) return 1;
  if (word.length === 5) return 2;
  if (word.length === 6) return 3;
  if (word.length === 7) return 5;
  return 11;
};
const createWordGrid = () => {
  const words = [...fourLetterWords].sort(() => Math.random() - 0.5).slice(0, 3);
  const cells = Array(16).fill('');
  const used = new Set();

  const findPath = (word) => {
    const search = (index, path) => {
      if (index === word.length) return path;
      const previous = path[path.length - 1];
      const neighbors = Array.from({ length: 16 }, (_, cell) => cell)
        .filter((cell) => !used.has(cell) && !path.includes(cell)
          && Math.abs(Math.floor(cell / 4) - Math.floor(previous / 4)) <= 1
          && Math.abs((cell % 4) - (previous % 4)) <= 1)
        .sort(() => Math.random() - 0.5);
      for (const cell of neighbors) {
        const result = search(index + 1, [...path, cell]);
        if (result) return result;
      }
      return null;
    };
    const starts = Array.from({ length: 16 }, (_, cell) => cell).sort(() => Math.random() - 0.5);
    for (const start of starts) {
      const result = search(1, [start]);
      if (result) return result;
    }
    return null;
  };

  words.forEach((word) => {
    const path = findPath(word);
    if (path) {
      path.forEach((cell, index) => {
        used.add(cell);
        cells[cell] = word[index].toUpperCase();
      });
    }
  });

  cells.forEach((letter, index) => {
    if (!letter) cells[index] = letterPool[Math.floor(Math.random() * letterPool.length)];
  });
  return Array.from({ length: 4 }, (_, row) => cells.slice(row * 4, row * 4 + 4));
};

const createMergeBoard = () => {
  const board = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let tile = 0; tile < 2; tile += 1) {
    const emptyCells = [];
    board.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
      if (!value) emptyCells.push([rowIndex, columnIndex]);
    }));
    const [row, column] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[row][column] = Math.random() < 0.9 ? 2 : 4;
  }
  return board;
};

const slideMergeBoard = (board, direction) => {
  const next = board.map((row) => [...row]);
  let gained = 0;
  for (let line = 0; line < 4; line += 1) {
    const coordinates = Array.from({ length: 4 }, (_, position) => {
      if (direction === 'left') return [line, position];
      if (direction === 'right') return [line, 3 - position];
      if (direction === 'up') return [position, line];
      return [3 - position, line];
    });
    const values = coordinates.map(([row, column]) => board[row][column]).filter(Boolean);
    const merged = [];
    for (let index = 0; index < values.length; index += 1) {
      if (values[index] === values[index + 1]) {
        const value = values[index] * 2;
        merged.push(value);
        gained += value;
        index += 1;
      } else {
        merged.push(values[index]);
      }
    }
    coordinates.forEach(([row, column], position) => {
      next[row][column] = merged[position] || 0;
    });
  }
  return { board: next, gained };
};

const canMergeMove = (board) => board.some((row, rowIndex) => row.some((value, columnIndex) => (
  value === 0
  || (rowIndex < 3 && value === board[rowIndex + 1][columnIndex])
  || (columnIndex < 3 && value === row[columnIndex + 1])
)));

const addMergeTile = (board) => {
  const next = board.map((row) => [...row]);
  const emptyCells = [];
  next.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    if (!value) emptyCells.push([rowIndex, columnIndex]);
  }));
  if (emptyCells.length > 0) {
    const [row, column] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    next[row][column] = Math.random() < 0.9 ? 2 : 4;
  }
  return next;
};

export default function GameHome() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    tokens,
    gameCoins,
    deductTokens,
    gameRecords,
    recordGameRound,
    seenGuides,
    markGuideSeen
  } = useGameCoins();
  const game = location.state?.game || gamesData.find((item) => item.route === gameId);
  const gameRecord = gameRecords[game?.route] || { bestScore: 0, roundsPlayed: 0 };
  const duration = game?.mode === 'wordhunt' ? wordLength : game?.mode === 'merge' ? mergeLength : roundLength;
  const [gameState, setGameState] = useState('home');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [playerLane, setPlayerLane] = useState(1);
  const [lives, setLives] = useState(3);
  const [aim, setAim] = useState(50);
  const [power, setPower] = useState(70);
  const [pinsRemaining, setPinsRemaining] = useState(10);
  const [throwsLeft, setThrowsLeft] = useState(3);
  const [isRolling, setIsRolling] = useState(false);
  const [wordGrid, setWordGrid] = useState(createWordGrid);
  const [wordSelection, setWordSelection] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [wordMessage, setWordMessage] = useState('');
  const [mergeBoard, setMergeBoard] = useState(createMergeBoard);
  const [mergeTurn, setMergeTurn] = useState(0);
  const [hazard, setHazard] = useState({ lane: 0, progress: 0 });
  const [notice, setNotice] = useState('');
  const [rewardNotice, setRewardNotice] = useState(0);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const playerLaneRef = useRef(playerLane);
  const timeLeftRef = useRef(duration);
  const livesRef = useRef(3);
  const hazardRef = useRef(hazard);
  const hazardResolvedRef = useRef(false);
  const startTimeoutRef = useRef(null);
  const rollTimeoutRef = useRef(null);
  const payoutClaimedRef = useRef(false);
  const touchStartRef = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(startTimeoutRef.current);
    window.clearTimeout(rollTimeoutRef.current);
  }, []);

  const moveToLane = (lane) => {
    playerLaneRef.current = lane;
    setPlayerLane(lane);
  };

  const submitWord = useCallback(() => {
    const word = wordSelection.map((index) => wordGrid[Math.floor(index / 4)][index % 4]).join('').toLowerCase();
    if (word.length < 3) {
      setWordMessage('Words need at least 3 letters.');
      setWordSelection([]);
      return;
    }
    if (!wordDictionary.has(word)) {
      setWordMessage(`${word.toUpperCase()} is not in this round’s dictionary.`);
      setWordSelection([]);
      return;
    }
    if (foundWords.includes(word)) {
      setWordMessage(`${word.toUpperCase()} was already found.`);
      setWordSelection([]);
      return;
    }
    setFoundWords((previous) => [...previous, word]);
    const points = getWordPoints(word);
    setScore((previous) => previous + points);
    setWordMessage(`+${points} ${points === 1 ? 'point' : 'points'} · ${word.toUpperCase()} found!`);
    setWordSelection([]);
  }, [foundWords, wordGrid, wordSelection]);

  const selectWordCell = (index) => {
    setWordMessage('');
    if (wordSelection.includes(index)) {
      if (wordSelection[wordSelection.length - 1] === index && wordSelection.length >= 3) {
        submitWord();
      } else {
        setWordSelection(wordSelection.slice(0, wordSelection.indexOf(index) + 1));
      }
      return;
    }
    const previous = wordSelection[wordSelection.length - 1];
    if (previous !== undefined) {
      const rowDistance = Math.abs(Math.floor(previous / 4) - Math.floor(index / 4));
      const columnDistance = Math.abs((previous % 4) - (index % 4));
      if (rowDistance > 1 || columnDistance > 1) {
        setWordSelection([index]);
        return;
      }
    }
    setWordSelection((selection) => [...selection, index]);
  };

  const handleMergeMove = useCallback((direction) => {
    if (gameState !== 'playing' || game?.mode !== 'merge') return;
    const { board: shiftedBoard, gained } = slideMergeBoard(mergeBoard, direction);
    const changed = shiftedBoard.some((row, rowIndex) => row.some((value, columnIndex) => value !== mergeBoard[rowIndex][columnIndex]));
    if (!changed) return;
    const nextBoard = addMergeTile(shiftedBoard);
    setMergeBoard(nextBoard);
    setMergeTurn((previous) => previous + 1);
    if (gained > 0) setScore((previous) => previous + gained);
    const reachedTarget = nextBoard.some((row) => row.some((value) => value >= 2048));
    if (reachedTarget || !canMergeMove(nextBoard)) setGameState('gameover');
  }, [game?.mode, gameState, mergeBoard]);

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
    if (gameState !== 'playing' || (game?.mode !== 'shooter' && game?.mode !== 'merge')) return undefined;

    const movePilot = (event) => {
      const directions = {
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right',
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down'
      };
      const direction = directions[event.key];
      if (!direction) return;
      if (game?.mode === 'merge') {
        event.preventDefault();
        handleMergeMove(direction);
      } else if (direction === 'left' || direction === 'right') {
        event.preventDefault();
        const nextLane = Math.max(0, Math.min(2, playerLaneRef.current + (direction === 'left' ? -1 : 1)));
        playerLaneRef.current = nextLane;
        setPlayerLane(nextLane);
      }
    };

    window.addEventListener('keydown', movePilot);
    return () => window.removeEventListener('keydown', movePilot);
  }, [game?.mode, gameState, handleMergeMove]);

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
    window.clearTimeout(rollTimeoutRef.current);
    setNotice('');
    setRewardNotice(0);
    setScore(0);
    setTimeLeft(duration);
    timeLeftRef.current = duration;
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
    setIsRolling(false);
    setWordGrid(createWordGrid());
    setWordSelection([]);
    setFoundWords([]);
    setWordMessage('');
    setMergeBoard(createMergeBoard());
    setMergeTurn(0);
    payoutClaimedRef.current = false;
    setGameState('playing');
  };

  const handlePlay = () => {
    if (isStarting) return;
    if (tokens < game.cost) {
      setNotice(`You need ${game.cost} Tokens to play. Your balance: ${tokens} Tokens.`);
      return;
    }

    setNotice('');
    if (seenGuides[game.route]) {
      if (!deductTokens(game.cost)) {
        setNotice(`You need ${game.cost} Tokens to play. Your balance: ${tokens} Tokens.`);
        return;
      }
      startRound();
      return;
    }

    setIsStarting(true);
    startTimeoutRef.current = window.setTimeout(() => {
      setIsStarting(false);
      setGameState('guide');
    }, 250);
  };

  const handleGuideComplete = () => {
    if (!deductTokens(game.cost)) {
      setGameState('home');
      setNotice(`You need ${game.cost} Tokens to play. Your balance: ${tokens} Tokens.`);
      return;
    }
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
    }
  };

  const handleBowl = () => {
    if (isRolling || throwsLeft === 0) return;
    const accuracy = Math.max(0, 1 - Math.abs(aim - 50) / 65);
    const knockedPins = Math.min(pinsRemaining, Math.max(0, Math.round(accuracy * power / 10)));
    const remainingPins = pinsRemaining - knockedPins;
    const remainingThrows = throwsLeft - 1;
    setIsRolling(true);
    rollTimeoutRef.current = window.setTimeout(() => {
      setScore((previous) => previous + knockedPins * 10);
      setPinsRemaining(remainingPins);
      setThrowsLeft(remainingThrows);
      setIsRolling(false);
      if (remainingPins === 0 || remainingThrows === 0) setGameState('gameover');
    }, 620);
  };

  const handleRevive = () => {
    setReviveUsed(true);
    setTimeLeft(15);
    timeLeftRef.current = 15;
    setWordSelection([]);
    if (game.mode === 'merge') setMergeBoard(createMergeBoard());
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
    if (payoutClaimedRef.current) return;
    payoutClaimedRef.current = true;
    recordGameRound(game.route, score, earnedCoins);
    setRewardNotice(earnedCoins);
    setGameState('home');
  };

  return (
    <main className={styles.lightThemeContainer}>
      <header className={styles.topHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← Games</button>
        <div className={styles.headerBalances}>
          <div className={styles.tokenBalanceBadge}>
            <img src="/assets/tokens/multi_token.png" alt="" className={styles.miniCoin} />
            <span><strong>{tokens}</strong> Tokens</span>
          </div>
          <div className={styles.coinBalanceBadge}>
            <img src="/assets/tokens/game_coin.png" alt="" className={styles.miniCoin} />
            <span><strong>{gameCoins}</strong> Game Coins</span>
          </div>
        </div>
      </header>

      {gameState === 'home' && (
        <section className={styles.homeContent}>
          <div className={`${styles.gameIllustrationBox} ${game.mode === 'bowler' ? styles.bowlerTheme : styles.shooterTheme}`}>
            <img className={styles.gameArtwork} src={game.image} alt={`${game.name} game artwork`} />
            <div className={styles.gameIntro}>
              <p className={styles.eyebrow}>
                {game.mode === 'wordhunt' ? 'WORD PUZZLE' : game.mode === 'merge' ? 'NUMBER PUZZLE' : game.mode === 'bowler' ? 'BOWLING CHALLENGE' : 'SPACE SHOOTER'}
              </p>
              <h1>{game.name}</h1>
              <p>{game.description}</p>
            </div>
          </div>

          {gameRecord.roundsPlayed > 0 && (
            <section className={styles.personalRecord} aria-label="Personal game records">
              <div>
                <span>PERSONAL BEST</span>
                <strong>{gameRecord.bestScore.toLocaleString()}</strong>
              </div>
              <div>
                <span>ROUNDS PLAYED</span>
                <strong>{gameRecord.roundsPlayed}</strong>
              </div>
              <span className={styles.recordSpark} aria-hidden="true">✦</span>
            </section>
          )}

          <section className={styles.entryPanel} aria-label="Game entry">
            <div>
              <p className={styles.eyebrow}>ENTRY FEE</p>
              <p className={styles.entryCost}><img src="/assets/tokens/multi_token.png" alt="" />{game.cost} Tokens</p>
            </div>
            <button
              className={styles.primaryAction}
              onClick={tokens < game.cost
                ? () => navigate('/redeem', { state: { returnTo: `/games/${game.route}` } })
                : handlePlay}
              disabled={isStarting}
              aria-live="polite"
            >
              {isStarting && <span className={styles.loadingSpinner} aria-hidden="true" />}
              {isStarting ? 'Starting...' : tokens < game.cost ? 'Get Tokens' : 'Play Now'} {!isStarting && <span aria-hidden="true">→</span>}
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
              <h2>{game.mode === 'wordhunt'
                ? 'Connect letters. Discover words.'
                : game.mode === 'merge'
                  ? 'Slide. Merge. Reach 2048.'
                  : game.mode === 'bowler'
                    ? 'Set your line. Knock down the pins.'
                    : 'Dodge the wave. Fire when lined up.'}</h2>
            </div>
            <p>{game.mode === 'wordhunt'
              ? 'Tap a letter, then follow neighboring tiles in any direction to spell a real word. Submit each word once before the 60-second timer runs out.'
              : game.mode === 'merge'
                ? 'Use the arrow keys, swipe, or the direction pad to slide the board. Matching numbers merge into one tile. Keep merging to reach 2048 before time runs out.'
                : game.mode === 'shooter'
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
            <p>{game.mode === 'wordhunt'
              ? 'Select neighboring letters to build a word. You can move in any direction, but cannot use the same tile twice in one word. Submit each word when it is ready.'
              : game.mode === 'merge'
                ? 'Move the tiles with the arrow keys, swipe, or on-screen controls. Matching values combine and spawn a new tile after each move.'
                : game.mode === 'shooter'
                  ? 'Use the arrow keys or tap a lane to dodge ships. Tap Fire when a ship is in your lane to blast it for bonus points. Three hits end the run.'
                  : 'Set the aim and power sliders, then roll. Better alignment and more power knock down pins. Clear the rack within three throws.'}</p>
            <p className={styles.guideMeta}>{game.mode === 'wordhunt'
              ? '60 seconds · 4 × 4 letter grid · touch friendly'
              : game.mode === 'merge'
                ? '120 seconds · 4 × 4 board · keyboard, swipe, or buttons'
                : game.mode === 'shooter'
                  ? '30 seconds · 3 shields · keyboard or touch'
                  : '10 pins · 3 throws · adjustable aim and power'}</p>
            <button className={styles.primaryAction} onClick={handleGuideComplete}>Got it, play <span aria-hidden="true">→</span></button>
          </section>
        </div>
      )}

      {gameState === 'playing' && (
        <section className={styles.activePlayArea} aria-label={`${game.name} gameplay`}>
          <header className={styles.gameHud}>
            <span>Score <strong>{score}</strong></span>
            {game.mode === 'wordhunt'
              ? <span>Words <strong>{foundWords.length}</strong></span>
              : game.mode === 'merge'
                ? <span>Best tile <strong>{Math.max(...mergeBoard.flat())}</strong></span>
                : game.mode === 'bowler'
                  ? <span>Pins <strong>{pinsRemaining}</strong></span>
                  : <span>Shields <strong>{'●'.repeat(lives)}{'○'.repeat(3 - lives)}</strong></span>}
            <span>Time <strong>{timeLeft}s</strong></span>
          </header>

          {game.mode === 'wordhunt' ? (
            <div className={styles.wordPlayfield}>
              <div className={styles.wordGameHeader}>
                <span>FIND WORDS</span>
                <span>{foundWords.length} found</span>
              </div>
              <div className={styles.wordBoard} role="group" aria-label="Word Hunt letter grid">
                {wordGrid.flat().map((letter, index) => (
                  <button
                    key={`${index}-${letter}`}
                    type="button"
                    className={`${styles.wordCell} ${wordSelection.includes(index) ? styles.selectedWordCell : ''}`}
                    onClick={() => selectWordCell(index)}
                    aria-label={`Row ${Math.floor(index / 4) + 1}, column ${(index % 4) + 1}: ${letter}`}
                    aria-pressed={wordSelection.includes(index)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div className={styles.wordComposer}>
                <div className={styles.wordComposerText} aria-live="polite">
                  {wordSelection.length ? wordSelection.map((index) => wordGrid[Math.floor(index / 4)][index % 4]).join('') : 'Tap letters to spell a word'}
                </div>
                <button className={styles.wordSubmit} onClick={submitWord} disabled={wordSelection.length < 3}>Submit word</button>
              </div>
              <p className={styles.wordMessage} role="status">{wordMessage || 'Letters must touch, including diagonals.'}</p>
              <div className={styles.foundWordList} aria-label="Words found">
                {foundWords.length
                  ? foundWords.map((word) => <span key={word}>{word}</span>)
                  : <span className={styles.foundPlaceholder}>Your discovered words appear here</span>}
              </div>
            </div>
          ) : game.mode === 'merge' ? (
            <div
              className={styles.mergePlayfield}
              onTouchStart={(event) => {
                const touch = event.touches[0];
                touchStartRef.current = { x: touch.clientX, y: touch.clientY };
              }}
              onTouchEnd={(event) => {
                if (!touchStartRef.current) return;
                const touch = event.changedTouches[0];
                const deltaX = touch.clientX - touchStartRef.current.x;
                const deltaY = touch.clientY - touchStartRef.current.y;
                touchStartRef.current = null;
                if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) return;
                handleMergeMove(Math.abs(deltaX) > Math.abs(deltaY)
                  ? (deltaX > 0 ? 'right' : 'left')
                  : (deltaY > 0 ? 'down' : 'up'));
              }}
            >
              <p className={styles.mergeHint}>Combine matching tiles to reach <strong>2048</strong></p>
              <div className={styles.mergeBoard} role="grid" aria-label="Merge Master 2048 game board">
                {mergeBoard.flat().map((tile, index) => {
                  const color = tile === 0 ? 'transparent'
                    : tile <= 4 ? '#33364a'
                      : tile <= 16 ? '#555b78'
                        : tile <= 64 ? '#697b9c'
                          : tile <= 256 ? '#b28054'
                            : tile <= 1024 ? '#c48d4e'
                              : '#c8f076';
                  return (
                    <div
                      key={`merge-${mergeTurn}-${index}-${tile}`}
                      className={`${styles.mergeTile} ${tile >= 1024 ? styles.mergeTileTarget : ''}`}
                      role="gridcell"
                      aria-label={tile ? `${tile}` : 'Empty'}
                      style={{ '--tile-color': color }}
                    >
                      {tile || ''}
                    </div>
                  );
                })}
              </div>
              <div className={styles.mergeControls} aria-label="Move tiles">
                <button type="button" onClick={() => handleMergeMove('up')} aria-label="Move tiles up">↑</button>
                <div>
                  <button type="button" onClick={() => handleMergeMove('left')} aria-label="Move tiles left">←</button>
                  <button type="button" onClick={() => handleMergeMove('down')} aria-label="Move tiles down">↓</button>
                  <button type="button" onClick={() => handleMergeMove('right')} aria-label="Move tiles right">→</button>
                </div>
              </div>
              <p className={styles.mergeKeyboardHint}>Use arrow keys, WASD, swipe, or controls</p>
            </div>
          ) : game.mode === 'bowler' ? (
            <div className={styles.bowlingPlayfield}>
              <div className={styles.pinRack} aria-label={`${pinsRemaining} pins remaining`}>
                {'●'.repeat(pinsRemaining)}<span>{'○'.repeat(10 - pinsRemaining)}</span>
              </div>
              <span className={`${styles.bowlingBall} ${isRolling ? styles.ballRolling : ''}`} aria-hidden="true" />
              <label className={styles.rangeControl}>Aim <span>{Math.round(aim)}%</span>
                <input type="range" min="0" max="100" value={aim} onChange={(event) => setAim(Number(event.target.value))} aria-label="Bowling aim" />
              </label>
              <label className={styles.rangeControl}>Power <span>{Math.round(power)}%</span>
                <input type="range" min="25" max="100" value={power} onChange={(event) => setPower(Number(event.target.value))} aria-label="Bowling power" />
              </label>
              <button className={styles.rollButton} onClick={handleBowl} disabled={throwsLeft === 0 || isRolling}>
                {isRolling ? 'Rolling…' : `Roll · ${throwsLeft} ${throwsLeft === 1 ? 'throw' : 'throws'} left`}
              </button>
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
            <h2 id="game-over-title">{game.mode === 'wordhunt'
              ? 'Time is up!'
              : game.mode === 'merge'
                ? (Math.max(...mergeBoard.flat()) >= 2048 ? '2048! Amazing!' : canMergeMove(mergeBoard) ? 'Round complete' : 'No more moves!')
                : game.mode === 'bowler'
                  ? (pinsRemaining === 0 ? 'Strike!' : 'Round complete')
                  : (timeLeft > 0 ? 'Ship hit' : 'Time is up')}</h2>
            <p className={styles.finalScore}>Final score <strong>{score}</strong></p>
            {score > gameRecord.bestScore && (
              <p className={styles.newRecord}>✦ New personal best!</p>
            )}
            <p className={styles.previousBest}>Personal best <strong>{Math.max(score, gameRecord.bestScore).toLocaleString()}</strong></p>
            <p className={styles.rewardSummary}><img src="/assets/tokens/game_coin.png" alt="" /> Collect {earnedCoins} Game Coins</p>
            {!reviveUsed && <button className={styles.secondaryAction} onClick={handleRevive}>Revive · continue round</button>}
            <button className={styles.primaryAction} onClick={finishRound}>No Thanks · collect reward</button>
          </section>
        </div>
      )}

      <nav className={styles.bottomNav} aria-label="Game navigation">
        <button className={gameState === 'home' ? styles.activeNavItem : ''} onClick={() => {
          window.clearTimeout(rollTimeoutRef.current);
          setIsRolling(false);
          setGameState('home');
        }}>Home</button>
        <button onClick={() => navigate('/redeem', { state: { returnTo: `/games/${game.route}` } })}>Redeem Game Coins</button>
      </nav>
    </main>
  );
}