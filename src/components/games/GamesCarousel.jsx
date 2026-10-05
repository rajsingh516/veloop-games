import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gamesData } from '../../data/gamesData';
import { useGameCoins } from '../../context/useGameCoins';
import GameCard from './GameCard';
import styles from '../../styles/Games.module.css';

const filters = ['All games', 'Playable', 'Coming soon'];

export default function GamesCarousel() {
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [search, setSearch] = useState('');
  const { tokens, gameCoins } = useGameCoins();
  const navigate = useNavigate();
  const featuredGame = gamesData.find((game) => game.mode === 'shooter') || gamesData.find((game) => game.playable);

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
            <div className={styles.gamesGrid}>
              {visibleGames.map((game, index) => <GameCard key={game.id} game={game} index={index} />)}
            </div>
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
