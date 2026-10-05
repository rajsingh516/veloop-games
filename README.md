# VELOOP Games

A responsive games hub and rewards prototype built with React and Vite. It contains 13 artwork-led game banners, two playable mini-games, a shared token/Game Coin account, and a five-category redemption center.

## Features

- Thirteen reusable game cards generated from `src/data/gamesData.js` and the supplied AVIF artwork.
- Horizontal, touch-scrollable carousel with autoplay, interaction pause, keyboard-accessible dot controls, and no navigation arrows.
- A coded 20-Token entry section and an infinite, reduced-motion-aware Play Now shimmer on playable cards.
- Two original playable challenges based on the supplied art: Bowlexa bowling (aim, power, and throws) and Cosmo Warrior space shooter (three lanes, hazards, shields, and fire controls). Both include first-play guides, score/timer gameplay, a one-time revive, and score-based Game Coin rewards.
- Shared tokens, Game Coins, inventories, completed guides, and recent redemptions persisted in browser local storage.
- Confirmation-based Game Coin conversions into VEs, SVEs, Gems, Tokens, and Spins, with balance validation and redemption history.
- Responsive light game screens and a dark games/rewards hub, designed for viewports from 320px and up.

## Technology

- React 19 and Vite
- React Router DOM
- React Context API
- CSS Modules
- Bootstrap CSS utilities

## Project Structure

```text
src/
├── components/games/
│   ├── GameCard.jsx
│   ├── GamesCarousel.jsx
│   ├── GameHome.jsx
│   └── GameRedeem.jsx
├── context/GameCoinContext.jsx
├── data/gamesData.js
├── styles/
│   ├── GamePlay.module.css
│   └── Games.module.css
├── App.jsx
└── main.jsx
public/assets/
├── games/       # 13 supplied AVIF game images
└── tokens/      # Source reward JPEGs and transparent PNG derivatives
```

## Routes

- `/` — Games carousel and account balances
- `/games/:gameId` — Selected game home, guide, play, and reward flow
- `/redeem` — Central Game Coin conversion center

The playable routes are `bowlexa` and `cosmo-warrior`. The mini-games use original web gameplay and supplied banner artwork; they do not reproduce third-party game code or characters.

## Asset Preparation

All 13 game banners are cropped to remove the embedded XP/Play Now footer and encoded as genuine AVIF files, with `object-fit: cover` in a consistent card ratio. The original JPEG image bytes are preserved under `asset-sources/games/`. The supplied token and reward JPEGs have black backgrounds, so transparent PNG derivatives are included and used by the interface; the source JPEGs remain unchanged. Game cards lazy-load their artwork.

## Account Data

For this frontend prototype, the account starts with 150 Tokens and 40 Game Coins. All changes are stored in this browser's local storage and are not real account transactions. A production deployment should replace this local state with server-validated balances, game sessions, scores, and rewards.

## Run Locally

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Create and locally preview a production build:

```sh
npm run build
npm run preview
```

Run lint checks:

```sh
npm run lint
```

## Deployment

The Vite app can be deployed to Vercel or Netlify using the standard Vite build command, `npm run build`, and output directory, `dist`.