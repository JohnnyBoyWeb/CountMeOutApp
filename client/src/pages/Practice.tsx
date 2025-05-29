import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PracticeSession } from '@/components/PracticeSession';
import { OperationCard } from '@/components/OperationCard';
import { Operation, Difficulty, ProblemConfig } from '@/lib/mathEngine';
import { PracticeMode } from '@/hooks/usePracticeSession';
import { 
  Play, 
  Settings2, 
  Clock, 
  Target, 
  Volume2,
  Plus,
  Minus,
  X,
  Divide,
  Percent,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Practice() {
  const [selectedOperation, setSelectedOperation] = useState<Operation>('addition');
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('timed');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [numberRange, setNumberRange] = useState('1-100');
  const [includeDecimals, setIncludeDecimals] = useState(false);
  const [includeNegatives, setIncludeNegatives] = useState(false);
  const [multiStep, setMultiStep] = useState(false);
  const [mixedOperations, setMixedOperations] = useState(false);
  const [sessionLength, setSessionLength] = useState('20');
  const [showPracticeSession, setShowPracticeSession] = useState(false);

  const operations: { value: Operation; label: string; icon: any; color: string }[] = [
    { value: 'addition', label: 'Addition', icon: Plus, color: 'text-blue-600' },
    { value: 'subtraction', label: 'Subtraction', icon: Minus, color: 'text-red-600' },
    { value: 'multiplication', label: 'Multiplication', icon: X, color: 'text-green-600' },
    { value: 'division', label: 'Division', icon: Divide, color: 'text-purple-600' },
    { value: 'percentage', label: 'Percentages', icon: Percent, color: 'text-amber-600' },
  ];

  const practiceeModes = [
    {
      value: 'timed' as PracticeMode,
      label: 'Timed Practice',
      description: 'Race against the clock while maintaining accuracy',
      icon: Clock,
      color: 'text-amber-600'
    },
    {
      value: 'accuracy' as PracticeMode,
      label: 'Accuracy Mode',
      description: 'Focus on careful calculation without time pressure',
      icon: Target,
      color: 'text-green-600'
    },
    {
      value: 'audio' as PracticeMode,
      label: 'Audio-Only Mode',
      description: 'Listen to problems and strengthen mental visualization',
      icon: Volume2,
      color: 'text-purple-600'
    }
  ];

  const getCustomRange = () => {
    switch (numberRange) {
      case '1-10': return { min: 1, max: 10 };
      case '1-20': return { min: 1, max: 20 };
      case '1-100': return { min: 1, max: 100 };
      case '1-1000': return { min: 1, max: 1000 };
      default: return undefined;
    }
  };

  const createPracticeConfig = (): ProblemConfig => ({
    operation: selectedOperation,
    difficulty,
    includeDecimals,
    includeNegatives,
    multiStep,
    mixedOperations,
    customRange: getCustomRange()
  });

  const handleStartPractice = () => {
    setShowPracticeSession(true);
  };

  const handlePracticeComplete = (results: any) => {
    setShowPracticeSession(false);
    // Handle results - could show a results modal
    console.log('Practice completed:', results);
  };

  const handleOperationSelect = (operation: Operation) => {
    setSelectedOperation(operation);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Practice Session</h1>
        <p className="text-muted-foreground">
          Customize your practice settings and start improving your mental math skills
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operation Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings2 className="h-5 w-5" />
                <span>Choose Operation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {operations.map((op) => {
                  const Icon = op.icon;
                  return (
                    <button
                      key={op.value}
                      onClick={() => handleOperationSelect(op.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center group",
                        selectedOperation === op.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Icon className={cn(
                        "h-8 w-8 mx-auto mb-2",
                        selectedOperation === op.value ? "text-primary" : op.color
                      )} />
                      <div className={cn(
                        "font-medium text-sm",
                        selectedOperation === op.value ? "text-primary" : "text-foreground"
                      )}>
                        {op.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Practice Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Practice Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as PracticeMode)}>
                <div className="space-y-3">
                  {practiceeModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <div key={mode.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={mode.value} id={mode.value} />
                        <Label 
                          htmlFor={mode.value} 
                          className="flex-1 cursor-pointer p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className={cn("h-5 w-5", mode.color)} />
                            <div className="flex-1">
                              <div className="font-medium">{mode.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {mode.description}
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Difficulty Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (1-10)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-100)</SelectItem>
                      <SelectItem value="advanced">Advanced (1-1000)</SelectItem>
                      <SelectItem value="expert">Expert (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number Range</Label>
                  <Select value={numberRange} onValueChange={setNumberRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1 - 10</SelectItem>
                      <SelectItem value="1-20">1 - 20</SelectItem>
                      <SelectItem value="1-100">1 - 100</SelectItem>
                      <SelectItem value="1-1000">1 - 1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Advanced Options */}
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Options</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Include decimals</Label>
                      <div className="text-sm text-muted-foreground">
                        Add decimal numbers to problems
                      </div>
                    </div>
                    <Switch
                      checked={includeDecimals}
                      onCheckedChange={setIncludeDecimals}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Include negatives</Label>
                      <div className="text-sm text-muted-foreground">
                        Include negative numbers
                      </div>
                    </div>
                    <Switch
                      checked={includeNegatives}
                      onCheckedChange={setIncludeNegatives}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Multi-step problems</Label>
                      <div className="text-sm text-muted-foreground">
                        Complex expressions (PEMDAS)
                      </div>
                    </div>
                    <Switch
                      checked={multiStep}
                      onCheckedChange={setMultiStep}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mixed operations</Label>
                      <div className="text-sm text-muted-foreground">
                        Combine different operations
                      </div>
                    </div>
                    <Switch
                      checked={mixedOperations}
                      onCheckedChange={setMixedOperations}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Session Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Session Settings</h4>
                
                <div className="space-y-2">
                  <Label>Session Length</Label>
                  <Select value={sessionLength} onValueChange={setSessionLength}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 problems</SelectItem>
                      <SelectItem value="20">20 problems</SelectItem>
                      <SelectItem value="50">50 problems</SelectItem>
                      <SelectItem value="5min">5 minutes</SelectItem>
                      <SelectItem value="10min">10 minutes</SelectItem>
                      <SelectItem value="15min">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Start Panel */}
        <div className="space-y-6">
          {/* Session Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Session Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Operation</span>
                  <Badge variant="secondary">{operations.find(op => op.value === selectedOperation)?.label}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mode</span>
                  <Badge variant="secondary">{practiceeModes.find(mode => mode.value === selectedMode)?.label}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Difficulty</span>
                  <Badge variant="secondary">{difficulty}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Range</span>
                  <Badge variant="secondary">{numberRange}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Length</span>
                  <Badge variant="secondary">{sessionLength}</Badge>
                </div>
              </div>

              {(includeDecimals || includeNegatives || multiStep || mixedOperations) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Special Features</span>
                    <div className="flex flex-wrap gap-1">
                      {includeDecimals && <Badge variant="outline" className="text-xs">Decimals</Badge>}
                      {includeNegatives && <Badge variant="outline" className="text-xs">Negatives</Badge>}
                      {multiStep && <Badge variant="outline" className="text-xs">Multi-step</Badge>}
                      {mixedOperations && <Badge variant="outline" className="text-xs">Mixed Ops</Badge>}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Start Button */}
          <Button 
            size="lg" 
            className="w-full h-14 text-lg"
            onClick={handleStartPractice}
          >
            <Play className="h-5 w-5 mr-2" />
            Start Practice Session
          </Button>

          {/* Quick Operation Cards */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Or choose an operation:</h3>
            <div className="space-y-3">
              {operations.slice(0, 3).map((op) => (
                <OperationCard
                  key={op.value}
                  operation={op.value}
                  onClick={() => handleOperationSelect(op.value)}
                  className="cursor-pointer"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Practice Session Modal */}
      {showPracticeSession && (
        <PracticeSession
          mode={selectedMode}
          config={createPracticeConfig()}
          onClose={() => setShowPracticeSession(false)}
          onComplete={handlePracticeComplete}
        />
      )}
    </div>
  );
}
