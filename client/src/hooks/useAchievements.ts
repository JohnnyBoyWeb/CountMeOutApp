import { useQuery, useQueryClient } from '@tanstack/react-query';
import { achievementEngine, AchievementEngine } from '@/lib/achievementEngine';
import { db, Achievement } from '@/lib/db';
import { useState, useEffect } from 'react';

export interface AchievementProgress {
  achievement: Achievement;
  current: number;
  target: number;
  percentage: number;
  isUnlocked: boolean;
}

export function useAchievements() {
  const queryClient = useQueryClient();
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Get all achievements with progress
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async (): Promise<AchievementProgress[]> => {
      const allAchievements = await db.achievements.toArray();
      
      const progressData = await Promise.all(
        allAchievements.map(async (achievement) => {
          const progress = await achievementEngine.getAchievementProgress(achievement);
          return {
            achievement,
            current: progress.current,
            target: progress.target,
            percentage: progress.percentage,
            isUnlocked: !!achievement.unlockedAt
          };
        })
      );

      return progressData.sort((a, b) => {
        // Sort by unlocked status, then by completion percentage
        if (a.isUnlocked !== b.isUnlocked) {
          return a.isUnlocked ? -1 : 1;
        }
        return b.percentage - a.percentage;
      });
    }
  });

  // Get unlocked achievements
  const { data: unlockedAchievements } = useQuery({
    queryKey: ['unlocked-achievements'],
    queryFn: () => achievementEngine.getUnlockedAchievements()
  });

  // Get locked achievements
  const { data: lockedAchievements } = useQuery({
    queryKey: ['locked-achievements'],
    queryFn: () => achievementEngine.getLockedAchievements()
  });

  // Get achievements by category
  const getAchievementsByCategory = (category: string) => {
    return achievements?.filter(a => a.achievement.category === category) || [];
  };

  // Get recent achievements (last 7 days)
  const getRecentAchievements = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return unlockedAchievements?.filter(
      a => a.unlockedAt && new Date(a.unlockedAt) > sevenDaysAgo
    ) || [];
  };

  // Get achievement stats
  const getAchievementStats = () => {
    if (!achievements) return { total: 0, unlocked: 0, percentage: 0 };
    
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.isUnlocked).length;
    const percentage = total > 0 ? (unlocked / total) * 100 : 0;
    
    return { total, unlocked, percentage };
  };

  // Check for new achievements (called after practice sessions)
  const checkForNewAchievements = async (sessionData?: any) => {
    try {
      const newAchievements = await achievementEngine.checkAchievements(sessionData);
      
      if (newAchievements.length > 0) {
        setNewlyUnlocked(newAchievements);
        queryClient.invalidateQueries({ queryKey: ['achievements'] });
        queryClient.invalidateQueries({ queryKey: ['unlocked-achievements'] });
        queryClient.invalidateQueries({ queryKey: ['locked-achievements'] });
        
        // Show notification for new achievements
        if ('Notification' in window && Notification.permission === 'granted') {
          newAchievements.forEach(achievement => {
            new Notification('Achievement Unlocked!', {
              body: achievement.name,
              icon: '/manifest.json' // You could use the achievement icon
            });
          });
        }
      }
      
      return newAchievements;
    } catch (error) {
      console.error('Failed to check achievements:', error);
      return [];
    }
  };

  // Dismiss newly unlocked achievements notification
  const dismissNewAchievements = () => {
    setNewlyUnlocked([]);
  };

  // Calculate mastery level based on achievements
  const getMasteryLevel = () => {
    const stats = getAchievementStats();
    
    if (stats.percentage >= 90) return { level: 'Master', color: 'text-yellow-500' };
    if (stats.percentage >= 75) return { level: 'Expert', color: 'text-purple-500' };
    if (stats.percentage >= 50) return { level: 'Advanced', color: 'text-blue-500' };
    if (stats.percentage >= 25) return { level: 'Intermediate', color: 'text-green-500' };
    return { level: 'Beginner', color: 'text-gray-500' };
  };

  return {
    achievements,
    unlockedAchievements,
    lockedAchievements,
    newlyUnlocked,
    isLoading,
    getAchievementsByCategory,
    getRecentAchievements,
    getAchievementStats,
    getMasteryLevel,
    checkForNewAchievements,
    dismissNewAchievements
  };
}

export function useAchievementCategories() {
  const { achievements } = useAchievements();
  
  const categories = achievements?.reduce((acc, achievement) => {
    const category = achievement.achievement.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, AchievementProgress[]>) || {};

  return {
    categories,
    categoryNames: Object.keys(categories),
    getCategoryStats: (category: string) => {
      const categoryAchievements = categories[category] || [];
      const total = categoryAchievements.length;
      const unlocked = categoryAchievements.filter(a => a.isUnlocked).length;
      return {
        total,
        unlocked,
        percentage: total > 0 ? (unlocked / total) * 100 : 0
      };
    }
  };
}
