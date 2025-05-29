import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProgressChart } from '@/components/ProgressChart';
import { useProgress, useOperationProgress } from '@/hooks/useProgress';
import { Operation } from '@/lib/mathEngine';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  Calendar,
  Download,
  FileText,
  BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const operations: { value: Operation; label: string; color: string }[] = [
  { value: 'addition', label: 'Addition', color: 'text-blue-600' },
  { value: 'subtraction', label: 'Subtraction', color: 'text-red-600' },
  { value: 'multiplication', label: 'Multiplication', color: 'text-green-600' },
  { value: 'division', label: 'Division', color: 'text-purple-600' },
  { value: 'percentage', label: 'Percentages', color: 'text-amber-600' },
];

export default function Progress() {
  const { progressStats, dailyGoal, isLoading, timeframe, setTimeframe } = useProgress();
  const [selectedOperation, setSelectedOperation] = useState<Operation>('addition');
  const { data: operationData, isLoading: operationLoading } = useOperationProgress(selectedOperation);

  const handleExportCSV = async () => {
    if (!progressStats) return;

    // Create CSV content
    const headers = ['Date', 'Problems', 'Accuracy', 'Time (minutes)'];
    const data = progressStats.weeklyProgress.map(item => [
      item.date,
      item.problems.toString(),
      item.accuracy.toFixed(1),
      Math.round(item.time / 60).toString()
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.join(','))
      .join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `count-me-out-progress-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    // For a real implementation, you'd use a library like jsPDF
    alert('PDF export coming soon!');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getMasteryLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: 'Expert', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' };
    if (accuracy >= 75) return { level: 'Advanced', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
    if (accuracy >= 50) return { level: 'Intermediate', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' };
    return { level: 'Beginner', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-900/30' };
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your mental math journey and see how you're improving over time
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {isLoading ? '...' : (progressStats?.totalProblems || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Problems Solved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {isLoading ? '...' : Math.round(progressStats?.overallAccuracy || 0)}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {isLoading ? '...' : (progressStats?.currentStreak || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {isLoading ? '...' : Math.round(progressStats?.averageTime || 0)}s
                </div>
                <div className="text-sm text-muted-foreground">Avg. Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="operations">By Operation</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Progress Chart */}
          <ProgressChart />

          {/* Operation Mastery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Operation Mastery</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
                        <div className="w-24 h-4 bg-muted-foreground/20 rounded"></div>
                      </div>
                      <div className="w-16 h-4 bg-muted-foreground/20 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : progressStats ? (
                <div className="space-y-4">
                  {operations.map((operation) => {
                    const stats = progressStats.operationStats[operation.value];
                    const mastery = getMasteryLevel(stats.accuracy);
                    
                    return (
                      <div key={operation.value} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", mastery.bgColor)}>
                            <span className={cn("text-lg font-bold", operation.color)}>
                              {operation.value === 'addition' && '+'}
                              {operation.value === 'subtraction' && '−'}
                              {operation.value === 'multiplication' && '×'}
                              {operation.value === 'division' && '÷'}
                              {operation.value === 'percentage' && '%'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">{operation.label}</span>
                            <div className="text-sm text-muted-foreground">
                              {stats.problems} problems solved
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className={cn("font-semibold", mastery.color)}>
                              {Math.round(stats.accuracy)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {mastery.level}
                            </div>
                          </div>
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className={cn("h-2 rounded-full transition-all duration-300", {
                                'bg-green-500': stats.accuracy >= 90,
                                'bg-blue-500': stats.accuracy >= 75 && stats.accuracy < 90,
                                'bg-amber-500': stats.accuracy >= 50 && stats.accuracy < 75,
                                'bg-red-500': stats.accuracy < 50
                              })}
                              style={{ width: `${Math.min(stats.accuracy, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No progress data yet</p>
                  <p className="text-sm">Start practicing to see your operation mastery!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          {/* Operation Selector */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detailed Operation Analysis</CardTitle>
                <Select value={selectedOperation} onValueChange={(value) => setSelectedOperation(value as Operation)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operations.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {operationLoading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="text-center">
                        <div className="w-16 h-8 bg-muted rounded mx-auto mb-2 animate-pulse"></div>
                        <div className="w-20 h-4 bg-muted rounded mx-auto animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : operationData && operationData.totalProblems > 0 ? (
                <div className="space-y-6">
                  {/* Operation Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {operationData.totalProblems}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Problems</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(operationData.accuracy)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {operationData.totalCorrect}
                      </div>
                      <div className="text-sm text-muted-foreground">Correct Answers</div>
                    </div>
                  </div>

                  {/* Recent Sessions */}
                  <div>
                    <h3 className="font-semibold mb-4">Recent Sessions</h3>
                    <div className="space-y-3">
                      {operationData.sessions.slice(0, 5).map((session, index) => (
                        <div key={session.id || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              session.accuracy >= 90 ? "bg-green-500" :
                              session.accuracy >= 75 ? "bg-blue-500" :
                              session.accuracy >= 50 ? "bg-amber-500" : "bg-red-500"
                            )} />
                            <div>
                              <div className="font-medium capitalize">{session.mode} Mode</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(session.completedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{Math.round(session.accuracy)}%</div>
                            <div className="text-sm text-muted-foreground">
                              {session.correctAnswers}/{session.problemsSolved}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No data for {operations.find(op => op.value === selectedOperation)?.label}</p>
                  <p className="text-sm">Start practicing this operation to see detailed analytics!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export Your Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Download your progress data to keep a backup or analyze it in other tools.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <h3 className="font-semibold mb-2">Export as CSV</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download your progress data in CSV format for spreadsheet analysis
                    </p>
                    <Button onClick={handleExportCSV} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-red-600" />
                    <h3 className="font-semibold mb-2">Export as PDF</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a formatted PDF report of your progress
                    </p>
                    <Button onClick={handleExportPDF} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {progressStats && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">What's included:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Session history and results</li>
                    <li>• Operation-specific performance data</li>
                    <li>• Daily and weekly progress trends</li>
                    <li>• Achievement records</li>
                    <li>• Time spent practicing</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
