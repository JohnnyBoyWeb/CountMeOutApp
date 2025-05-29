import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import {
  Accessibility,
  Volume2,
  Shield,
  Download,
  Trash2,
  HardDrive,
  AlertTriangle
} from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { 
    settings, 
    isLoading, 
    isSaving,
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
        onOpenChange(false);
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

  const loadStorageInfo = async () => {
    if (open && !storageInfo) {
      const info = await getStorageUsage();
      setStorageInfo(info);
    }
  };

  // Load storage info when dialog opens
  React.useEffect(() => {
    loadStorageInfo();
  }, [open]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your Count Me Out experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Accessibility Settings */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Accessibility className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Accessibility</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dyslexia-Friendly Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Use fonts and colors optimized for dyslexia
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
                  <Label className="text-base">Large Text</Label>
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Reduce Motion</Label>
                  <div className="text-sm text-muted-foreground">
                    Minimize animations and transitions
                  </div>
                </div>
                <Switch
                  checked={!settings.animations}
                  onCheckedChange={toggleAnimations}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Audio & Voice Settings */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Volume2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Audio & Voice</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Sound Effects</Label>
                  <div className="text-sm text-muted-foreground">
                    Play sounds for correct/incorrect answers
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
                    Speak results in audio-only mode
                  </div>
                </div>
                <Switch
                  checked={settings.voiceFeedback}
                  onCheckedChange={toggleVoiceFeedback}
                  disabled={isSaving}
                />
              </div>

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
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Show achievement and reminder notifications
                  </div>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={toggleNotifications}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Data & Privacy */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Data & Privacy</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-2 text-green-800 dark:text-green-300 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Privacy Protected</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  All your data is stored locally on your device. No information is sent to external servers.
                </p>
              </div>

              {storageInfo && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Storage Usage</Label>
                    <div className="text-sm text-muted-foreground">
                      {formatBytes(storageInfo.used)} used
                    </div>
                  </div>
                  {storageInfo.total > 0 && (
                    <div className="space-y-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatBytes(storageInfo.used)}</span>
                        <span>{formatBytes(storageInfo.total)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col space-y-3">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full justify-start"
                  disabled={isSaving}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearData}
                  className={cn(
                    "w-full justify-start",
                    showClearConfirm 
                      ? "border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "border-border"
                  )}
                  disabled={isSaving}
                >
                  {showClearConfirm ? (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {showClearConfirm ? "Confirm Clear All Data" : "Clear All Data"}
                </Button>

                {showClearConfirm && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                      This will permanently delete all your progress, achievements, and settings. This action cannot be undone.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClearConfirm(false)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Count Me Out</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Build</span>
                <span className="font-medium">2024.01</span>
              </div>
              {storageInfo && (
                <div className="flex justify-between">
                  <span>Storage Used</span>
                  <span className="font-medium">{formatBytes(storageInfo.used)}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Built with modern web technologies for offline mental math practice. 
                Based on cognitive science principles for effective learning.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
