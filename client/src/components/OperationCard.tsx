import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, X, Divide, Percent, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Operation } from '@/lib/mathEngine';
import { useOperationProgress } from '@/hooks/useProgress';

interface OperationCardProps {
  operation: Operation;
  onClick: () => void;
  className?: string;
}

const operationConfig = {
  addition: {
    icon: Plus,
    title: 'Addition',
    description: 'Practice addition problems with customizable difficulty',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-700',
    hoverColor: 'hover:border-blue-400 dark:hover:border-blue-500'
  },
  subtraction: {
    icon: Minus,
    title: 'Subtraction',
    description: 'Master subtraction including borrowing and negative numbers',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-700',
    hoverColor: 'hover:border-red-400 dark:hover:border-red-500'
  },
  multiplication: {
    icon: X,
    title: 'Multiplication',
    description: 'Build multiplication fluency with times tables and beyond',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-700',
    hoverColor: 'hover:border-green-400 dark:hover:border-green-500'
  },
  division: {
    icon: Divide,
    title: 'Division',
    description: 'Practice division with remainders and decimal results',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-200 dark:border-purple-700',
    hoverColor: 'hover:border-purple-400 dark:hover:border-purple-500'
  },
  percentage: {
    icon: Percent,
    title: 'Percentages',
    description: 'Learn percentage calculations and real-world applications',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-700',
    hoverColor: 'hover:border-amber-400 dark:hover:border-amber-500'
  }
};

export function OperationCard({ operation, onClick, className }: OperationCardProps) {
  const config = operationConfig[operation];
  const Icon = config.icon;
  
  const { data: operationData, isLoading } = useOperationProgress(operation);

  const getMasteryLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: 'Expert', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' };
    if (accuracy >= 75) return { level: 'Advanced', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
    if (accuracy >= 50) return { level: 'Intermediate', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' };
    return { level: 'Beginner', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-900/30' };
  };

  const mastery = getMasteryLevel(operationData?.accuracy || 0);

  return (
    <Card className={cn(
      "card-hover transition-all duration-200 cursor-pointer border-2",
      config.borderColor,
      config.hoverColor,
      "hover:shadow-lg hover:-translate-y-1",
      className
    )}>
      <CardContent className="p-6" onClick={onClick}>
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            config.bgColor
          )}>
            <Icon className={cn("h-6 w-6", config.color)} />
          </div>
          
          <div className="text-right">
            {!isLoading && operationData?.accuracy && (
              <div className="text-sm text-muted-foreground">
                Best: <span className="font-medium">{Math.round(operationData.accuracy)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {config.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {config.description}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2 animate-pulse" />
              <div className="flex justify-between">
                <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                <div className="w-8 h-4 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ) : operationData && operationData.totalProblems > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", mastery.color, mastery.bgColor)}
                >
                  {mastery.level}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full transition-all duration-300", {
                      'bg-green-500': operationData.accuracy >= 90,
                      'bg-blue-500': operationData.accuracy >= 75 && operationData.accuracy < 90,
                      'bg-amber-500': operationData.accuracy >= 50 && operationData.accuracy < 75,
                      'bg-slate-500': operationData.accuracy < 50
                    })}
                    style={{ width: `${Math.min(operationData.accuracy, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground min-w-[3rem] text-right">
                  {Math.round(operationData.accuracy)}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{operationData.totalProblems} problems solved</span>
                <span>{operationData.totalCorrect} correct</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <Badge variant="outline" className="text-xs">
                  Not Started
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-slate-300 h-2 rounded-full w-0 transition-all duration-300" />
                </div>
                <span className="text-sm font-medium text-muted-foreground min-w-[3rem] text-right">
                  0%
                </span>
              </div>

              <div className="text-xs text-muted-foreground text-center py-2">
                Start practicing to track your progress
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full group",
              config.color,
              "hover:bg-current/10"
            )}
          >
            <span>Start Practice</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
