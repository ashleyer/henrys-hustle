/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LeaderboardRecord {
  id: string;
  playerName: string;
  avatar: string;
  score: number;
  distance: number;
  stationReached: string;
  outfitName: string;
  timestamp: number;
  dateStr: string;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  picture: string;
  isLoggedIn: boolean;
  isGoogleAccount: boolean;
  highScore: number;
  starsInBank: number;
  boardsAvailable: number;
  characterProfile: {
    hairStyle: string;
    hairColor: string;
    skinTone: string;
    eyeColor: string;
    headbandColor: string;
    outfitId: string;
    shoesColor: string;
  };
  unlockedOutfits: string[];
}

// In-memory + persistent fallback store
const DATA_DIR = path.join(__dirname, '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function loadJSON<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {
    // Ignore read error
  }
  return fallback;
}

function saveJSON(filePath: string, data: unknown) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignore write error
  }
}

// Initial Boston T Championship Leaderboard
const initialLeaderboard: LeaderboardRecord[] = [
  {
    id: 'lead_1',
    playerName: 'Henry Champion #7',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Henry7',
    score: 14850,
    distance: 2150,
    stationReached: 'Aquarium & Boston Harbor',
    outfitName: 'Boston T Conductor Gymnast',
    timestamp: Date.now() - 3600000,
    dateStr: 'Today',
  },
  {
    id: 'lead_2',
    playerName: 'Fenway Flyer',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fenway',
    score: 11200,
    distance: 1650,
    stationReached: 'Harvard Square',
    outfitName: 'Fenway Green Monster',
    timestamp: Date.now() - 7200000,
    dateStr: 'Today',
  },
  {
    id: 'lead_3',
    playerName: 'Ashley in 02116',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ashley02116',
    score: 9800,
    distance: 1300,
    stationReached: 'Charles / MGH',
    outfitName: 'Olympic Gold',
    timestamp: Date.now() - 14400000,
    dateStr: 'Yesterday',
  },
  {
    id: 'lead_4',
    playerName: 'Paul Revere Runner',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PaulRevere',
    score: 7450,
    distance: 1000,
    stationReached: 'Kenmore & Fenway',
    outfitName: 'Freedom Trail Pioneer',
    timestamp: Date.now() - 86400000,
    dateStr: '2 days ago',
  },
  {
    id: 'lead_5',
    playerName: 'Back Bay Acrobat',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BackBay',
    score: 5900,
    distance: 750,
    stationReached: 'Copley Square Station (02116)',
    outfitName: 'Team Henry #7',
    timestamp: Date.now() - 172800000,
    dateStr: '3 days ago',
  },
];

let leaderboard: LeaderboardRecord[] = loadJSON(LEADERBOARD_FILE, initialLeaderboard);
let users: Record<string, UserRecord> = loadJSON(USERS_FILE, {});

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API ROUTES ---

  // 1. Leaderboard: Get all players
  app.get('/api/leaderboard', (_req: Request, res: Response) => {
    // Sort descending by score
    const sorted = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 50);
    res.json({ leaderboard: sorted });
  });

  // 2. Leaderboard: Submit score
  app.post('/api/leaderboard', (req: Request, res: Response) => {
    const { playerName, avatar, score, distance, stationReached, outfitName } = req.body;
    if (!playerName || typeof score !== 'number') {
      res.status(400).json({ error: 'Invalid score submission' });
      return;
    }

    const newRecord: LeaderboardRecord = {
      id: `score_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      playerName: String(playerName).slice(0, 30),
      avatar: avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(playerName),
      score: Math.max(0, Math.floor(score)),
      distance: Math.max(0, Math.floor(distance || 0)),
      stationReached: stationReached || 'Park Street Station',
      outfitName: outfitName || 'Team Henry #7',
      timestamp: Date.now(),
      dateStr: 'Just now',
    };

    leaderboard.push(newRecord);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 100);
    saveJSON(LEADERBOARD_FILE, leaderboard);

    res.json({ success: true, record: newRecord });
  });

  // 3. User Login: Google OAuth token handler or Guest login
  app.post('/api/auth/google', (req: Request, res: Response) => {
    const { credential, email, name, picture } = req.body;

    // Decode or accept verified payload
    let userId = '';
    let userName = name || 'Boston Gymnast';
    let userEmail = email || '';
    let userPic = picture || '';

    if (credential) {
      try {
        // Parse Google JWT claims (base64url)
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          userId = payload.sub || `google_${Date.now()}`;
          userEmail = payload.email || userEmail;
          userName = payload.name || userName;
          userPic = payload.picture || userPic;
        }
      } catch {
        userId = `google_${Date.now()}`;
      }
    } else {
      userId = `google_${Date.now()}`;
    }

    if (!userPic) {
      userPic = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`;
    }

    // Retrieve or create user record
    let user = users[userId];
    if (!user) {
      user = {
        id: userId,
        name: userName,
        email: userEmail,
        picture: userPic,
        isLoggedIn: true,
        isGoogleAccount: true,
        highScore: 0,
        starsInBank: 100, // Welcome star bonus for signing in!
        boardsAvailable: 5,
        characterProfile: {
          hairStyle: 'SPIKY',
          hairColor: '#7c4722',
          skinTone: '#ffdfc4',
          eyeColor: '#0284c7',
          headbandColor: '#f59e0b',
          outfitId: 'boston_t_conductor',
          shoesColor: '#ef4444',
        },
        unlockedOutfits: ['boston_t_conductor', 'team_henry'],
      };
      users[userId] = user;
      saveJSON(USERS_FILE, users);
    } else {
      user.isLoggedIn = true;
      user.name = userName;
      user.picture = userPic;
    }

    res.json({ success: true, user });
  });

  // 4. Save User Character & Progress
  app.post('/api/user/save', (req: Request, res: Response) => {
    const { userId, characterProfile, starsInBank, highScore, boardsAvailable, unlockedOutfits } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'Missing userId' });
      return;
    }

    let user = users[userId];
    if (!user) {
      user = {
        id: userId,
        name: 'Boston Gymnast',
        email: '',
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userId)}`,
        isLoggedIn: true,
        isGoogleAccount: false,
        highScore: highScore || 0,
        starsInBank: starsInBank || 0,
        boardsAvailable: boardsAvailable || 3,
        characterProfile: characterProfile || {},
        unlockedOutfits: unlockedOutfits || ['boston_t_conductor', 'team_henry'],
      };
      users[userId] = user;
    } else {
      if (characterProfile) user.characterProfile = characterProfile;
      if (typeof starsInBank === 'number') user.starsInBank = starsInBank;
      if (typeof highScore === 'number') user.highScore = Math.max(user.highScore, highScore);
      if (typeof boardsAvailable === 'number') user.boardsAvailable = boardsAvailable;
      if (Array.isArray(unlockedOutfits)) user.unlockedOutfits = unlockedOutfits;
    }

    saveJSON(USERS_FILE, users);
    res.json({ success: true, user });
  });

  // 5. Get User Data
  app.get('/api/user/:userId', (req: Request, res: Response) => {
    const user = users[req.params.userId];
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // Mount Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Henry's Hub Hustle Server running on http://localhost:${PORT}`);
  });
}

startServer();
