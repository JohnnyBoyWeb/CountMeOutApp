import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AchievementBadge } from '@/components/AchievementBadge';
import { useAchievements, useAchievementCategories } from '@/hooks/useAchievements';
import { Trophy, Star, Target, Zap, Medal, Lock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons = {
  accuracy: Target,
  speed: Zap,
  streak: Star,
  milestone: Medal,
  default: Trophy
};

const categoryColors = {
  accuracy: 'text-emerald-600 dark:text-emerald-400',
  speed: 'text-amber-600 dark:text-amber-400',
  streak: 'text-purple-600 dark:text-purple-400',
  milestone: 'text-blue-600 dark:text-blue-400',
  default: 'text-primary'
};

export default function Achievements() {
  const { 
    achievements, 
    unlockedAchievements, 
    lockedAchievements, 
    newlyUnlocked,
    isLoading,
    getAchievementsByCategory,
    getRecentAchievements,
    getAchievementStats,
    getMasteryLevel,
    dismissNewAchievements
  } = useAchievements();

  const { categories, categoryNames, getCategoryStats } = useAchievementCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const achievementStats = getAchievementStats();
  const masteryLevel = getMasteryLevel();
  const recentAchievements = getRecentAchievements();

  const getFilteredAchievements = () => {
    if (!achievements) return [];
    if (selectedCategory === 'all') return achievements;
    return achievements.filter(a => a.achievement.category === selectedCategory);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 animate-pulse"></div>
          <div className="w-48 h-6 bg-muted rounded mx-auto mb-2 animate-pulse"></div>
          <div className="w-64 h-4 bg-muted rounded mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Your Achievements</h1>
        <p className="text-muted-foreground">
          Unlock badges as you improve your mental math skills
        </p>
      </div>

      {/* Newly Unlocked Banner */}
      {newlyUnlocked.length > 0 && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Trophy className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">New Achievement{newlyUnlocked.length > 1 ? 's' : ''} Unlocked!</h2>
                <div className="space-y-1">
                  {newlyUnlocked.map((achievement) => (
                    <p key={achievement.id} className="text-amber-100">
                      🎉 <strong>{achievement.name}</strong> - {achievement.description}
                    </p>
                  ))}
                </div>
              </div>
              <button 
                onClick={dismissNewAchievements}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold">{achievementStats.unlocked}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{achievementStats.total - achievementStats.unlocked}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3", masteryLevel.color.replace('text-', 'bg-') + '/10')}>
              <Crown className={cn("h-6 w-6", masteryLevel.color)} />
            </div>
            <div className="text-2xl font-bold">{Math.round(achievementStats.percentage)}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold">{masteryLevel.level}</div>
            <div className="text-sm text-muted-foreground">Mastery Level</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Achievement Progress</h3>
            <Badge variant="secondary">{achievementStats.unlocked} / {achievementStats.total}</Badge>
          </div>
          <Progress value={achievementStats.percentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Keep practicing to unlock more achievements!</span>
            <span>{Math.round(achievementStats.percentage)}% complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="speed">Speed</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="milestone">Milestone</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Category Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryNames.map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default;
              const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
              const stats = getCategoryStats(category);
              
              return (
                <Card key={category} className="text-center">
                  <CardContent className="p-4">
                    <Icon className={cn("h-8 w-8 mx-auto mb-2", color)} />
                    <h3 className="font-medium capitalize mb-1">{category}</h3>
                    <div className="text-sm text-muted-foreground">
                      {stats.unlocked}/{stats.total}
                    </div>
                    <Progress value={stats.percentage} className="h-1 mt-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* All Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements?.map((achievement) => (
              <AchievementBadge
                key={achievement.achievement.id}
                achievement={achievement}
                variant="card"
                showProgress={!achievement.isUnlocked}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unlocked" className="space-y-6">
          {unlockedAchievements && unlockedAchievements.length > 0 ? (
            <>
              {/* Recent Achievements */}
              {recentAchievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <span>Recently Unlocked</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recentAchievements.map((achievement) => (
                        <AchievementBadge
                          key={achievement.id}
                          achievement={{
                            achievement,
                            current: 1,
                            target: 1,
                            percentage: 100,
                            isUnlocked: true
                          }}
                          variant="compact"
                          showProgress={false}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* All Unlocked */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {unlockedAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={{
                      achievement,
                      current: 1,
                      target: 1,
                      percentage: 100,
                      isUnlocked: true
                    }}
                    variant="card"
                    showProgress={false}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                <p className="text-muted-foreground">
                  Start practicing to unlock your first achievement!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Category-specific tabs */}
        {['accuracy', 'speed', 'streak', 'milestone'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getAchievementsByCategory(category).map((achievement) => (
                <AchievementBadge
                  key={achievement.achievement.id}
                  achievement={achievement}
                  variant="card"
                  showProgress={!achievement.isUnlocked}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
