import Dexie, { Table } from 'dexie';

export interface UserProgress {
  id?: number;
  operation: string;
  difficulty: string;
  problemsSolved: number;
  correctAnswers: number;
  totalTime: number;
  bestTime?: number;
  streak: number;
  lastPracticed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeSession {
  id?: number;
  mode: string;
  operation: string;
  difficulty: string;
  problemsSolved: number;
  correctAnswers: number;
  sessionTime: number;
  accuracy: number;
  avgTimePerProblem?: number;
  completedAt: Date;
}

export interface Achievement {
  id?: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
  unlockedAt?: Date;
}

export interface UserSettings {
  id?: number;
  dyslexiaMode: boolean;
  highContrast: boolean;
  largeText: boolean;
  soundEffects: boolean;
  voiceFeedback: boolean;
  voiceSpeed: number;
  darkMode: boolean;
  updatedAt: Date;
}

export class CountMeOutDB extends Dexie {
  userProgress!: Table<UserProgress>;
  practiceSessions!: Table<PracticeSession>;
  achievements!: Table<Achievement>;
  userSettings!: Table<UserSettings>;

  constructor() {
    super('CountMeOutDB');
    
    this.version(1).stores({
      userProgress: '++id, operation, difficulty, lastPracticed',
      practiceSessions: '++id, mode, operation, completedAt',
      achievements: '++id, category, unlockedAt',
      userSettings: '++id'
    });
  }
}

export const db = new CountMeOutDB();

// Initialize default achievements
export const defaultAchievements: Omit<Achievement, 'id' | 'unlockedAt'>[] = [
  {
    name: "First Steps",
    description: "Complete your first problem",
    icon: "🎯",
    category: "milestone",
    requirement: JSON.stringify({ type: "problems_solved", value: 1 })
  },
  {
    name: "Perfect Score",
    description: "Get 100% accuracy in a session",
    icon: "🎖️",
    category: "accuracy",
    requirement: JSON.stringify({ type: "session_accuracy", value: 100 })
  },
  {
    name: "Speed Demon",
    description: "Average under 2 seconds per problem",
    icon: "⚡",
    category: "speed",
    requirement: JSON.stringify({ type: "avg_time", value: 2, operator: "less" })
  },
  {
    name: "Hot Streak",
    description: "Practice 7 days in a row",
    icon: "🔥",
    category: "streak",
    requirement: JSON.stringify({ type: "daily_streak", value: 7 })
  },
  {
    name: "Century Club",
    description: "Solve 100 problems",
    icon: "💯",
    category: "milestone",
    requirement: JSON.stringify({ type: "problems_solved", value: 100 })
  },
  {
    name: "Math Master",
    description: "Master all 5 operations",
    icon: "👑",
    category: "milestone",
    requirement: JSON.stringify({ type: "all_operations_mastered", value: 5 })
  },
  {
    name: "Accuracy Ace",
    description: "Maintain 95% accuracy over 50 problems",
    icon: "🎯",
    category: "accuracy",
    requirement: JSON.stringify({ type: "accuracy_streak", accuracy: 95, problems: 50 })
  },
  {
    name: "Marathon Runner",
    description: "Practice for 1 hour in a single day",
    icon: "🏃",
    category: "milestone",
    requirement: JSON.stringify({ type: "daily_time", value: 3600 })
  },
  {
    name: "Audio Expert",
    description: "Complete 20 problems in audio-only mode",
    icon: "🎧",
    category: "milestone",
    requirement: JSON.stringify({ type: "mode_problems", mode: "audio", value: 20 })
  },
  {
    name: "Lightning Fast",
    description: "Average under 1 second per problem",
    icon: "⚡",
    category: "speed",
    requirement: JSON.stringify({ type: "avg_time", value: 1, operator: "less" })
  }
];

// Initialize database with default data
export async function initializeDB() {
  try {
    await db.open();
    
    // Check if achievements are already initialized
    const achievementCount = await db.achievements.count();
    if (achievementCount === 0) {
      await db.achievements.bulkAdd(defaultAchievements);
    }
    
    // Initialize default settings if none exist
    const settingsCount = await db.userSettings.count();
    if (settingsCount === 0) {
      await db.userSettings.add({
        dyslexiaMode: false,
        highContrast: false,
        largeText: false,
        soundEffects: true,
        voiceFeedback: true,
        voiceSpeed: 1.0,
        darkMode: false,
        updatedAt: new Date()
      });
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}
