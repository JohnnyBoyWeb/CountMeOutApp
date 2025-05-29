import { db, Achievement, PracticeSession, UserProgress } from './db';

export interface AchievementCheck {
  type: string;
  value: number;
  operator?: 'less' | 'greater' | 'equal';
  mode?: string;
  accuracy?: number;
  problems?: number;
}

export class AchievementEngine {
  private static instance: AchievementEngine;
  
  public static getInstance(): AchievementEngine {
    if (!AchievementEngine.instance) {
      AchievementEngine.instance = new AchievementEngine();
    }
    return AchievementEngine.instance;
  }

  async checkAchievements(sessionData?: PracticeSession): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];
    const allAchievements = await db.achievements.where('unlockedAt').equals(undefined).toArray();
    
    for (const achievement of allAchievements) {
      const requirement: AchievementCheck = JSON.parse(achievement.requirement);
      
      if (await this.checkRequirement(requirement, sessionData)) {
        achievement.unlockedAt = new Date();
        await db.achievements.update(achievement.id!, { unlockedAt: achievement.unlockedAt });
        unlockedAchievements.push(achievement);
      }
    }
    
    return unlockedAchievements;
  }

  private async checkRequirement(requirement: AchievementCheck, sessionData?: PracticeSession): Promise<boolean> {
    switch (requirement.type) {
      case 'problems_solved':
        return await this.checkTotalProblems(requirement.value);
      
      case 'session_accuracy':
        return sessionData ? sessionData.accuracy >= requirement.value : false;
      
      case 'avg_time':
        return await this.checkAverageTime(requirement.value, requirement.operator || 'less');
      
      case 'daily_streak':
        return await this.checkDailyStreak(requirement.value);
      
      case 'all_operations_mastered':
        return await this.checkOperationsMastery(requirement.value);
      
      case 'accuracy_streak':
        return await this.checkAccuracyStreak(requirement.accuracy!, requirement.problems!);
      
      case 'daily_time':
        return await this.checkDailyTime(requirement.value);
      
      case 'mode_problems':
        return await this.checkModeProblems(requirement.mode!, requirement.value);
      
      default:
        return false;
    }
  }

  private async checkTotalProblems(targetCount: number): Promise<boolean> {
    const totalProblems = await db.practiceSessions
      .toArray()
      .then(sessions => sessions.reduce((sum, session) => sum + session.problemsSolved, 0));
    
    return totalProblems >= targetCount;
  }

  private async checkAverageTime(targetTime: number, operator: string): Promise<boolean> {
    const sessions = await db.practiceSessions.toArray();
    
    if (sessions.length === 0) return false;
    
    const avgTime = sessions
      .filter(s => s.avgTimePerProblem)
      .reduce((sum, session, _, arr) => sum + (session.avgTimePerProblem! / arr.length), 0);
    
    switch (operator) {
      case 'less':
        return avgTime < targetTime;
      case 'greater':
        return avgTime > targetTime;
      case 'equal':
        return Math.abs(avgTime - targetTime) < 0.1;
      default:
        return false;
    }
  }

  private async checkDailyStreak(targetStreak: number): Promise<boolean> {
    const sessions = await db.practiceSessions.orderBy('completedAt').reverse().toArray();
    
    if (sessions.length === 0) return false;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const session of sessions) {
      const sessionDate = new Date(session.completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streak >= targetStreak;
  }

  private async checkOperationsMastery(targetOperations: number): Promise<boolean> {
    const operations = ['addition', 'subtraction', 'multiplication', 'division', 'percentage'];
    let masteredCount = 0;
    
    for (const operation of operations) {
      const progress = await db.userProgress
        .where('operation')
        .equals(operation)
        .first();
      
      if (progress && this.isOperationMastered(progress)) {
        masteredCount++;
      }
    }
    
    return masteredCount >= targetOperations;
  }

  private isOperationMastered(progress: UserProgress): boolean {
    // Consider mastered if accuracy > 90% and solved at least 50 problems
    const accuracy = progress.correctAnswers / Math.max(progress.problemsSolved, 1);
    return accuracy > 0.9 && progress.problemsSolved >= 50;
  }

  private async checkAccuracyStreak(targetAccuracy: number, targetProblems: number): Promise<boolean> {
    const recentSessions = await db.practiceSessions
      .orderBy('completedAt')
      .reverse()
      .limit(10)
      .toArray();
    
    let totalProblems = 0;
    let totalCorrect = 0;
    
    for (const session of recentSessions) {
      totalProblems += session.problemsSolved;
      totalCorrect += session.correctAnswers;
      
      if (totalProblems >= targetProblems) {
        const accuracy = (totalCorrect / totalProblems) * 100;
        return accuracy >= targetAccuracy;
      }
    }
    
    return false;
  }

  private async checkDailyTime(targetTime: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySessions = await db.practiceSessions
      .where('completedAt')
      .between(today, tomorrow)
      .toArray();
    
    const totalTime = todaySessions.reduce((sum, session) => sum + session.sessionTime, 0);
    return totalTime >= targetTime;
  }

  private async checkModeProblems(mode: string, targetCount: number): Promise<boolean> {
    const sessions = await db.practiceSessions
      .where('mode')
      .equals(mode)
      .toArray();
    
    const totalProblems = sessions.reduce((sum, session) => sum + session.problemsSolved, 0);
    return totalProblems >= targetCount;
  }

  async getUnlockedAchievements(): Promise<Achievement[]> {
    return await db.achievements
      .where('unlockedAt')
      .above(new Date(0))
      .toArray();
  }

  async getLockedAchievements(): Promise<Achievement[]> {
    return await db.achievements
      .where('unlockedAt')
      .equals(undefined)
      .toArray();
  }

  async getAchievementProgress(achievement: Achievement): Promise<{ current: number; target: number; percentage: number }> {
    const requirement: AchievementCheck = JSON.parse(achievement.requirement);
    
    switch (requirement.type) {
      case 'problems_solved': {
        const current = await db.practiceSessions
          .toArray()
          .then(sessions => sessions.reduce((sum, session) => sum + session.problemsSolved, 0));
        return {
          current,
          target: requirement.value,
          percentage: Math.min((current / requirement.value) * 100, 100)
        };
      }
      
      case 'mode_problems': {
        const current = await db.practiceSessions
          .where('mode')
          .equals(requirement.mode!)
          .toArray()
          .then(sessions => sessions.reduce((sum, session) => sum + session.problemsSolved, 0));
        return {
          current,
          target: requirement.value,
          percentage: Math.min((current / requirement.value) * 100, 100)
        };
      }
      
      case 'all_operations_mastered': {
        const operations = ['addition', 'subtraction', 'multiplication', 'division', 'percentage'];
        let masteredCount = 0;
        
        for (const operation of operations) {
          const progress = await db.userProgress
            .where('operation')
            .equals(operation)
            .first();
          
          if (progress && this.isOperationMastered(progress)) {
            masteredCount++;
          }
        }
        
        return {
          current: masteredCount,
          target: requirement.value,
          percentage: Math.min((masteredCount / requirement.value) * 100, 100)
        };
      }
      
      default:
        return { current: 0, target: 1, percentage: 0 };
    }
  }
}

export const achievementEngine = AchievementEngine.getInstance();
