import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, Star, Target, Zap, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AchievementProgress } from '@/hooks/useAchievements';

interface AchievementBadgeProps {
  achievement: AchievementProgress;
  variant?: 'card' | 'compact' | 'minimal';
  showProgress?: boolean;
  className?: string;
}

export function AchievementBadge({ 
  achievement, 
  variant = 'card', 
  showProgress = true,
  className 
}: AchievementBadgeProps) {
  const getIcon = () => {
    switch (achievement.achievement.category) {
      case 'accuracy':
        return Target;
      case 'speed':
        return Zap;
      case 'streak':
        return Star;
      case 'milestone':
        return Medal;
      default:
        return Trophy;
    }
  };

  const getCategoryColor = () => {
    switch (achievement.achievement.category) {
      case 'accuracy':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'speed':
        return 'text-amber-600 dark:text-amber-400';
      case 'streak':
        return 'text-purple-600 dark:text-purple-400';
      case 'milestone':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-primary';
    }
  };

  const Icon = getIcon();

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          achievement.isUnlocked 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          {achievement.isUnlocked ? (
            <Icon className="h-4 w-4" />
          ) : (
            <Lock className="h-3 w-3" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium text-sm truncate",
            achievement.isUnlocked 
              ? "text-foreground" 
              : "text-muted-foreground"
          )}>
            {achievement.achievement.name}
          </div>
          {showProgress && !achievement.isUnlocked && (
            <div className="text-xs text-muted-foreground">
              {achievement.current}/{achievement.target}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
        achievement.isUnlocked 
          ? "bg-primary/5 border-primary/20" 
          : "bg-muted/50 border-border",
        className
      )}>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          achievement.isUnlocked 
            ? getCategoryColor() + " bg-current/10"
            : "bg-muted text-muted-foreground"
        )}>
          {achievement.isUnlocked ? (
            <Icon className="h-5 w-5" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium",
            achievement.isUnlocked 
              ? "text-foreground" 
              : "text-muted-foreground"
          )}>
            {achievement.achievement.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {achievement.achievement.description}
          </div>
          {showProgress && !achievement.isUnlocked && achievement.percentage > 0 && (
            <div className="mt-2 space-y-1">
              <Progress value={achievement.percentage} className="h-1" />
              <div className="text-xs text-muted-foreground">
                {achievement.current}/{achievement.target} ({Math.round(achievement.percentage)}%)
              </div>
            </div>
          )}
        </div>
        {achievement.isUnlocked && (
          <Badge variant="secondary" className="text-xs">
            Unlocked
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      achievement.isUnlocked 
        ? "border-primary/20 bg-primary/5" 
        : "opacity-75 hover:opacity-100",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            achievement.isUnlocked 
              ? getCategoryColor() + " bg-current/10"
              : "bg-muted text-muted-foreground"
          )}>
            {achievement.isUnlocked ? (
              <Icon className="h-6 w-6" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className={cn(
                  "font-semibold",
                  achievement.isUnlocked 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}>
                  {achievement.achievement.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {achievement.achievement.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={achievement.isUnlocked ? "default" : "secondary"}
                  className="text-xs"
                >
                  {achievement.achievement.category}
                </Badge>
                {achievement.isUnlocked && (
                  <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-300">
                    ✓ Unlocked
                  </Badge>
                )}
              </div>
            </div>

            {showProgress && !achievement.isUnlocked && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {achievement.current}/{achievement.target}
                  </span>
                </div>
                <Progress value={achievement.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  {Math.round(achievement.percentage)}% complete
                </div>
              </div>
            )}

            {achievement.isUnlocked && achievement.achievement.unlockedAt && (
              <div className="text-xs text-muted-foreground">
                Unlocked {new Date(achievement.achievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
