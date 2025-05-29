import { useState, useCallback, useEffect } from 'react';
import { mathEngine, MathProblem, ProblemConfig } from '@/lib/mathEngine';
import { speechEngine } from '@/lib/speechEngine';
import { db } from '@/lib/db';
import { achievementEngine } from '@/lib/achievementEngine';

export type PracticeMode = 'timed' | 'accuracy' | 'audio';

interface PracticeSessionState {
  problems: MathProblem[];
  currentProblemIndex: number;
  currentProblem: MathProblem | null;
  userAnswer: string;
  isCorrect: boolean | null;
  score: number;
  correctAnswers: number;
  timeElapsed: number;
  timeRemaining: number | null;
  isActive: boolean;
  isComplete: boolean;
  feedback: string;
  sessionStartTime: Date | null;
  problemStartTime: Date | null;
}

interface SessionResults {
  problemsSolved: number;
  correctAnswers: number;
  accuracy: number;
  totalTime: number;
  averageTime: number;
  score: number;
}

export function usePracticeSession(
  mode: PracticeMode,
  config: ProblemConfig,
  sessionLength: number = 20,
  timeLimit: number = 600 // 10 minutes default
) {
  const [state, setState] = useState<PracticeSessionState>({
    problems: [],
    currentProblemIndex: 0,
    currentProblem: null,
    userAnswer: '',
    isCorrect: null,
    score: 0,
    correctAnswers: 0,
    timeElapsed: 0,
    timeRemaining: mode === 'timed' ? timeLimit : null,
    isActive: false,
    isComplete: false,
    feedback: '',
    sessionStartTime: null,
    problemStartTime: null
  });

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Initialize session
  const startSession = useCallback(() => {
    const problems = mathEngine.generateProblemSet(config, sessionLength);
    const now = new Date();
    
    setState({
      problems,
      currentProblemIndex: 0,
      currentProblem: problems[0],
      userAnswer: '',
      isCorrect: null,
      score: 0,
      correctAnswers: 0,
      timeElapsed: 0,
      timeRemaining: mode === 'timed' ? timeLimit : null,
      isActive: true,
      isComplete: false,
      feedback: '',
      sessionStartTime: now,
      problemStartTime: now
    });

    // Start timer
    const id = setInterval(() => {
      setState(prev => {
        if (!prev.isActive) return prev;
        
        const newTimeElapsed = prev.timeElapsed + 1;
        const newTimeRemaining = mode === 'timed' 
          ? Math.max(0, (prev.timeRemaining || 0) - 1)
          : null;

        // Auto-complete if time runs out
        if (mode === 'timed' && newTimeRemaining === 0) {
          return { ...prev, isComplete: true, isActive: false };
        }

        return {
          ...prev,
          timeElapsed: newTimeElapsed,
          timeRemaining: newTimeRemaining
        };
      });
    }, 1000);

    setIntervalId(id);

    // Speak the first problem in audio mode
    if (mode === 'audio' && problems[0]) {
      const speechText = mathEngine.formatProblemForSpeech(problems[0]);
      speechEngine.speakMathProblem(speechText);
    }
  }, [mode, config, sessionLength, timeLimit]);

  // Submit answer
  const submitAnswer = useCallback(async (answer: string) => {
    setState(prev => {
      if (!prev.currentProblem || !prev.isActive) return prev;

      const numericAnswer = parseFloat(answer);
      const isCorrect = mathEngine.validateAnswer(numericAnswer, prev.currentProblem.answer);
      const newCorrectAnswers = prev.correctAnswers + (isCorrect ? 1 : 0);
      const newScore = prev.score + (isCorrect ? 10 : 0);

      // Provide audio feedback in audio mode
      if (mode === 'audio') {
        speechEngine.speakResult(isCorrect, prev.currentProblem.answer);
      }

      return {
        ...prev,
        userAnswer: answer,
        isCorrect,
        correctAnswers: newCorrectAnswers,
        score: newScore,
        feedback: isCorrect ? 'Correct!' : `Incorrect. The answer was ${prev.currentProblem.answer}`
      };
    });

    // Auto-advance after a delay
    setTimeout(() => {
      nextProblem();
    }, mode === 'audio' ? 2000 : 1500);
  }, [mode]);

  // Move to next problem
  const nextProblem = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentProblemIndex + 1;
      
      if (nextIndex >= prev.problems.length) {
        // Session complete
        return {
          ...prev,
          isComplete: true,
          isActive: false,
          currentProblem: null
        };
      }

      const nextProblem = prev.problems[nextIndex];
      
      // Speak next problem in audio mode
      if (mode === 'audio' && nextProblem) {
        setTimeout(() => {
          const speechText = mathEngine.formatProblemForSpeech(nextProblem);
          speechEngine.speakMathProblem(speechText);
        }, 500);
      }

      return {
        ...prev,
        currentProblemIndex: nextIndex,
        currentProblem: nextProblem,
        userAnswer: '',
        isCorrect: null,
        feedback: '',
        problemStartTime: new Date()
      };
    });
  }, [mode]);

  // Skip current problem
  const skipProblem = useCallback(() => {
    nextProblem();
  }, [nextProblem]);

  // Repeat problem (audio mode)
  const repeatProblem = useCallback(() => {
    if (mode === 'audio' && state.currentProblem) {
      const speechText = mathEngine.formatProblemForSpeech(state.currentProblem);
      speechEngine.speakMathProblem(speechText);
    }
  }, [mode, state.currentProblem]);

  // End session early
  const endSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      isComplete: true,
      isActive: false
    }));
  }, []);

  // Save session results
  const saveResults = useCallback(async (): Promise<SessionResults> => {
    if (!state.sessionStartTime) {
      throw new Error('Session not started');
    }

    const results: SessionResults = {
      problemsSolved: state.currentProblemIndex + (state.isCorrect !== null ? 1 : 0),
      correctAnswers: state.correctAnswers,
      accuracy: (state.correctAnswers / Math.max(state.currentProblemIndex, 1)) * 100,
      totalTime: state.timeElapsed,
      averageTime: state.timeElapsed / Math.max(state.currentProblemIndex, 1),
      score: state.score
    };

    // Save to database
    const sessionData = {
      mode,
      operation: config.operation,
      difficulty: config.difficulty,
      problemsSolved: results.problemsSolved,
      correctAnswers: results.correctAnswers,
      sessionTime: results.totalTime,
      accuracy: results.accuracy,
      avgTimePerProblem: results.averageTime
    };

    await db.practiceSessions.add(sessionData);

    // Update user progress
    const existingProgress = await db.userProgress
      .where('operation')
      .equals(config.operation)
      .and(progress => progress.difficulty === config.difficulty)
      .first();

    if (existingProgress) {
      await db.userProgress.update(existingProgress.id!, {
        problemsSolved: existingProgress.problemsSolved + results.problemsSolved,
        correctAnswers: existingProgress.correctAnswers + results.correctAnswers,
        totalTime: existingProgress.totalTime + results.totalTime,
        lastPracticed: new Date(),
        updatedAt: new Date()
      });
    } else {
      await db.userProgress.add({
        operation: config.operation,
        difficulty: config.difficulty,
        problemsSolved: results.problemsSolved,
        correctAnswers: results.correctAnswers,
        totalTime: results.totalTime,
        streak: 1,
        lastPracticed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Check for achievements
    await achievementEngine.checkAchievements(sessionData);

    return results;
  }, [state, mode, config]);

  // Cleanup timer on unmount or completion
  useEffect(() => {
    if (state.isComplete && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isComplete, intervalId]);

  return {
    ...state,
    startSession,
    submitAnswer,
    nextProblem,
    skipProblem,
    repeatProblem,
    endSession,
    saveResults,
    progress: {
      completed: state.currentProblemIndex,
      total: state.problems.length,
      percentage: (state.currentProblemIndex / Math.max(state.problems.length, 1)) * 100
    }
  };
}
