import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/Games.module.css';

export default function GameCard({ game }) {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate(`/games/${game.route}`, { state: { game } });
  };

  return (
    <div className={styles.gameCard}>
      <div className={styles.imageContainer}>
        <img src={game.image} alt={game.name} className={styles.gameArtwork} loading="lazy" />
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.tokenRequirement}>
          <img src="/assets/tokens/multi_token.png" alt="Token" className={styles.tokenIcon} />
          <span>{game.cost} Tokens</span>
        </div>
        <button
          className={styles.playNowBtn}
          onClick={handlePlayClick}
          disabled={!game.playable}
          aria-label={game.playable ? `Play ${game.name}, entry fee ${game.cost} tokens` : `${game.name} coming soon`}
        >
          <span>{game.playable ? 'Play Now' : 'Coming Soon'}</span>
          {game.playable && <span className={styles.shimmerEffect} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}