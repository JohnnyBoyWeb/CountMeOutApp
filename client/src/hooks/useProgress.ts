import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db, UserProgress, PracticeSession } from '@/lib/db';
import { Operation, Difficulty } from '@/lib/mathEngine';

export interface ProgressStats {
  totalProblems: number;
  totalCorrect: number;
  overallAccuracy: number;
  totalTime: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  operationStats: Record<Operation, {
    problems: number;
    correct: number;
    accuracy: number;
    averageTime: number;
    mastery: number;
  }>;
  weeklyProgress: Array<{
    date: string;
    problems: number;
    accuracy: number;
    time: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    problems: number;
    accuracy: number;
    time: number;
  }>;
}

export interface DailyGoal {
  target: number;
  completed: number;
  percentage: number;
}

export function useProgress() {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  const { data: progressStats, isLoading, refetch } = useQuery({
    queryKey: ['progress-stats', timeframe],
    queryFn: async (): Promise<ProgressStats> => {
      const sessions = await db.practiceSessions.orderBy('completedAt').toArray();
      const progressRecords = await db.userProgress.toArray();

      // Calculate overall stats
      const totalProblems = sessions.reduce((sum, s) => sum + s.problemsSolved, 0);
      const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const overallAccuracy = totalProblems > 0 ? (totalCorrect / totalProblems) * 100 : 0;
      const totalTime = sessions.reduce((sum, s) => sum + s.sessionTime, 0);
      const averageTime = totalProblems > 0 ? totalTime / totalProblems : 0;

      // Calculate streak
      const { currentStreak, longestStreak } = calculateStreaks(sessions);

      // Calculate operation-specific stats
      const operationStats = calculateOperationStats(sessions, progressRecords);

      // Calculate weekly/monthly progress
      const weeklyProgress = calculateWeeklyProgress(sessions);
      const monthlyProgress = calculateMonthlyProgress(sessions);

      return {
        totalProblems,
        totalCorrect,
        overallAccuracy,
        totalTime,
        averageTime,
        currentStreak,
        longestStreak,
        operationStats,
        weeklyProgress,
        monthlyProgress
      };
    }
  });

  const { data: dailyGoal } = useQuery({
    queryKey: ['daily-goal'],
    queryFn: async (): Promise<DailyGoal> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaySessions = await db.practiceSessions
        .where('completedAt')
        .between(today, tomorrow)
        .toArray();

      const completed = todaySessions.reduce((sum, s) => sum + s.problemsSolved, 0);
      const target = 30; // Default daily goal
      const percentage = Math.min((completed / target) * 100, 100);

      return { target, completed, percentage };
    }
  });

  return {
    progressStats,
    dailyGoal,
    isLoading,
    timeframe,
    setTimeframe,
    refetch
  };
}

function calculateStreaks(sessions: PracticeSession[]) {
  if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Group sessions by date
  const sessionsByDate = new Map<string, PracticeSession[]>();
  sessions.forEach(session => {
    const date = new Date(session.completedAt).toDateString();
    if (!sessionsByDate.has(date)) {
      sessionsByDate.set(date, []);
    }
    sessionsByDate.get(date)!.push(session);
  });

  const dates = Array.from(sessionsByDate.keys()).sort();
  
  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toDateString();
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const date = dates[i];
    const daysDiff = Math.floor((new Date(today).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === currentStreak) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const date of dates) {
    const currentDate = new Date(date);
    
    if (lastDate && isConsecutiveDay(lastDate, currentDate)) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    lastDate = currentDate;
  }

  return { currentStreak, longestStreak };
}

function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function calculateOperationStats(sessions: PracticeSession[], progressRecords: UserProgress[]) {
  const operations: Operation[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage'];
  const stats: Record<Operation, any> = {} as any;

  operations.forEach(operation => {
    const operationSessions = sessions.filter(s => s.operation === operation);
    const problems = operationSessions.reduce((sum, s) => sum + s.problemsSolved, 0);
    const correct = operationSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const accuracy = problems > 0 ? (correct / problems) * 100 : 0;
    const totalTime = operationSessions.reduce((sum, s) => sum + s.sessionTime, 0);
    const averageTime = problems > 0 ? totalTime / problems : 0;
    
    // Calculate mastery (0-100 based on accuracy and problem count)
    const mastery = Math.min(accuracy * (Math.min(problems, 100) / 100), 100);

    stats[operation] = {
      problems,
      correct,
      accuracy,
      averageTime,
      mastery
    };
  });

  return stats;
}

function calculateWeeklyProgress(sessions: PracticeSession[]) {
  const weekData: Record<string, { problems: number; correct: number; time: number }> = {};
  
  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    weekData[dateKey] = { problems: 0, correct: 0, time: 0 };
  }

  sessions.forEach(session => {
    const dateKey = new Date(session.completedAt).toISOString().split('T')[0];
    if (weekData[dateKey]) {
      weekData[dateKey].problems += session.problemsSolved;
      weekData[dateKey].correct += session.correctAnswers;
      weekData[dateKey].time += session.sessionTime;
    }
  });

  return Object.entries(weekData).map(([date, data]) => ({
    date,
    problems: data.problems,
    accuracy: data.problems > 0 ? (data.correct / data.problems) * 100 : 0,
    time: data.time
  }));
}

function calculateMonthlyProgress(sessions: PracticeSession[]) {
  const monthData: Record<string, { problems: number; correct: number; time: number }> = {};
  
  // Get last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i, 1);
    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
    monthData[monthKey] = { problems: 0, correct: 0, time: 0 };
  }

  sessions.forEach(session => {
    const monthKey = new Date(session.completedAt).toISOString().slice(0, 7);
    if (monthData[monthKey]) {
      monthData[monthKey].problems += session.problemsSolved;
      monthData[monthKey].correct += session.correctAnswers;
      monthData[monthKey].time += session.sessionTime;
    }
  });

  return Object.entries(monthData).map(([month, data]) => ({
    month,
    problems: data.problems,
    accuracy: data.problems > 0 ? (data.correct / data.problems) * 100 : 0,
    time: data.time
  }));
}

export function useOperationProgress(operation: Operation, difficulty?: Difficulty) {
  return useQuery({
    queryKey: ['operation-progress', operation, difficulty],
    queryFn: async () => {
      let query = db.userProgress.where('operation').equals(operation);
      
      if (difficulty) {
        query = query.and(p => p.difficulty === difficulty);
      }

      const progressRecords = await query.toArray();
      const sessions = await db.practiceSessions
        .where('operation')
        .equals(operation)
        .toArray();

      return {
        progressRecords,
        sessions,
        totalProblems: progressRecords.reduce((sum, p) => sum + p.problemsSolved, 0),
        totalCorrect: progressRecords.reduce((sum, p) => sum + p.correctAnswers, 0),
        accuracy: progressRecords.length > 0 
          ? (progressRecords.reduce((sum, p) => sum + p.correctAnswers, 0) / 
             progressRecords.reduce((sum, p) => sum + p.problemsSolved, 0)) * 100
          : 0
      };
    }
  });
}
