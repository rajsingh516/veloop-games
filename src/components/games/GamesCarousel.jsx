import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gamesData } from '../../data/gamesData';
import { useGameCoins } from '../../context/useGameCoins';
import GameCard from './GameCard';
import styles from '../../styles/Games.module.css';

const filters = ['All games', 'Playable', 'Coming soon'];

export default function GamesCarousel() {
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { tokens, gameCoins } = useGameCoins();
  const navigate = useNavigate();
  const viewportRef = useRef(null);
  const groupRefs = useRef([]);
  const interactionTimeoutRef = useRef(null);
  const dragRef = useRef(null);
  const featuredGame = gamesData.find((game) => game.playable);

  const visibleGames = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return gamesData.filter((game) => {
      const matchesFilter = activeFilter === 'All games'
        || (activeFilter === 'Playable' && game.playable)
        || (activeFilter === 'Coming soon' && !game.playable);
      const matchesSearch = !normalizedSearch
        || `${game.name} ${game.description}`.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const startGame = (game) => navigate(`/games/${game.route}`, { state: { game } });
  const carouselGroups = visibleGames.length > 2 ? [0, 1, 2] : [0];

  const pauseForInteraction = () => {
    window.clearTimeout(interactionTimeoutRef.current);
    setIsInteracting(true);
    interactionTimeoutRef.current = window.setTimeout(() => setIsInteracting(false), 4500);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const middleGroup = groupRefs.current[1];
    viewport.scrollLeft = middleGroup ? middleGroup.offsetLeft : 0;
    setActiveIndex(0);
    return undefined;
  }, [visibleGames]);

  useEffect(() => () => window.clearTimeout(interactionTimeoutRef.current), []);

  useEffect(() => {
    if (isHovering || isInteracting || visibleGames.length < 3) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const timer = window.setInterval(() => {
      const viewport = viewportRef.current;
      const cards = groupRefs.current[1]?.children;
      if (!viewport || !cards || cards.length < 2) return;
      const stride = cards[1].offsetLeft - cards[0].offsetLeft;
      viewport.scrollTo({ left: viewport.scrollLeft + stride, behavior: 'smooth' });
    }, 3600);

    return () => window.clearInterval(timer);
  }, [isHovering, isInteracting, visibleGames.length]);

  const updateCarouselPosition = () => {
    const viewport = viewportRef.current;
    const firstGroup = groupRefs.current[0];
    const middleGroup = groupRefs.current[1];
    if (!viewport || !firstGroup || !middleGroup || visibleGames.length < 3) return;

    const cycleWidth = middleGroup.offsetLeft - firstGroup.offsetLeft;
    const cards = middleGroup.children;
    if (!cycleWidth || cards.length < 2) return;

    let position = viewport.scrollLeft;
    if (position < cycleWidth * 0.5) {
      position += cycleWidth;
      viewport.scrollLeft = position;
    } else if (position >= cycleWidth * 1.5) {
      position -= cycleWidth;
      viewport.scrollLeft = position;
    }

    const stride = cards[1].offsetLeft - cards[0].offsetLeft;
    const nextIndex = Math.round((position - middleGroup.offsetLeft) / stride);
    setActiveIndex(((nextIndex % visibleGames.length) + visibleGames.length) % visibleGames.length);
  };

  const goToGame = (index) => {
    const viewport = viewportRef.current;
    const middleGroup = groupRefs.current[1] || groupRefs.current[0];
    const card = middleGroup?.children[index];
    if (!viewport || !card) return;
    pauseForInteraction();
    viewport.scrollTo({ left: middleGroup.offsetLeft + card.offsetLeft, behavior: 'smooth' });
  };

  const handlePointerDown = (event) => {
    pauseForInteraction();
    if (event.pointerType !== 'mouse' || event.button !== 0
      || event.target.closest('button, a, input')) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      moved: false
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 4) drag.moved = true;
    if (drag.moved) event.currentTarget.scrollLeft = drag.scrollLeft - distance;
  };

  const handlePointerUp = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setIsDragging(false);
    }
    pauseForInteraction();
  };

  const handleWheel = (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      event.currentTarget.scrollLeft += event.deltaY;
      pauseForInteraction();
    }
  };

  return (
    <main className={styles.gameHub}>
      <header className={styles.siteHeader}>
        <Link className={styles.brandMark} to="/" aria-label="Veloop Games home">
          <span className={styles.brandGlyph} aria-hidden="true">V</span>
          <span className={styles.brandWord}>VELOOP<span>ARCADE</span></span>
        </Link>
        <nav className={styles.headerNav} aria-label="Main navigation">
          <a href="#library" className={styles.headerLink}>Discover</a>
          <Link to="/redeem" className={styles.headerLink}>Rewards</Link>
        </nav>
        <div className={styles.accountBalances} aria-label="Account balances">
          <span><img src="/assets/tokens/multi_token.png" alt="" /><strong>{tokens}</strong><small>Tokens</small></span>
          <Link to="/redeem" aria-label={`${gameCoins} Game Coins. Open rewards`}>
            <img src="/assets/tokens/game_coin.png" alt="" /><strong>{gameCoins}</strong><small>Coins</small><i aria-hidden="true">↗</i>
          </Link>
        </div>
      </header>

      <div className={styles.hubContent}>
        <section className={styles.welcomeBar} aria-label="Welcome">
          <div>
            <p className={styles.sectionEyebrow}><span className={styles.liveDot} /> THE VELOOP ARCADE</p>
            <h1>Your next <span>high score</span> starts here.</h1>
            <p className={styles.welcomeCopy}>Pick a challenge, jump in, and turn every round into rewards.</p>
          </div>
          <div className={styles.welcomeMeta}>
            <span className={styles.metaIcon} aria-hidden="true">✦</span>
            <span><strong>{gamesData.filter((game) => game.playable).length} games</strong><small>ready to play</small></span>
          </div>
        </section>

        {featuredGame && (
          <section className={styles.featuredGame} aria-label="Featured game">
            <img className={styles.featuredArtwork} src={featuredGame.image} alt="" />
            <div className={styles.featuredOverlay} />
            <div className={styles.featuredContent}>
              <span className={styles.featuredLabel}><span /> FEATURED CHALLENGE</span>
              <h2>{featuredGame.name}</h2>
              <p>{featuredGame.description}</p>
              <div className={styles.featuredActions}>
                <button className={styles.featuredPlay} onClick={() => startGame(featuredGame)}>
                  Play now <span aria-hidden="true">↗</span>
                </button>
                <span className={styles.featuredCost}>
                  <img src="/assets/tokens/multi_token.png" alt="" /> {featuredGame.cost} tokens to enter
                </span>
              </div>
            </div>
            <div className={styles.featuredIndex} aria-hidden="true">01 <span>/ ARCADE PICK</span></div>
          </section>
        )}

        <section className={styles.librarySection} id="library" aria-labelledby="library-title">
          <div className={styles.libraryHeading}>
            <div>
              <p className={styles.sectionEyebrow}>FIND YOUR NEXT GAME</p>
              <h2 id="library-title">Explore the arcade</h2>
            </div>
            <label className={styles.searchBox}>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search games"
                aria-label="Search games"
              />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search">×</button>}
            </label>
          </div>

          <div className={styles.libraryToolbar}>
            <div className={styles.filterTabs} role="tablist" aria-label="Filter games">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter}
                  className={activeFilter === filter ? styles.activeFilter : ''}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                  {filter === 'Playable' && <span>{gamesData.filter((game) => game.playable).length}</span>}
                </button>
              ))}
            </div>
            <span className={styles.resultCount}>{visibleGames.length} {visibleGames.length === 1 ? 'game' : 'games'}</span>
          </div>

          {visibleGames.length > 0 ? (
            <>
              <div
                ref={viewportRef}
                className={`${styles.carouselViewport} ${isDragging ? styles.carouselDragging : ''}`}
                role="region"
                aria-label="Game banners"
                aria-roledescription="carousel"
                onScroll={updateCarouselPosition}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onFocusCapture={() => setIsHovering(true)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setIsHovering(false);
                }}
              >
                <div className={styles.carouselTrack}>
                  {carouselGroups.map((group) => (
                    <div
                      className={styles.carouselSet}
                      key={`carousel-set-${group}`}
                      aria-hidden={carouselGroups.length > 1 && group !== 1}
                      ref={(node) => { groupRefs.current[group] = node; }}
                    >
                      {visibleGames.map((game, index) => (
                        <GameCard
                          key={`${group}-${game.id}`}
                          game={game}
                          index={index}
                          isClone={carouselGroups.length > 1 && group !== 1}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.carouselFooter}>
                <span className={styles.carouselHint}>Swipe, drag or scroll to explore · Auto-playing</span>
                <div className={styles.carouselIndicators} aria-label="Choose a game">
                  {visibleGames.map((game, index) => (
                    <button
                      key={game.id}
                      type="button"
                      className={`${styles.carouselDot} ${activeIndex === index ? styles.activeCarouselDot : ''}`}
                      aria-label={`Show ${game.name}`}
                      aria-current={activeIndex === index ? 'true' : undefined}
                      onClick={() => goToGame(index)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptySearch}>
              <span aria-hidden="true">⌕</span>
              <strong>No games found</strong>
              <p>Try a different search or browse all games.</p>
              <button type="button" onClick={() => { setSearch(''); setActiveFilter('All games'); }}>Clear filters</button>
            </div>
          )}
        </section>

        <footer className={styles.hubFooter}>
          <span>Every round is a new chance to level up.</span>
          <Link to="/redeem">Turn coins into rewards <span aria-hidden="true">↗</span></Link>
        </footer>
      </div>
    </main>
  );
}
