import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameCoins } from '../../context/useGameCoins';
import styles from '../../styles/Games.module.css';

export default function GameCard({ game, index = 0, isClone = false }) {
  const navigate = useNavigate();
  const { tokens } = useGameCoins();
  const hasEntryTokens = tokens >= game.cost;
  const variant = game.route === 'word-hunt' ? 'word-hunt' : game.route === 'merge-master' ? 'merge-master' : 'default';
  const palette = {
    'toilet-tactics': { a: '#ff8c55', b: '#ff4d6d', c: '#ffe29a' },
    'word-hunt': { a: '#61dafb', b: '#7a5cff', c: '#d7ff8a' },
    'merge-master': { a: '#4fe1c1', b: '#2b9dff', c: '#f9e79f' },
    default: { a: '#d7bd82', b: '#8a74ff', c: '#f0f4ff' }
  }[game.route] || { a: '#d7bd82', b: '#8a74ff', c: '#f0f4ff' };
  const cardVariantClass = variant === 'word-hunt' ? 'wordHuntCard' : variant === 'merge-master' ? 'mergeMasterCard' : '';
  const variantBadge = variant === 'word-hunt' ? 'WORD HUNT' : variant === 'merge-master' ? '2048 RUSH' : 'ARCADE';
  const variantDescriptor = variant === 'word-hunt' ? 'Hidden words' : variant === 'merge-master' ? 'Tile fusion' : 'Challenge';

  const handlePlayClick = () => {
    if (!game.playable) return;
    if (!hasEntryTokens) {
      navigate('/redeem', { state: { returnTo: `/games/${game.route}` } });
      return;
    }
    navigate(`/games/${game.route}`, { state: { game } });
  };

  return (
    <article
      className={`${styles.gameCard} ${cardVariantClass ? styles[cardVariantClass] : ''}`.trim()}
      style={{
        '--card-order': index,
        '--card-tone-a': palette.a,
        '--card-tone-b': palette.b,
        '--card-tone-c': palette.c
      }}
    >
      <button
        className={styles.cardArtwork}
        type="button"
        onClick={handlePlayClick}
        disabled={!game.playable}
        tabIndex={isClone ? -1 : undefined}
        aria-label={game.playable ? `View ${game.name}` : `${game.name}, coming soon`}
      >
        <img src={game.image} alt="" loading="lazy" />
        {variant !== 'default' && (
          <span className={styles.cardVariantBadge}>{variantBadge}</span>
        )}
        <span className={styles.cardVariantDescriptor}>{variantDescriptor}</span>
        <span className={`${styles.availabilityBadge} ${game.playable ? styles.availableBadge : ''}`}>
          <span />{game.playable ? 'PLAY NOW' : 'COMING SOON'}
        </span>
        <span className={styles.cardArrow} aria-hidden="true">{game.playable ? '↗' : '✦'}</span>
      </button>
      <div className={styles.cardDetails}>
        <div className={styles.cardTitleRow}>
          <h3>{game.name}</h3>
          <span className={styles.gameNumber}>{String(game.id).padStart(2, '0')}</span>
        </div>
        <p>{game.description}</p>
        <div className={styles.cardFooter}>
          <span className={styles.tokenRequirement}>
            <img src="/assets/tokens/multi_token.png" alt="" />
            <strong>{game.cost}</strong> tokens
          </span>
          <button
            className={styles.playNowBtn}
            onClick={handlePlayClick}
            disabled={!game.playable}
            tabIndex={isClone ? -1 : undefined}
            aria-label={!game.playable
              ? `${game.name} is coming soon`
              : hasEntryTokens ? `Play ${game.name}` : `Get tokens to play ${game.name}`}
          >
            <span className={styles.playNowLabel}>
              {!game.playable ? 'Coming soon' : hasEntryTokens ? 'Play now' : 'Get tokens'}
            </span>
            <span aria-hidden="true">{game.playable ? '→' : '✦'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
