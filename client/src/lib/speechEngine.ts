export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

export class SpeechEngine {
  private static instance: SpeechEngine;
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private defaultOptions: SpeechOptions = {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voice: null
  };

  public static getInstance(): SpeechEngine {
    if (!SpeechEngine.instance) {
      SpeechEngine.instance = new SpeechEngine();
    }
    return SpeechEngine.instance;
  }

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      
      // Load voices when they become available
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
      
      // Set default voice to English if available
      const englishVoice = this.voices.find(voice => 
        voice.lang.startsWith('en') && voice.default
      ) || this.voices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) {
        this.defaultOptions.voice = englishVoice;
      }
    }
  }

  isSupported(): boolean {
    return this.synthesis !== null;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  speak(text: string, options?: SpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const finalOptions = { ...this.defaultOptions, ...options };

      utterance.rate = finalOptions.rate || 1.0;
      utterance.pitch = finalOptions.pitch || 1.0;
      utterance.volume = finalOptions.volume || 1.0;
      utterance.voice = finalOptions.voice;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  isPaused(): boolean {
    return this.synthesis ? this.synthesis.paused : false;
  }

  setDefaultOptions(options: Partial<SpeechOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  formatMathProblem(expression: string): string {
    return expression
      .replace(/\+/g, ' plus ')
      .replace(/-/g, ' minus ')
      .replace(/×/g, ' times ')
      .replace(/\*/g, ' times ')
      .replace(/÷/g, ' divided by ')
      .replace(/\//g, ' divided by ')
      .replace(/%/g, ' percent ')
      .replace(/=/g, ' equals ')
      .replace(/\(/g, ' open parenthesis ')
      .replace(/\)/g, ' close parenthesis ')
      .replace(/\^/g, ' to the power of ')
      .replace(/²/g, ' squared ')
      .replace(/³/g, ' cubed ')
      .trim();
  }

  speakMathProblem(expression: string, options?: SpeechOptions): Promise<void> {
    const formattedText = this.formatMathProblem(expression);
    return this.speak(formattedText, options);
  }

  speakResult(isCorrect: boolean, correctAnswer?: number, options?: SpeechOptions): Promise<void> {
    let text = isCorrect ? 'Correct!' : 'Incorrect.';
    
    if (!isCorrect && correctAnswer !== undefined) {
      text += ` The correct answer is ${correctAnswer}.`;
    }
    
    return this.speak(text, options);
  }

  speakInstruction(instruction: string, options?: SpeechOptions): Promise<void> {
    return this.speak(instruction, options);
  }

  // Utility method for testing speech functionality
  async testSpeech(): Promise<boolean> {
    try {
      await this.speak('Speech synthesis is working correctly.');
      return true;
    } catch (error) {
      console.error('Speech test failed:', error);
      return false;
    }
  }
}

export const speechEngine = SpeechEngine.getInstance();
