# VELOOP Games

A responsive VELOOP Rewards arcade built with React and Vite. It includes a 13-game library, two playable puzzle games, a token-based entry flow, persistent personal records, Game Coin rewards, and a redemption center.

Live demo:
https://veloop-games-i5zy9jrov-rajsingh8879-7203.vercel.app

## Features

- 13 reusable game cards generated from structured data and AVIF artwork
- Searchable, filterable game library with a featured challenge and responsive arcade layout
- Token-based entry requirement set to 20 Tokens per playable challenge
- Two playable puzzle games:
  - Word Hunt: timed adjacent-letter word search with a dictionary, word scoring, and duplicate protection
  - Merge Master: timed 2048-style puzzle with keyboard, WASD, swipe, and on-screen direction controls
- Bowlexa and Cosmo Warrior remain visible as coming-soon games
- First-time guide/tutorial flow before gameplay starts
- Score-based Game Coin rewards, per-game personal bests, and completed-round counts
- Centralized balances, game records, guides, and redemption history persisted in browser storage
- Redemption section for converting Game Coins into VEs, SVEs, Gems, Tokens, and Spins
- Responsive layout for mobile, tablet, and desktop devices

## Tech Stack

- React
- Vite
- React Router DOM
- React Context API
- CSS Modules
- Bootstrap utility classes

## Project Structure

```text
veloop-games/
├── public/
│   └── assets/
│       ├── games/
│       └── tokens/
├── src/
│   ├── components/
│   │   └── games/
│   ├── context/
│   ├── data/
│   ├── styles/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── asset-sources/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── .oxlintrc.json
├── README.md
└── package-lock.json
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Routes

- `/` — Games hub and account summary
- `/games/:gameId` — Game home, guide, play, and reward flow
- `/redeem` — Game Coin redemption center

## Notes

This project is a frontend prototype. The app uses local browser storage to simulate account balances, game records, and reward persistence for demo purposes. A production version would require backend integration for authentication, real token validation, and secure balance updates.

## Deployment

The app is deployed on Vercel and configured for a standard Vite build with the output directory set to `dist`.

## License

This project is for demonstration and portfolio purposes.

## Author

Raj Singh
