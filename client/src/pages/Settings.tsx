import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { speechEngine } from '@/lib/speechEngine';
import {
  Accessibility,
  Volume2,
  Shield,
  Download,
  Trash2,
  HardDrive,
  AlertTriangle,
  TestTube,
  Info,
  CheckCircle,
  XCircle,
  Moon,
  Sun,
  Palette,
  Type,
  Zap,
  Bell,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { 
    settings, 
    isLoading, 
    isSaving,
    toggleDarkMode,
    toggleDyslexiaMode,
    toggleHighContrast,
    toggleLargeText,
    toggleSoundEffects,
    toggleVoiceFeedback,
    toggleAnimations,
    toggleNotifications,
    setVoiceSpeed,
    exportData,
    clearAllData,
    getStorageUsage
  } = useSettings();
  
  const { toast } = useToast();
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechTestStatus, setSpeechTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Load storage info and voices on component mount
  useEffect(() => {
    loadStorageInfo();
    loadVoices();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageUsage();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const loadVoices = () => {
    if (speechEngine.isSupported()) {
      const availableVoices = speechEngine.getVoices();
      setVoices(availableVoices);
      
      // Set default voice
      const englishVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && voice.default
      ) || availableVoices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) {
        setSelectedVoice(englishVoice.name);
      }
    }
  };

  const handleExportData = async () => {
    try {
      const success = await exportData();
      if (success) {
        toast({
          title: "Export Successful",
          description: "Your data has been exported successfully.",
        });
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };

  const handleClearData = async () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      return;
    }

    try {
      const success = await clearAllData();
      if (success) {
        toast({
          title: "Data Cleared",
          description: "All your data has been cleared successfully.",
        });
        setShowClearConfirm(false);
        await loadStorageInfo(); // Refresh storage info
      } else {
        throw new Error("Clear failed");
      }
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "There was an error clearing your data.",
        variant: "destructive"
      });
    }
  };

  const handleTestSpeech = async () => {
    setSpeechTestStatus('testing');
    try {
      await speechEngine.testSpeech();
      setSpeechTestStatus('success');
      toast({
        title: "Speech Test Successful",
        description: "Text-to-speech is working correctly.",
      });
    } catch (error) {
      setSpeechTestStatus('error');
      toast({
        title: "Speech Test Failed",
        description: "There was an issue with text-to-speech functionality.",
        variant: "destructive"
      });
    }
    
    setTimeout(() => setSpeechTestStatus('idle'), 3000);
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      speechEngine.setDefaultOptions({ voice });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getThemeLabel = () => {
    if (settings.darkMode) return 'Dark';
    return 'Light';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Count Me Out experience and manage your data
          </p>
        </div>

        {/* Theme & Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-primary" />
              <span>Theme & Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center space-x-2">
                  {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span>Theme Mode</span>
                </Label>
                <div className="text-sm text-muted-foreground">
                  Current theme: {getThemeLabel()}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={toggleDarkMode}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>Switch to {settings.darkMode ? 'Light' : 'Dark'}</span>
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Reduce Motion</Label>
                <div className="text-sm text-muted-foreground">
                  Minimize animations and transitions for better accessibility
                </div>
              </div>
              <Switch
                checked={!settings.animations}
                onCheckedChange={toggleAnimations}
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Accessibility className="h-5 w-5 text-primary" />
              <span>Accessibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dyslexia-Friendly Mode</Label>
                <div className="text-sm text-muted-foreground">
                  Use fonts and colors optimized for dyslexia and dyscalculia
                </div>
              </div>
              <Switch
                checked={settings.dyslexiaMode}
                onCheckedChange={toggleDyslexiaMode}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">High Contrast Mode</Label>
                <div className="text-sm text-muted-foreground">
                  Enhance contrast for better readability
                </div>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={toggleHighContrast}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <span>Large Text</span>
                </Label>
                <div className="text-sm text-muted-foreground">
                  Increase font size for better visibility
                </div>
              </div>
              <Switch
                checked={settings.largeText}
                onCheckedChange={toggleLargeText}
                disabled={isSaving}
              />
            </div>

            {(settings.dyslexiaMode || settings.highContrast || settings.largeText) && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Accessibility features are active. These settings help make the app more usable for people with visual or cognitive differences.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Audio & Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <span>Audio & Voice</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Sound Effects</Label>
                <div className="text-sm text-muted-foreground">
                  Play sounds for correct/incorrect answers and feedback
                </div>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={toggleSoundEffects}
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Voice Feedback</Label>
                <div className="text-sm text-muted-foreground">
                  Speak results and instructions in audio-only mode
                </div>
              </div>
              <Switch
                checked={settings.voiceFeedback}
                onCheckedChange={toggleVoiceFeedback}
                disabled={isSaving}
              />
            </div>

            {settings.voiceFeedback && (
              <>
                <Separator />
                
                {/* Voice Selection */}
                {voices.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-base">Voice Selection</Label>
                    <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices
                          .filter(voice => voice.lang.startsWith('en'))
                          .map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Voice Speed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Voice Speed</Label>
                    <Badge variant="secondary">{settings.voiceSpeed}x</Badge>
                  </div>
                  <Slider
                    value={[settings.voiceSpeed]}
                    onValueChange={(value) => setVoiceSpeed(value[0])}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                    disabled={isSaving}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5x (Slow)</span>
                    <span>1.0x (Normal)</span>
                    <span>2.0x (Fast)</span>
                  </div>
                </div>

                {/* Speech Test */}
                <div className="space-y-3">
                  <Label className="text-base">Test Speech</Label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleTestSpeech}
                      disabled={speechTestStatus === 'testing' || !speechEngine.isSupported()}
                      className="flex items-center space-x-2"
                    >
                      <TestTube className="h-4 w-4" />
                      <span>
                        {speechTestStatus === 'testing' ? 'Testing...' : 'Test Speech'}
                      </span>
                    </Button>
                    
                    {speechTestStatus === 'success' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Working</span>
                      </div>
                    )}
                    
                    {speechTestStatus === 'error' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Failed</span>
                      </div>
                    )}
                  </div>
                  
                  {!speechEngine.isSupported() && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Text-to-speech is not supported in your browser. Audio-only mode will not work.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Achievement Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Show notifications when you unlock new achievements
                </div>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={toggleNotifications}
                disabled={isSaving}
              />
            </div>

            {settings.notifications && 'Notification' in window && Notification.permission === 'default' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Enable browser notifications to receive achievement alerts.</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => Notification.requestPermission()}
                  >
                    Enable
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Data & Privacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy Protected:</strong> All your data is stored locally on your device. 
                No information is sent to external servers or shared with third parties.
              </AlertDescription>
            </Alert>

            {/* Storage Usage */}
            {storageInfo && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base flex items-center space-x-2">
                    <HardDrive className="h-4 w-4" />
                    <span>Storage Usage</span>
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    {formatBytes(storageInfo.used)} used
                  </div>
                </div>
                
                {storageInfo.total > 0 && (
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatBytes(storageInfo.used)}</span>
                      <span>{storageInfo.percentage.toFixed(1)}% of {formatBytes(storageInfo.total)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Data Management */}
            <div className="space-y-4">
              <Label className="text-base">Data Management</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="justify-start"
                  disabled={isSaving}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearData}
                  className={cn(
                    "justify-start",
                    showClearConfirm 
                      ? "border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : ""
                  )}
                  disabled={isSaving}
                >
                  {showClearConfirm ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {showClearConfirm ? "Confirm Clear All" : "Clear All Data"}
                </Button>
              </div>

              {showClearConfirm && (
                <Alert className="border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="text-red-800 dark:text-red-300">
                        <strong>Warning:</strong> This will permanently delete all your progress, 
                        achievements, and settings. This action cannot be undone.
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowClearConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleClearData}
                        >
                          Yes, Clear Everything
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About Count Me Out</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">2024.01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-medium">
                  {storageInfo ? formatBytes(storageInfo.used) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span className="font-medium">Progressive Web App</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">
                Count Me Out is a Progressive Web App designed to help users of all ages 
                improve their mental math skills through personalized practice sessions.
              </p>
              <p>
                Built with modern web technologies and based on cognitive science principles 
                for effective learning. Works offline and respects your privacy.
              </p>
            </div>

            {/* Feature List */}
            <div className="pt-4">
              <Label className="text-base mb-3 block">Features</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Offline-capable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Audio-only mode</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Progress tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Achievement system</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Accessibility features</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>No data collection</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Status */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Saving settings...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
