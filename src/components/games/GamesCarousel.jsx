import React, { useRef, useState, useEffect } from 'react';
import GameCard from './GameCard';
import { gamesData } from '../../data/gamesData';
import { useGameCoins } from '../../context/useGameCoins';
import styles from '../../styles/Games.module.css';

export default function GamesCarousel() {
  const carouselRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { tokens, gameCoins } = useGameCoins();

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || isPaused) return undefined;

    const interval = setInterval(() => {
      const carousel = carouselRef.current;
      if (!carousel || document.hidden) return;

      const nextIndex = activeIndex >= gamesData.length - 1 ? 0 : activeIndex + 1;
      const nextCard = carousel.children[nextIndex];
      if (nextCard) {
        carousel.scrollTo({
          left: nextIndex === 0 ? 0 : nextCard.offsetLeft - carousel.offsetLeft,
          behavior: 'smooth'
        });
      }
    }, 3600);
    return () => clearInterval(interval);
  }, [activeIndex, isPaused]);

  useEffect(() => () => window.clearTimeout(resumeTimerRef.current), []);

  const pauseForInteraction = () => {
    setIsPaused(true);
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => setIsPaused(false), 4500);
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const carousel = carouselRef.current;
      const index = Array.from(carousel.children).reduce((closestIndex, card, currentIndex, cards) => {
        const closestDistance = Math.abs(cards[closestIndex].offsetLeft - carousel.offsetLeft - carousel.scrollLeft);
        const currentDistance = Math.abs(card.offsetLeft - carousel.offsetLeft - carousel.scrollLeft);
        return currentDistance < closestDistance ? currentIndex : closestIndex;
      }, 0);
      setActiveIndex(index);
    }
  };

  const showGame = (index) => {
    const carousel = carouselRef.current;
    const card = carousel?.children[index];
    if (!carousel || !card) return;
    pauseForInteraction();
    carousel.scrollTo({ left: card.offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
  };

  return (
    <main className={styles.gameHub}>
      <header className={styles.siteHeader}>
        <a className={styles.brandMark} href="/" aria-label="Veloop Games home">VELOOP<span>GAMES</span></a>
        <div className={styles.accountBalances} aria-label="Account balances">
          <span><img src="/assets/tokens/multi_token.png" alt="" />{tokens} <small>Tokens</small></span>
          <span><img src="/assets/tokens/game_coin.png" alt="" />{gameCoins} <small>Game Coins</small></span>
        </div>
      </header>

      <section className={styles.carouselSection} aria-labelledby="games-title">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>THE VELOOP ARCADE</p>
          <h1 id="games-title">Games</h1>
          <p>Explore games. Earn rewards.</p>
        </div>

        <div
          className={styles.carouselContainer}
          ref={carouselRef}
          onScroll={handleScroll}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={pauseForInteraction}
          onWheel={pauseForInteraction}
          onPointerDown={pauseForInteraction}
          role="region"
          aria-label="Games carousel"
          aria-roledescription="carousel"
        >
          {gamesData.map((game) => <GameCard key={game.id} game={game} />)}
        </div>

        <div className={styles.carouselFooter}>
          <div className={styles.dotIndicators} role="group" aria-label="Choose a game">
            {gamesData.map((game, index) => (
              <button
                key={game.id}
                type="button"
                className={`${styles.dot} ${activeIndex === index ? styles.activeDot : ''}`}
                onClick={() => showGame(index)}
                aria-label={`Show ${game.name}`}
                aria-current={activeIndex === index ? 'true' : undefined}
              />
            ))}
          </div>
          <span className={styles.carouselCount}>{String(activeIndex + 1).padStart(2, '0')} <i>/</i> {String(gamesData.length).padStart(2, '0')}</span>
        </div>
        <p className={styles.swipeHint}>Swipe to explore <span aria-hidden="true">→</span></p>
      </section>

      <footer className={styles.hubFooter}>
        <span>Every challenge starts at 20 Tokens</span>
        <span>Play well. Earn Game Coins.</span>
      </footer>
    </main>
  );
}