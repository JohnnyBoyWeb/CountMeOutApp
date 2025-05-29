export interface MathProblem {
  id: string;
  operation: Operation;
  difficulty: Difficulty;
  expression: string;
  displayExpression: string;
  answer: number;
  factors?: number[];
  isMultiStep?: boolean;
  timeGenerated: Date;
}

export interface PracticeSessionResult {
  problemsSolved: number;
  correctAnswers: number;
  accuracy: number;
  totalTime: number;
  averageTime: number;
  score: number;
  mode: PracticeMode;
  operation: Operation;
  difficulty: Difficulty;
}

export interface UserStats {
  totalProblems: number;
  totalCorrect: number;
  overallAccuracy: number;
  totalTime: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  bestAccuracy: number;
  fastestTime: number;
}

export interface DailyGoal {
  target: number;
  completed: number;
  percentage: number;
  isComplete: boolean;
}

export interface WeeklyProgress {
  date: string;
  problems: number;
  accuracy: number;
  time: number;
  streak: boolean;
}

export interface OperationStats {
  operation: Operation;
  totalProblems: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  bestTime: number;
  masteryLevel: MasteryLevel;
  recentSessions: PracticeSessionData[];
}

export interface AchievementRequirement {
  type: 'problems_solved' | 'accuracy' | 'streak' | 'speed' | 'operation_mastery' | 'session_count';
  value: number;
  operation?: Operation;
  mode?: PracticeMode;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  consecutive?: boolean;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface ExportData {
  version: string;
  exportDate: string;
  userData: {
    settings: UserSettings;
    progress: UserProgress[];
    sessions: PracticeSession[];
    achievements: Achievement[];
  };
  metadata: {
    totalSessions: number;
    totalProblems: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export interface ImportData extends ExportData {
  isValid: boolean;
  warnings?: string[];
  errors?: string[];
}

export interface ProgressTrend {
  date: string;
  accuracy: number;
  speed: number;
  volume: number;
  difficulty: number;
}

export interface LearningPattern {
  bestTimeOfDay: string;
  preferredDifficulty: Difficulty;
  strongestOperation: Operation;
  weakestOperation: Operation;
  improvementRate: number;
  consistencyScore: number;
}

export interface SessionAnalysis {
  strengthAreas: Operation[];
  improvementAreas: Operation[];
  recommendations: string[];
  nextGoals: string[];
  difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
}

export interface AccessibilitySettings {
  dyslexiaMode: boolean;
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface AudioSettings {
  soundEffects: boolean;
  voiceFeedback: boolean;
  voiceSpeed: number;
  voiceGender: 'male' | 'female' | 'auto';
  voiceLang: string;
  volume: number;
  enableVibration: boolean;
}

export interface PWAInstallation {
  canInstall: boolean;
  isInstalled: boolean;
  installPromptShown: boolean;
  installDate?: Date;
  installSource: 'browser' | 'homescreen' | 'standalone';
}

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'small' | 'medium' | 'large';
  supportsTouch: boolean;
  supportsVibration: boolean;
  supportsSpeech: boolean;
  supportsNotifications: boolean;
  isOnline: boolean;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  userAction?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Re-export types from other modules for convenience
export type {
  Operation,
  Difficulty,
  ProblemConfig
} from '@/lib/mathEngine';

export type {
  PracticeMode
} from '@/hooks/usePracticeSession';

export type {
  UserProgress,
  PracticeSession,
  Achievement,
  UserSettings,
  InsertUserProgress,
  InsertPracticeSession,
  InsertAchievement,
  InsertUserSettings
} from '@/lib/db';

// Utility types
export type MasteryLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export type PracticeSessionData = PracticeSession & {
  operationLabel: string;
  modeLabel: string;
  difficultyLabel: string;
};

export type ThemeMode = 'light' | 'dark' | 'system';

export type NavigationTab = 'dashboard' | 'practice' | 'progress' | 'achievements' | 'settings';

export type SortOrder = 'asc' | 'desc';

export type TimeFrame = 'day' | 'week' | 'month' | 'year' | 'all';

export type ComparisonPeriod = 'previous' | 'average' | 'best';

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Event types for analytics (if implemented)
export interface AnalyticsEvent {
  name: string;
  category: 'practice' | 'navigation' | 'achievement' | 'settings' | 'error';
  properties?: Record<string, any>;
  timestamp: Date;
  sessionId: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  isLoading: boolean;
  fallback?: React.ReactNode;
}

export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'slider' | 'switch';
  required?: boolean;
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helperText?: string;
  validation?: (value: any) => string | null;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Storage types
export interface StorageQuota {
  used: number;
  available: number;
  total: number;
  percentage: number;
}

export interface BackupData {
  version: string;
  created: Date;
  size: number;
  checksum: string;
  data: ExportData;
}
