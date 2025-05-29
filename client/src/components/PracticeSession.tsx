import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePracticeSession, PracticeMode } from '@/hooks/usePracticeSession';
import { useSettings } from '@/hooks/useSettings';
import { ProblemConfig } from '@/lib/mathEngine';
import { useToast } from '@/hooks/use-toast';
import { X, Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PracticeSessionProps {
  mode: PracticeMode;
  config: ProblemConfig;
  onClose: () => void;
  onComplete: (results: any) => void;
}

export function PracticeSession({ mode, config, onClose, onComplete }: PracticeSessionProps) {
  const { settings } = useSettings();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [userInput, setUserInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [showProblem, setShowProblem] = useState(mode !== 'audio');

  const {
    currentProblem,
    userAnswer,
    isCorrect,
    feedback,
    timeElapsed,
    timeRemaining,
    isActive,
    isComplete,
    correctAnswers,
    score,
    progress,
    startSession,
    submitAnswer,
    nextProblem,
    skipProblem,
    repeatProblem,
    endSession,
    saveResults
  } = usePracticeSession(mode, config, 20, 600);

  // Auto-start session
  useEffect(() => {
    startSession();
  }, [startSession]);

  // Focus input when problem changes
  useEffect(() => {
    if (inputRef.current && isActive) {
      inputRef.current.focus();
    }
  }, [currentProblem, isActive]);

  // Handle session completion
  useEffect(() => {
    if (isComplete) {
      handleSessionComplete();
    }
  }, [isComplete]);

  const handleSessionComplete = async () => {
    try {
      const results = await saveResults();
      onComplete(results);
      
      toast({
        title: "Session Complete!",
        description: `You solved ${results.problemsSolved} problems with ${results.accuracy.toFixed(1)}% accuracy.`,
      });
    } catch (error) {
      console.error('Failed to save results:', error);
      toast({
        title: "Error",
        description: "Failed to save session results.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = () => {
    if (userInput.trim()) {
      submitAnswer(userInput);
      setUserInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSkip = () => {
    skipProblem();
    setUserInput('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'timed':
        return 'Timed Practice';
      case 'accuracy':
        return 'Accuracy Mode';
      case 'audio':
        return 'Audio-Only Mode';
      default:
        return 'Practice Session';
    }
  };

  if (!isActive && !isComplete) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Preparing your practice session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{getModeTitle()}</h2>
            <p className="text-sm text-muted-foreground">
              Problem {progress.completed + 1} of {progress.total}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {mode === 'timed' && timeRemaining !== null && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Time Left</div>
              <div className={cn(
                "text-lg font-mono font-bold",
                timeRemaining < 60 ? "text-destructive" : "text-foreground"
              )}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          )}

          <div className="text-right">
            <div className="text-sm text-muted-foreground">Accuracy</div>
            <div className="text-lg font-bold text-green-600">
              {progress.completed > 0 ? Math.round((correctAnswers / progress.completed) * 100) : 100}%
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={endSession}>
            <Pause className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <Progress value={progress.percentage} className="w-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* Problem Display */}
          {showProblem && currentProblem && (
            <div className={cn(
              "p-8 rounded-2xl",
              settings.highContrast 
                ? "bg-black text-white border-2 border-white"
                : "bg-muted"
            )}>
              <div className={cn(
                "math-problem",
                settings.largeText && "text-6xl md:text-8xl"
              )}>
                {currentProblem.displayExpression}
              </div>
            </div>
          )}

          {/* Audio Mode Controls */}
          {mode === 'audio' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={repeatProblem}
                  className="flex items-center space-x-2"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Repeat Problem</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowProblem(!showProblem)}
                  className="flex items-center space-x-2"
                >
                  {showProblem ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span>{showProblem ? 'Hide' : 'Show'} Problem</span>
                </Button>
              </div>
            </div>
          )}

          {/* Answer Input */}
          <div className="space-y-4">
            <Input
              ref={inputRef}
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your answer"
              className={cn(
                "practice-input",
                settings.largeText && "text-6xl p-8",
                isCorrect === true && "border-green-500",
                isCorrect === false && "border-red-500"
              )}
              disabled={!isActive}
            />

            {/* Feedback */}
            {feedback && (
              <div className={cn(
                "text-lg font-medium p-3 rounded-lg",
                isCorrect === true 
                  ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/20"
                  : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/20"
              )}>
                {feedback}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={!isActive}
              className="flex items-center space-x-2"
            >
              <SkipForward className="h-4 w-4" />
              <span>Skip</span>
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!isActive || !userInput.trim()}
              className="px-8"
            >
              Submit Answer
            </Button>
          </div>

          {/* Session Stats */}
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{correctAnswers}</div>
              <div>Correct</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{score}</div>
              <div>Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{formatTime(timeElapsed)}</div>
              <div>Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Number Pad for Mobile */}
      <div className="md:hidden p-4 border-t">
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outline"
              className="aspect-square text-xl"
              onClick={() => setUserInput(prev => prev + num.toString())}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="outline"
            className="aspect-square text-xl"
            onClick={() => setUserInput('')}
          >
            C
          </Button>
          <Button
            variant="outline"
            className="aspect-square text-xl"
            onClick={() => setUserInput(prev => prev + '0')}
          >
            0
          </Button>
          <Button
            variant="outline"
            className="aspect-square text-xl"
            onClick={() => setUserInput(prev => prev.slice(0, -1))}
          >
            ⌫
          </Button>
        </div>
      </div>
    </div>
  );
}
