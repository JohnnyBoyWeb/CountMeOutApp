import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressChart } from '@/components/ProgressChart';
import { OperationCard } from '@/components/OperationCard';
import { AchievementBadge } from '@/components/AchievementBadge';
import { PracticeSession } from '@/components/PracticeSession';
import { useProgress } from '@/hooks/useProgress';
import { useAchievements } from '@/hooks/useAchievements';
import { ProblemConfig, Operation } from '@/lib/mathEngine';
import { PracticeMode } from '@/hooks/usePracticeSession';
import { 
  Play, 
  Target, 
  Volume2, 
  Clock, 
  TrendingUp, 
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { progressStats, dailyGoal, isLoading: progressLoading } = useProgress();
  const { getRecentAchievements, getAchievementStats } = useAchievements();
  
  const [showPracticeSession, setShowPracticeSession] = useState(false);
  const [practiceConfig, setPracticeConfig] = useState<{
    mode: PracticeMode;
    config: ProblemConfig;
  } | null>(null);

  const recentAchievements = getRecentAchievements().slice(0, 3);
  const achievementStats = getAchievementStats();

  const handleOperationClick = (operation: Operation) => {
    setPracticeConfig({
      mode: 'timed',
      config: {
        operation,
        difficulty: 'intermediate',
        multiStep: false
      }
    });
    setShowPracticeSession(true);
  };

  const handleQuickStart = (mode: PracticeMode) => {
    setPracticeConfig({
      mode,
      config: {
        operation: 'addition',
        difficulty: 'intermediate',
        multiStep: false
      }
    });
    setShowPracticeSession(true);
  };

  const handlePracticeComplete = (results: any) => {
    setShowPracticeSession(false);
    setPracticeConfig(null);
    // You could show a results modal here
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <section>
        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back!</h1>
                <p className="text-blue-100 mb-4">Ready to boost your mental math skills? Let's continue where you left off.</p>
              </div>
              
              {progressStats && progressStats.currentStreak > 0 && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Zap className="h-3 w-3 mr-1" />
                  {progressStats.currentStreak} day streak!
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold">
                  {progressLoading ? '...' : (progressStats?.currentStreak || 0)}
                </div>
                <div className="text-sm text-blue-200">Day Streak</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">
                  {progressLoading ? '...' : (progressStats?.totalProblems || 0)}
                </div>
                <div className="text-sm text-blue-200">Problems Solved</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">
                  {progressLoading ? '...' : Math.round(progressStats?.overallAccuracy || 0)}%
                </div>
                <div className="text-sm text-blue-200">Accuracy</div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>
      </section>

      {/* Daily Goal Progress */}
      {dailyGoal && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Today's Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Daily Goal</span>
                  <span className="text-sm font-medium">
                    {dailyGoal.completed}/{dailyGoal.target} problems
                  </span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(dailyGoal.percentage, 100)}%` }}
                  />
                </div>
                
                <div className="text-sm text-muted-foreground text-center">
                  {dailyGoal.percentage >= 100 ? 
                    "🎉 Goal completed! Great work!" : 
                    `${Math.round(dailyGoal.percentage)}% complete`
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Quick Start Practice */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Quick Start</h2>
          <Button variant="ghost" size="sm" asChild>
            <a href="/practice" className="flex items-center space-x-1">
              <span>More options</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-hover cursor-pointer" onClick={() => handleQuickStart('timed')}>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Timed Practice</h3>
                  <p className="text-sm text-muted-foreground">Beat the clock</p>
                </div>
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => handleQuickStart('accuracy')}>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Accuracy Mode</h3>
                  <p className="text-sm text-muted-foreground">Focus on precision</p>
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => handleQuickStart('audio')}>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Volume2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Audio-Only</h3>
                  <p className="text-sm text-muted-foreground">Listen & calculate</p>
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Operation Modules */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Choose Your Focus</h2>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            Customize <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <OperationCard 
            operation="addition" 
            onClick={() => handleOperationClick('addition')}
          />
          <OperationCard 
            operation="subtraction" 
            onClick={() => handleOperationClick('subtraction')}
          />
          <OperationCard 
            operation="multiplication" 
            onClick={() => handleOperationClick('multiplication')}
          />
          <OperationCard 
            operation="division" 
            onClick={() => handleOperationClick('division')}
          />
          <OperationCard 
            operation="percentage" 
            onClick={() => handleOperationClick('percentage')}
          />
          
          {/* Multi-step card */}
          <Card className="card-hover border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer">
            <CardContent className="p-6" onClick={() => handleOperationClick('addition')}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Multi-Step
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Complex expressions with order of operations (PEMDAS)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <Badge variant="outline" className="text-xs">
                      Advanced
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full w-[65%] transition-all duration-300" />
                    </div>
                    <span className="text-sm font-medium text-foreground min-w-[3rem] text-right">
                      65%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" className="w-full group text-indigo-600 hover:bg-indigo-600/10">
                  <span>Start Practice</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2">
          <ProgressChart />
        </div>

        {/* Achievements & Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progressLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Problems Solved</span>
                    <span className="font-semibold">{progressStats?.totalProblems || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average Accuracy</span>
                    <span className="font-semibold text-green-600">
                      {Math.round(progressStats?.overallAccuracy || 0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Streak</span>
                    <span className="font-semibold text-amber-600">
                      {progressStats?.currentStreak || 0} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Time</span>
                    <span className="font-semibold">
                      {formatTime(progressStats?.totalTime || 0)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Achievements</span>
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/achievements" className="text-primary hover:text-primary/80">
                    View All
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentAchievements.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No achievements yet</p>
                  <p className="text-xs">Start practicing to earn badges!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={{
                        achievement,
                        current: 0,
                        target: 1,
                        percentage: 100,
                        isUnlocked: true
                      }}
                      variant="minimal"
                      showProgress={false}
                    />
                  ))}
                  
                  <div className="pt-3 border-t text-center">
                    <div className="text-sm text-muted-foreground">
                      {achievementStats.unlocked} of {achievementStats.total} unlocked
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${achievementStats.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Practice Session Modal */}
      {showPracticeSession && practiceConfig && (
        <PracticeSession
          mode={practiceConfig.mode}
          config={practiceConfig.config}
          onClose={() => setShowPracticeSession(false)}
          onComplete={handlePracticeComplete}
        />
      )}
    </div>
  );
}
