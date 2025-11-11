import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Moon, Mail, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationPreferences {
  // In-app notifications
  inApp: {
    mentions: boolean;
    directMessages: boolean;
    projectAssignments: boolean;
    allMessages: boolean;
    fileUploads: boolean;
    calendarEvents: boolean;
  };
  // Push notifications
  push: {
    mentions: boolean;
    directMessages: boolean;
    projectUpdates: boolean;
    fileUploads: boolean;
  };
  // Email notifications
  email: {
    dailyDigest: boolean;
    weeklySummary: boolean;
    realTime: boolean;
    frequency: 'never' | 'immediate' | 'hourly' | 'daily';
  };
  // Do Not Disturb
  dnd: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
    weekends: boolean;
    allowUrgent: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  inApp: {
    mentions: true,
    directMessages: true,
    projectAssignments: true,
    allMessages: false,
    fileUploads: true,
    calendarEvents: true,
  },
  push: {
    mentions: true,
    directMessages: true,
    projectUpdates: false,
    fileUploads: false,
  },
  email: {
    dailyDigest: false,
    weeklySummary: true,
    realTime: false,
    frequency: 'daily',
  },
  dnd: {
    enabled: true,
    startTime: '22:00',
    endTime: '08:00',
    weekends: false,
    allowUrgent: true,
  },
};

interface NotificationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPreferences?: Partial<NotificationPreferences>;
  onSave: (preferences: NotificationPreferences) => void;
}

export function NotificationSettings({
  open,
  onOpenChange,
  initialPreferences,
  onSave,
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    ...defaultPreferences,
    ...initialPreferences,
  });

  const [pushAvailable, setPushAvailable] = useState(false);

  useEffect(() => {
    // Check if push notifications are available
    setPushAvailable(
      'Notification' in window && Notification.permission === 'granted'
    );
  }, []);

  const updatePreference = <
    T extends keyof NotificationPreferences,
    K extends keyof NotificationPreferences[T]
  >(
    category: T,
    key: K,
    value: NotificationPreferences[T][K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // Validate at least one notification type is enabled
    const hasAnyEnabled =
      Object.values(preferences.inApp).some((v) => v) ||
      Object.values(preferences.push).some((v) => v) ||
      Object.values(preferences.email).some((v) => v);

    if (!hasAnyEnabled) {
      alert('Please enable at least one notification type');
      return;
    }

    // Save to localStorage
    localStorage.setItem(
      'notification-preferences',
      JSON.stringify(preferences)
    );

    onSave(preferences);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to initial or saved preferences
    const saved = localStorage.getItem('notification-preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    } else {
      setPreferences({ ...defaultPreferences, ...initialPreferences });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Customize how and when you receive notifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* In-App Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">In-App Notifications</h3>
            <div className="space-y-3">
              <SettingItem
                label="Mentions"
                description="When someone mentions you with @"
                checked={preferences.inApp.mentions}
                onCheckedChange={(checked) =>
                  updatePreference('inApp', 'mentions', checked)
                }
              />
              <SettingItem
                label="Direct messages"
                description="Private messages sent to you"
                checked={preferences.inApp.directMessages}
                onCheckedChange={(checked) =>
                  updatePreference('inApp', 'directMessages', checked)
                }
              />
              <SettingItem
                label="Project assignments"
                description="When you're assigned to a task or project"
                checked={preferences.inApp.projectAssignments}
                onCheckedChange={(checked) =>
                  updatePreference('inApp', 'projectAssignments', checked)
                }
              />
              <SettingItem
                label="All messages"
                description="Every message in channels you follow (can be noisy)"
                checked={preferences.inApp.allMessages}
                onCheckedChange={(checked) =>
                  updatePreference('inApp', 'allMessages', checked)
                }
              />
              <SettingItem
                label="File uploads"
                description="When files are uploaded to your projects"
                checked={preferences.inApp.fileUploads}
                onCheckedChange={(checked) =>
                  updatePreference('inApp', 'fileUploads', checked)
                }
              />
              <SettingItem
                label="Calendar events"
                description="Reminders for upcoming meetings and events"
                checked={preferences.inApp.calendarEvents}
                onCheckedChange={(checked) =>
                  updatePreference('inApp', 'calendarEvents', checked)
                }
              />
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Push Notifications</h3>
              {!pushAvailable && (
                <span className="text-xs text-muted-foreground">
                  Not enabled
                </span>
              )}
            </div>
            <div className="space-y-3">
              <SettingItem
                label="Mentions"
                description="Desktop notifications for mentions"
                checked={preferences.push.mentions}
                onCheckedChange={(checked) =>
                  updatePreference('push', 'mentions', checked)
                }
                disabled={!pushAvailable}
              />
              <SettingItem
                label="Direct messages"
                description="Desktop notifications for private messages"
                checked={preferences.push.directMessages}
                onCheckedChange={(checked) =>
                  updatePreference('push', 'directMessages', checked)
                }
                disabled={!pushAvailable}
              />
              <SettingItem
                label="Project updates"
                description="Status changes and comments on your projects"
                checked={preferences.push.projectUpdates}
                onCheckedChange={(checked) =>
                  updatePreference('push', 'projectUpdates', checked)
                }
                disabled={!pushAvailable}
              />
              <SettingItem
                label="File uploads"
                description="When new files are added to your projects"
                checked={preferences.push.fileUploads}
                onCheckedChange={(checked) =>
                  updatePreference('push', 'fileUploads', checked)
                }
                disabled={!pushAvailable}
              />
            </div>
          </div>

          {/* Email Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Notifications
            </h3>
            <div className="space-y-3">
              <SettingItem
                label="Daily digest"
                description="Summary of activity each day"
                checked={preferences.email.dailyDigest}
                onCheckedChange={(checked) =>
                  updatePreference('email', 'dailyDigest', checked)
                }
              />
              <SettingItem
                label="Weekly summary"
                description="Recap of the week every Monday"
                checked={preferences.email.weeklySummary}
                onCheckedChange={(checked) =>
                  updatePreference('email', 'weeklySummary', checked)
                }
              />
              <SettingItem
                label="Real-time"
                description="Email for every notification (not recommended)"
                checked={preferences.email.realTime}
                onCheckedChange={(checked) =>
                  updatePreference('email', 'realTime', checked)
                }
              />
            </div>
          </div>

          {/* Do Not Disturb */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Do Not Disturb
            </h3>
            <SettingItem
              label="Enable DND schedule"
              description="Mute all notifications during quiet hours"
              checked={preferences.dnd.enabled}
              onCheckedChange={(checked) =>
                updatePreference('dnd', 'enabled', checked)
              }
            />

            {preferences.dnd.enabled && (
              <div className="ml-6 space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="dnd-start" className="text-sm">
                      Start time
                    </Label>
                    <input
                      id="dnd-start"
                      type="time"
                      value={preferences.dnd.startTime}
                      onChange={(e) =>
                        updatePreference('dnd', 'startTime', e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="dnd-end" className="text-sm">
                      End time
                    </Label>
                    <input
                      id="dnd-end"
                      type="time"
                      value={preferences.dnd.endTime}
                      onChange={(e) =>
                        updatePreference('dnd', 'endTime', e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <SettingItem
                  label="Mute on weekends"
                  description="Disable notifications on Saturday and Sunday"
                  checked={preferences.dnd.weekends}
                  onCheckedChange={(checked) =>
                    updatePreference('dnd', 'weekends', checked)
                  }
                />

                <SettingItem
                  label="Allow urgent notifications"
                  description="Critical alerts will break through DND"
                  checked={preferences.dnd.allowUrgent}
                  onCheckedChange={(checked) =>
                    updatePreference('dnd', 'allowUrgent', checked)
                  }
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for individual settings
function SettingItem({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex-1 space-y-1">
        <Label
          htmlFor={label.toLowerCase().replace(/\s+/g, '-')}
          className={cn(
            'text-sm font-medium',
            disabled && 'text-muted-foreground'
          )}
        >
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={label.toLowerCase().replace(/\s+/g, '-')}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

// Hook to manage notification preferences
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    defaultPreferences
  );

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('notification-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    }
  }, []);

  const isDNDActive = (): boolean => {
    if (!preferences.dnd.enabled) return false;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // Check weekend
    if (preferences.dnd.weekends && (currentDay === 0 || currentDay === 6)) {
      return true;
    }

    // Check time range
    if (currentTime >= preferences.dnd.startTime || currentTime < preferences.dnd.endTime) {
      return true;
    }

    return false;
  };

  const shouldShowNotification = (
    type: 'mention' | 'directMessage' | 'project' | 'file',
    isUrgent = false
  ): boolean => {
    if (isDNDActive() && !isUrgent) {
      return preferences.dnd.allowUrgent ? false : false;
    }

    // Check preferences based on type
    switch (type) {
      case 'mention':
        return preferences.inApp.mentions;
      case 'directMessage':
        return preferences.inApp.directMessages;
      case 'project':
        return preferences.inApp.projectAssignments;
      case 'file':
        return preferences.inApp.fileUploads;
      default:
        return false;
    }
  };

  return {
    preferences,
    setPreferences,
    isDNDActive,
    shouldShowNotification,
  };
}
