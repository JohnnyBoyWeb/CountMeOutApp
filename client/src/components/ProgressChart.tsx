import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/hooks/useProgress';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressChartProps {
  className?: string;
}

export function ProgressChart({ className }: ProgressChartProps) {
  const { progressStats, timeframe, setTimeframe, isLoading } = useProgress();

  const chartData = useMemo(() => {
    if (!progressStats) return [];
    
    const data = timeframe === 'week' 
      ? progressStats.weeklyProgress 
      : progressStats.monthlyProgress;
    
    return data.map((item, index) => ({
      ...item,
      index
    }));
  }, [progressStats, timeframe]);

  const maxProblems = useMemo(() => {
    return Math.max(...chartData.map(d => d.problems), 1);
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Progress Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Progress Overview</span>
          </CardTitle>
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={timeframe === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeframe('week')}
              className="h-8 px-3"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Week
            </Button>
            <Button
              variant={timeframe === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeframe('month')}
              className="h-8 px-3"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Data Yet</p>
            <p className="text-sm text-center">
              Start practicing to see your progress here!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart */}
            <div className="h-64 flex items-end justify-between space-x-1">
              {chartData.map((item, index) => {
                const height = maxProblems > 0 ? (item.problems / maxProblems) * 100 : 0;
                const date = timeframe === 'week' 
                  ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
                  : new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' });
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center mb-2">
                      {/* Accuracy Bar */}
                      <div className="w-full bg-muted rounded-full h-2 mb-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.accuracy}%` }}
                        />
                      </div>
                      
                      {/* Problems Bar */}
                      <div className="w-full bg-muted rounded-t-lg relative" style={{ height: '200px' }}>
                        <div 
                          className={cn(
                            "bg-primary rounded-t-lg transition-all duration-500 flex items-end justify-center",
                            "hover:bg-primary/90"
                          )}
                          style={{ height: `${height}%` }}
                        >
                          {item.problems > 0 && (
                            <span className="text-xs text-primary-foreground font-medium pb-1">
                              {item.problems}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Date Label */}
                    <span className="text-xs text-muted-foreground font-medium">
                      {date}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span className="text-muted-foreground">Problems Solved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-muted-foreground">Accuracy Rate</span>
              </div>
            </div>

            {/* Summary Stats */}
            {progressStats && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {chartData.reduce((sum, item) => sum + item.problems, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Problems</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {chartData.length > 0 
                      ? Math.round(chartData.reduce((sum, item) => sum + item.accuracy, 0) / chartData.length)
                      : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {Math.round(chartData.reduce((sum, item) => sum + item.time, 0) / 60)}m
                  </div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
