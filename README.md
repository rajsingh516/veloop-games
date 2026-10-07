# VELOOP Games

A responsive VELOOP Rewards arcade built with React and Vite. It includes a 13-game library, two playable puzzle games, a token-based entry flow, persistent personal records, Game Coin rewards, and a redemption center.

Live demo:
https://veloop-games-i5zy9jrov-rajsingh8879-7203.vercel.app

## Features

- 13 artwork-led game banners generated from structured data and AVIF artwork
- Automatically scrolling horizontal carousel with seamless looping, touch/trackpad scrolling, mouse drag, wheel support, and game dots
- Carousel pauses for hover, keyboard focus, and direct interaction, and respects reduced-motion preferences
- Searchable, filterable game library with a featured challenge and responsive arcade layout
- Every banner communicates its 20 Token entry cost; unreleased games are clearly marked as coming soon
- Two playable puzzle games:
  - Word Hunt: 90-second, 8 × 8 word search with eight placed target words, tap or drag selection in every direction, scoring, and duplicate protection
  - Merge Master: untimed 2048 puzzle with keyboard, WASD, pointer swipe, and on-screen direction controls; reaching 2048 does not stop play
- First-time guide/tutorial flow before gameplay starts, with a replayable guide on each game home page
- Score-based Game Coin rewards, per-game personal bests, and completed-round counts
- Working one-time revive, round completion, and immediate centralized Game Coin balance updates
- Centralized balances, game records, guides, and redemption history persisted in browser storage
- Redemption section for converting Game Coins into VEs, SVEs, Gems, Tokens, and Spins
- Responsive layout and touch-sized controls for 320px+ mobile, tablet, laptop, and desktop screens

## Gameplay design references

Play Store references reviewed during implementation:

- [Word Search - Word Puzzle Game (Bluetile)](https://play.google.com/store/apps/details?id=com.playvalve.wsjourney)
- [2048 (Ketchapp)](https://play.google.com/store/apps/details?id=com.ketchapp.play2048)

The game screens use familiar, easy-to-learn puzzle conventions while keeping the supplied VELOOP artwork and rewards flow. The Play Store listings are design references only; this web prototype does not install or embed either app.

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

This project is a frontend prototype. The app uses local browser storage to simulate account balances, game records, and reward persistence for demo purposes. Only Word Hunt and Merge Master are playable; the other 11 banners are presented as coming soon. A production version would require backend integration for authentication, real token validation, and secure balance updates.

## Deployment

The app is deployed on Vercel and configured for a standard Vite build with the output directory set to `dist`.

## License

This project is for demonstration and portfolio purposes.

## Author

Raj Singh
