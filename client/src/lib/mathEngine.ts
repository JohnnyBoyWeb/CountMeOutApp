export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'percentage';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface MathProblem {
  id: string;
  operation: Operation;
  difficulty: Difficulty;
  expression: string;
  displayExpression: string;
  answer: number;
  factors?: number[];
  isMultiStep?: boolean;
  timeGenerated: Date;
}

export interface ProblemConfig {
  operation: Operation;
  difficulty: Difficulty;
  includeDecimals?: boolean;
  includeNegatives?: boolean;
  multiStep?: boolean;
  mixedOperations?: boolean;
  customRange?: { min: number; max: number };
}

export class MathEngine {
  private static instance: MathEngine;
  
  public static getInstance(): MathEngine {
    if (!MathEngine.instance) {
      MathEngine.instance = new MathEngine();
    }
    return MathEngine.instance;
  }

  generateProblem(config: ProblemConfig): MathProblem {
    const id = this.generateId();
    const timeGenerated = new Date();

    if (config.multiStep) {
      return this.generateMultiStepProblem(config, id, timeGenerated);
    }

    switch (config.operation) {
      case 'addition':
        return this.generateAddition(config, id, timeGenerated);
      case 'subtraction':
        return this.generateSubtraction(config, id, timeGenerated);
      case 'multiplication':
        return this.generateMultiplication(config, id, timeGenerated);
      case 'division':
        return this.generateDivision(config, id, timeGenerated);
      case 'percentage':
        return this.generatePercentage(config, id, timeGenerated);
      default:
        throw new Error(`Unsupported operation: ${config.operation}`);
    }
  }

  private generateAddition(config: ProblemConfig, id: string, timeGenerated: Date): MathProblem {
    const range = this.getRange(config.difficulty, config.customRange);
    const a = this.randomInRange(range.min, range.max);
    const b = this.randomInRange(range.min, range.max);
    
    const answer = a + b;
    const expression = `${a} + ${b}`;
    
    return {
      id,
      operation: 'addition',
      difficulty: config.difficulty,
      expression,
      displayExpression: expression,
      answer,
      factors: [a, b],
      timeGenerated
    };
  }

  private generateSubtraction(config: ProblemConfig, id: string, timeGenerated: Date): MathProblem {
    const range = this.getRange(config.difficulty, config.customRange);
    let a = this.randomInRange(range.min, range.max);
    let b = this.randomInRange(range.min, range.max);
    
    // Ensure positive result unless negatives are enabled
    if (!config.includeNegatives && b > a) {
      [a, b] = [b, a];
    }
    
    const answer = a - b;
    const expression = `${a} - ${b}`;
    
    return {
      id,
      operation: 'subtraction',
      difficulty: config.difficulty,
      expression,
      displayExpression: expression,
      answer,
      factors: [a, b],
      timeGenerated
    };
  }

  private generateMultiplication(config: ProblemConfig, id: string, timeGenerated: Date): MathProblem {
    const range = this.getRange(config.difficulty, config.customRange);
    const a = this.randomInRange(range.min, range.max);
    const b = this.randomInRange(range.min, range.max);
    
    const answer = a * b;
    const expression = `${a} × ${b}`;
    
    return {
      id,
      operation: 'multiplication',
      difficulty: config.difficulty,
      expression,
      displayExpression: expression,
      answer,
      factors: [a, b],
      timeGenerated
    };
  }

  private generateDivision(config: ProblemConfig, id: string, timeGenerated: Date): MathProblem {
    const range = this.getRange(config.difficulty, config.customRange);
    const b = this.randomInRange(Math.max(1, range.min), range.max);
    const quotient = this.randomInRange(range.min, Math.floor(range.max / b));
    const a = b * quotient;
    
    const answer = quotient;
    const expression = `${a} ÷ ${b}`;
    
    return {
      id,
      operation: 'division',
      difficulty: config.difficulty,
      expression,
      displayExpression: expression,
      answer,
      factors: [a, b],
      timeGenerated
    };
  }

  private generatePercentage(config: ProblemConfig, id: string, timeGenerated: Date): MathProblem {
    const range = this.getRange(config.difficulty, config.customRange);
    const base = this.randomInRange(10, range.max);
    const percentage = this.randomInRange(5, 100);
    
    const answer = Math.round((base * percentage) / 100);
    const expression = `${percentage}% of ${base}`;
    
    return {
      id,
      operation: 'percentage',
      difficulty: config.difficulty,
      expression,
      displayExpression: expression,
      answer,
      factors: [base, percentage],
      timeGenerated
    };
  }

  private generateMultiStepProblem(config: ProblemConfig, id: string, timeGenerated: Date): MathProblem {
    const operations = ['+', '-', '×'];
    const range = this.getRange(config.difficulty, config.customRange);
    
    // Generate 3-4 numbers for a multi-step expression
    const numbers = [
      this.randomInRange(range.min, range.max),
      this.randomInRange(range.min, range.max),
      this.randomInRange(range.min, range.max)
    ];
    
    const ops = [
      operations[Math.floor(Math.random() * operations.length)],
      operations[Math.floor(Math.random() * operations.length)]
    ];
    
    const expression = `${numbers[0]} ${ops[0]} ${numbers[1]} ${ops[1]} ${numbers[2]}`;
    const answer = this.evaluateExpression(expression);
    
    return {
      id,
      operation: config.operation,
      difficulty: config.difficulty,
      expression,
      displayExpression: expression,
      answer,
      factors: numbers,
      isMultiStep: true,
      timeGenerated
    };
  }

  private evaluateExpression(expression: string): number {
    // Replace symbols with JavaScript operators
    const jsExpression = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/');
    
    // Safe evaluation following PEMDAS
    try {
      // This is a simple expression evaluator
      // In production, you'd want a more robust math parser
      return Function(`"use strict"; return (${jsExpression})`)();
    } catch (error) {
      console.error('Expression evaluation error:', error);
      return 0;
    }
  }

  private getRange(difficulty: Difficulty, customRange?: { min: number; max: number }) {
    if (customRange) return customRange;
    
    switch (difficulty) {
      case 'beginner':
        return { min: 1, max: 10 };
      case 'intermediate':
        return { min: 1, max: 100 };
      case 'advanced':
        return { min: 1, max: 1000 };
      case 'expert':
        return { min: 1, max: 10000 };
      default:
        return { min: 1, max: 100 };
    }
  }

  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateId(): string {
    return `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateAnswer(userAnswer: number, correctAnswer: number, tolerance = 0.01): boolean {
    return Math.abs(userAnswer - correctAnswer) <= tolerance;
  }

  formatProblemForSpeech(problem: MathProblem): string {
    let speechText = problem.expression;
    
    // Replace symbols with spoken words
    speechText = speechText
      .replace(/\+/g, ' plus ')
      .replace(/-/g, ' minus ')
      .replace(/×/g, ' times ')
      .replace(/÷/g, ' divided by ')
      .replace(/%/g, ' percent ')
      .replace(/of/g, ' of ');
    
    return speechText.trim();
  }

  generateProblemSet(config: ProblemConfig, count: number): MathProblem[] {
    const problems: MathProblem[] = [];
    
    for (let i = 0; i < count; i++) {
      problems.push(this.generateProblem(config));
    }
    
    return problems;
  }

  calculateDifficultyScore(config: ProblemConfig): number {
    let score = 1;
    
    switch (config.difficulty) {
      case 'beginner': score *= 1; break;
      case 'intermediate': score *= 2; break;
      case 'advanced': score *= 3; break;
      case 'expert': score *= 4; break;
    }
    
    if (config.multiStep) score *= 1.5;
    if (config.includeDecimals) score *= 1.2;
    if (config.includeNegatives) score *= 1.3;
    if (config.mixedOperations) score *= 1.4;
    
    return Math.round(score * 10) / 10;
  }
}

export const mathEngine = MathEngine.getInstance();
