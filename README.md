# 🎮 Firos Game Hub

> *Whenever life feels overwhelming, stressed, come here, play a little, and unwind.* — F

A beautiful, interactive game hub built with React, TypeScript, and Firebase. Play solo or with friends across devices in real-time multiplayer games.

---

## 🌟 About

Firos Game Hub is a passion project designed to provide a relaxing escape from the stresses of daily life. It's a place where you can unwind, challenge yourself, and have fun with friends—all in a beautifully crafted, responsive web experience.

**Why it was built:** To create a therapeutic gaming space that combines classic puzzle games with multiplayer features, allowing players to connect with friends seamlessly across devices.

---

## 🎯 Current Games

### 1. 🧩 **Crossword Puzzle**
A progressive crossword puzzle game with multiple levels and themes.

**Features:**
- 🎨 Theme-based puzzles with beautiful visual styles
- 📊 Multiple difficulty levels with progressive challenge
- 💡 Hint system to help when stuck
- 🏆 Level completion tracking and achievements
- 🗺️ Level map for easy navigation
- 🎵 Sound effects for correct/incorrect answers
- 📱 Fully responsive mobile design
- 🎭 Themed backgrounds (Nature, Cosmic, Ocean, etc.)

**How to Play:**
- Select from available levels
- Fill in words on the grid based on clues
- Use hints if needed
- Complete all words to move to the next level
- Track your progress through the level map

---

### 2. 🔢 **Number Guess Game**
Real-time multiplayer number guessing game where two players compete to guess each other's secret numbers.

**Features:**
- 👥 Cross-device multiplayer via Firebase
- 🔒 Secret number submission (0-100 range)
- 🌡️ Hot/Warm/Cold hints after 3 wrong guesses
- 📜 Round history showing all guesses and feedback
- 🏆 Win tracking and streak counters
- ⭐ Special celebration popups for 3-win streaks
- ⏰ Time-based speed bonuses
- 🎪 Multiple rounds support
- 📋 Real-time score updates
- 🔗 Room codes for easy sharing
- ✨ Automatic room code copying to clipboard

**How to Play:**
1. Create or join a room with a friend
2. Enter your secret number (0-100)
3. Wait for both players to be ready
4. Take turns guessing the opponent's number
5. Use hint feedback to narrow down guesses
6. Win by guessing correctly
7. Play multiple rounds with the same opponent

---

### 3. 🧠 **Memory Match Challenge**
Strategic card-matching game where players take turns flipping cards to find matching pairs.

**Features:**
- **Game Modes:**
  - Words: Synonyms (happy ↔ joyful) and antonyms (hot ↔ cold)
  - Numbers: Equations (2+2 ↔ 4) and sequences (1,2,3 ↔ 4)

- **Difficulty Levels:**
  - Easy: 4×4 grid (8 pairs)
  - Medium: 6×6 grid (18 pairs)
  - Hard: 6×6 grid (18 pairs, complex)

- **Gameplay:**
  - 🎮 Turn-based multiplayer
  - 🎯 Match pairs to score points
  - ⏱️ Speed bonuses for quick matches
  - 📊 Real-time score tracking
  - 🏅 Winner detection
  - 🔄 Play again functionality
  - ✨ Card flip animations
  - 🎪 Multiple rounds support

**How to Play:**
1. Select game mode (Words or Numbers)
2. Choose difficulty level
3. Create or join a room
4. Player 1 clicks "Start Game"
5. Take turns flipping cards
6. Match pairs to earn points (10 + speed bonus)
7. Continue until all pairs are matched
8. Player with most points wins

---

## 🛠️ Tech Stack

**Frontend:**
- React 18+ with TypeScript
- Vite for fast development and building
- CSS3 with gradients and glassmorphism effects
- Responsive design (mobile-first approach)

**Backend & Database:**
- Firebase Firestore for real-time data sync
- Firebase Authentication ready (for future expansion)

**Build & Development:**
- Vite 7.3+
- TypeScript 5+
- ESLint for code quality
- HMR (Hot Module Replacement) for fast refresh

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Firebase project with Firestore database

### Steps

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/firos-game-hub.git
cd firos-game-hub
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure Firebase:**
Create `src/firebaseConfig.ts`:
```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

4. **Start development server:**
```bash
npm run dev
```

5. **Build for production:**
```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Board.tsx              # Crossword grid component
│   ├── LetterCircle.tsx       # Letter input component
│   ├── HintButton.tsx         # Hint system
│   ├── LevelMap.tsx           # Level navigation
│   ├── WordInput.tsx          # Word submission
│   ├── NumberGuessGame.tsx    # Number guess multiplayer
│   └── MemoryMatchGame.tsx    # Memory match game
├── logic/
│   ├── generateGrid.ts        # Puzzle grid generation
│   ├── generateLevel.ts       # Level word generation
│   ├── gameLogic.ts           # Core game logic
│   └── sound.ts               # Sound effects
├── data/
│   ├── words.ts               # Word database
│   ├── words.txt              # Dictionary
│   ├── levels.ts              # Level definitions
│   └── dictionary.ts          # Word validation
├── App.tsx                    # Main app component
├── App.css                    # Global & component styles
└── main.tsx                   # Entry point
```

---

## 🚀 Current Features Summary

✅ **Crossword Puzzle:**
- Multiple themed levels
- Progressive difficulty
- Hint system
- Level tracking
- Theme customization

✅ **Number Guess Game:**
- Real-time multiplayer via Firebase
- Hot/Warm/Cold hints
- Round history
- Win streaks & statistics
- Automatic room code copying
- Multiple round support

✅ **Memory Match Challenge:**
- Two game modes (Words/Numbers)
- Three difficulty levels
- Turn-based multiplayer
- Speed bonuses
- Score tracking
- Smooth animations

✅ **General Features:**
- Responsive mobile design
- Beautiful UI with gradients
- Real-time multiplayer sync
- Toast notifications
- Sound effects (ready)
- Cross-device compatibility

---

## 🎯 Future Roadmap

### Short-term (Next Sprint)
- [ ] **Timer Mode** for Crossword (race against time)
- [ ] **Difficulty Scaling** for Crossword (reveal more/fewer letters)
- [ ] **Daily Challenges** across all games
- [ ] **Better Sound Design** when audio is enabled
- [ ] **Animated Card Flips** (3D flip effect for Memory game)

### Medium-term
- [ ] **User Accounts & Authentication** (Firebase Auth)
- [ ] **Leaderboards** (global and friend rankings)
- [ ] **Achievements System** (badges for milestones)
- [ ] **Statistics Dashboard** (win rates, streaks, playtime)
- [ ] **Word Chain Game** (new third multiplayer game)
- [ ] **Trivia Quiz Battle** (educational multiplayer mode)

### Long-term
- [ ] **Mobile App** (React Native or Flutter)
- [ ] **Spectator Mode** (watch friends play live)
- [ ] **Tournament Mode** (bracket-based competitions)
- [ ] **Power-ups & Special Items**
- [ ] **Customizable Player Profiles** with avatars
- [ ] **Social Features** (friend lists, chat)
- [ ] **Monetization** (optional cosmetics, no pay-to-win)

### Potential New Games
- **Word Chain** - Create words starting with last letter of previous word
- **Trivia Battle** - Multiple choice questions in real-time
- **Tic Tac Toe Ultimate** - 3×3 grid of tic tac toe games
- **20 Questions** - Deduction game
- **Rock Paper Scissors Tournament** - Best-of series

---

## 🎨 Design Philosophy

- **Therapeutic & Calming**: Soft gradients, glassmorphism, smooth animations
- **Inclusive**: Accessible design, responsive layouts, clear instructions
- **Engaging**: Rewarding feedback, celebratory popups, real-time updates
- **Mobile-First**: Optimized for phones, tablets, and desktops

---

## 📝 Game Rules & Tips

### Crossword Puzzle
- Type in words based on the clues
- Words are horizontal and vertical
- Intersecting letters must match
- Use hints sparingly for better scores

### Number Guess Game
- Range is always 0-100
- Hints appear after 3 wrong guesses
- Speed bonuses reward quick matches
- First to guess correctly wins the round
- Streaks reset if you lose

### Memory Match Challenge
- Each player gets one turn to flip 2 cards
- Match pairs of synonyms, antonyms, equations, or sequences
- 10 points per match + speed bonus
- Turns alternate unless you match
- Game ends when all pairs are found

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Creator

**Firos** - Built with ❤️ for everyone who needs a moment to unwind.

---

## 📞 Support & Feedback

Have feedback or suggestions? Feel free to reach out or open an issue on GitHub.

*Play, Enjoy, Unwind.* 🎮✨
