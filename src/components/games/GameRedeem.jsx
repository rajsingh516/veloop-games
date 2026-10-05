import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameCoins } from '../../context/useGameCoins';
import styles from '../../styles/Games.module.css';

const rewards = [
  { type: 'VEs', title: 'Veloop Energy', cost: 100, amount: 10, image: '/assets/tokens/multi_VEs.png' },
  { type: 'SVEs', title: 'Silver Veloop Energy', cost: 150, amount: 10, image: '/assets/tokens/multi_SVEs.png' },
  { type: 'Gems', title: 'Gems', cost: 50, amount: 25, image: '/assets/tokens/multi_gems.png' },
  { type: 'Tokens', title: 'Entry Tokens', cost: 60, amount: 20, image: '/assets/tokens/multi_token.png' },
  { type: 'Spins', title: 'Reward Spins', cost: 80, amount: 1, image: '/assets/tokens/signle_spin.png' }
];

const getHistoryDate = (date) => {
  const elapsedDays = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (elapsedDays < 1) return 'Today';
  if (elapsedDays === 1) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(date));
};

export default function GameRedeem() {
  const { gameCoins, userInventory, redeemCurrency, redemptionHistory } = useGameCoins();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedReward, setSelectedReward] = useState(null);
  const [status, setStatus] = useState('');

  const handleConfirm = () => {
    if (!selectedReward) return;
    if (!redeemCurrency(selectedReward.type, selectedReward.cost, selectedReward.amount)) {
      setStatus('Your Game Coin balance changed. Choose a reward within your current balance.');
      return;
    }

    setStatus(`${selectedReward.amount} ${selectedReward.type} added to your rewards balance.`);
    setSelectedReward(null);
  };

  return (
    <main className={styles.redeemPageDark}>
      <header className={styles.redeemHeader}>
        <button className={styles.backBtn} onClick={() => navigate(location.state?.returnTo || '/')}>← Back</button>
        <a className={styles.brandMark} href="/" aria-label="Veloop Games home">VELOOP<span>GAMES</span></a>
        <div className={styles.balanceDisplay}>
          <img src="/assets/tokens/game_coin.png" alt="" />
          <span><strong>{gameCoins}</strong><small>Game Coins</small></span>
        </div>
      </header>

      <section className={styles.redeemContent} aria-labelledby="redeem-title">
        <p className={styles.sectionEyebrow}>YOUR REWARDS</p>
        <h1 id="redeem-title">Game Coin exchange</h1>
        <p className={styles.redeemIntro}>Turn your play into rewards. Choose a conversion to review before confirming.</p>

        {status && <div className={styles.redeemStatus} role="status">{status}<button onClick={() => setStatus('')} aria-label="Dismiss message">×</button></div>}

        <div className={styles.inventoryGrid}>
          {rewards.map((reward) => (
            <article className={styles.invCard} key={reward.type}>
              <div className={styles.rewardCardTop}>
                <img className={styles.rewardArt} src={reward.image} alt="" />
                <span className={styles.rewardBalance}>{userInventory[reward.type]} owned</span>
              </div>
              <p className={styles.rewardType}>{reward.type}</p>
              <h2>{reward.title}</h2>
              <p className={styles.conversionRate}>{reward.cost} Game Coins <span aria-hidden="true">→</span> {reward.amount} {reward.type}</p>
              <button className={styles.redeemAction} onClick={() => { setStatus(''); setSelectedReward(reward); }}>
                Review exchange <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>

        <section className={styles.historySection} aria-labelledby="history-title">
          <div className={styles.historyHeading}>
            <div><p className={styles.sectionEyebrow}>YOUR ACTIVITY</p><h2 id="history-title">Recent redemptions</h2></div>
            <span>{redemptionHistory.length} of 10</span>
          </div>
          {redemptionHistory.length === 0 ? (
            <p className={styles.emptyHistory}>Your confirmed exchanges will appear here.</p>
          ) : (
            <ul className={styles.historyList}>
              {redemptionHistory.map((entry) => (
                <li key={entry.id}>
                  <span><img src="/assets/tokens/game_coin.png" alt="" />{entry.cost} Game Coins <i>→</i> {entry.reward} {entry.type}</span>
                  <time dateTime={entry.date}>{getHistoryDate(entry.date)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      {selectedReward && (
        <div className={styles.modalOverlay}>
          <section className={styles.confirmModal} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <p className={styles.sectionEyebrow}>CONFIRM EXCHANGE</p>
            <h2 id="confirm-title">Redeem Game Coins?</h2>
            <p>You are exchanging <strong>{selectedReward.cost} Game Coins</strong> for <strong>{selectedReward.amount} {selectedReward.type}</strong>.</p>
            <p className={styles.balanceAfter}>Balance after exchange <strong>{Math.max(0, gameCoins - selectedReward.cost)} Game Coins</strong></p>
            {gameCoins < selectedReward.cost ? (
              <div className={styles.insufficientNotice} role="alert">
                <strong>Not enough Game Coins</strong>
                <span>You have {gameCoins}; this exchange needs {selectedReward.cost}. Play a game to earn more.</span>
              </div>
            ) : (
              <div className={styles.confirmActions}>
                <button className={styles.cancelAction} onClick={() => setSelectedReward(null)}>Cancel</button>
                <button className={styles.redeemAction} onClick={handleConfirm}>Confirm exchange</button>
              </div>
            )}
            {gameCoins < selectedReward.cost && (
              <div className={styles.confirmActions}>
                <button className={styles.cancelAction} onClick={() => setSelectedReward(null)}>Close</button>
                <button className={styles.redeemAction} onClick={() => navigate('/')}>Play Games</button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}