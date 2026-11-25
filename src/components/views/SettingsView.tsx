import React, { useState } from 'react';
import {
  User,
  Bell,
  CheckCircle2,
  Clock,
  Droplets,
  Target,
  Monitor,
  Database,
  Shield,
  Trash2,
  Download,
  AlertTriangle,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
  Cpu,
  Lock,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { ReminderCategory } from '../../types/reminders';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateUserGoals,
    clearAllStoredData,
    exportStoredData,
    notificationSettings,
    updateNotificationSettings,
    browserPermission,
    requestBrowserNotificationPermission,
    aiConsent,
    updateAiConsent,
    aiHealth,
    generateDailyPlan,
    refreshAiInsights,
  } = useWellness();

  const [maxScreenHours, setMaxScreenHours] = useState(
    (user.dailyGoals.maxScreenTimeMinutes / 60).toString()
  );
  const [targetFocusHours, setTargetFocusHours] = useState(
    (user.dailyGoals.targetFocusMinutes / 60).toString()
  );
  const [hydrationGlasses, setHydrationGlasses] = useState(
    user.dailyGoals.hydrationGlasses.toString()
  );
  const [breaksCount, setBreaksCount] = useState(
    user.dailyGoals.breaksCount.toString()
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserGoals({
      maxScreenTimeMinutes: Math.round(parseFloat(maxScreenHours || '6') * 60),
      targetFocusMinutes: Math.round(parseFloat(targetFocusHours || '2.5') * 60),
      hydrationGlasses: parseInt(hydrationGlasses || '8', 10),
      breaksCount: parseInt(breaksCount || '6', 10),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearData = async () => {
    await clearAllStoredData();
    setShowClearModal(false);
    setClearedSuccess(true);
    setTimeout(() => setClearedSuccess(false), 3000);
  };

  const handleExport = async () => {
    const jsonStr = await exportStoredData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindora-telemetry-archive-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 3000);
  };

  const handleToggleCategory = (category: ReminderCategory) => {
    const updated = {
      ...notificationSettings.categoryPreferences,
      [category]: !notificationSettings.categoryPreferences[category],
    };
    updateNotificationSettings({ categoryPreferences: updated });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-sand-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Settings & Adaptive Wellness
            </h2>
            <p className="text-sm text-stone-500">
              Customize daily targets, intelligent notification pacing, and local storage controls
            </p>
          </div>
          {savedSuccess && (
            <span className="text-xs font-semibold text-sage-800 bg-sage-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sage-600" /> Changes saved
            </span>
          )}
          {clearedSuccess && (
            <span className="text-xs font-semibold text-red-800 bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-red-600" /> Storage erased
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-sand-100 text-stone-700">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">User Profile</h3>
              <p className="text-xs text-stone-500">Local workstation identity</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-sand-50/70 border border-sand-200/60 mb-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs mb-3"
            />
            <h4 className="font-bold text-stone-900 text-sm">{user.name}</h4>
            <p className="text-xs text-stone-500">{user.title}</p>
            <span className="text-[11px] text-stone-400 font-mono mt-1">{user.email}</span>
          </div>

          <div className="space-y-2 text-xs text-stone-600">
            <div className="flex justify-between py-1.5 border-b border-sand-100">
              <span>Timezone</span>
              <span className="font-medium text-stone-800">{user.timezone}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sand-100">
              <span>Member Since</span>
              <span className="font-medium text-stone-800">{user.joinedDate}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span>Storage Driver</span>
              <span className="font-medium text-emerald-700 flex items-center gap-1">
                <Database className="w-3 h-3" /> IndexedDB v3 Active
              </span>
            </div>
          </div>
        </Card>

        {/* Right Column: Daily Targets, Adaptive Notifications, and Privacy */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Goals */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Daily Wellness Goals</h3>
                <p className="text-xs text-stone-500">
                  Calibrate thresholds to match your workload stamina
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-stone-400" />
                    Max Screen Time (Hours/day)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="2"
                    max="14"
                    value={maxScreenHours}
                    onChange={(e) => setMaxScreenHours(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-sand-50/70 border border-sand-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Recommended: 6.0 - 7.0 hours
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-stone-400" />
                    Target Focus Blocks (Hours/day)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="8"
                    value={targetFocusHours}
                    onChange={(e) => setTargetFocusHours(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-sand-50/70 border border-sand-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Equates to ~6 deep 25-minute Pomodoros
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-calm-water" />
                    Hydration Goal (Glasses / 250ml each)
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="16"
                    value={hydrationGlasses}
                    onChange={(e) => setHydrationGlasses(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-sand-50/70 border border-sand-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Current target: {parseInt(hydrationGlasses || '8', 10) * 250} ml
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    Intentional Restorative Breaks
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="15"
                    value={breaksCount}
                    onChange={(e) => setBreaksCount(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-sand-50/70 border border-sand-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Screen pauses, outdoor steps, or eye rests
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary">
                  Update Daily Targets
                </Button>
              </div>
            </form>
          </Card>

          {/* Adaptive Notification & Scheduling Engine */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Adaptive Notification & Scheduling
                </h3>
                <p className="text-xs text-stone-500">
                  Intelligent pacing based on fatigue telemetry and quiet hours
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Browser Notification Permissions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-sand-50/80 border border-sand-200/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 block">
                      Web Browser Notifications
                    </span>
                    <Badge
                      variant={
                        browserPermission === 'granted'
                          ? 'success'
                          : browserPermission === 'denied'
                          ? 'warning'
                          : 'sand'
                      }
                      size="sm"
                    >
                      {browserPermission === 'granted'
                        ? 'Permitted'
                        : browserPermission === 'denied'
                        ? 'Blocked in Browser'
                        : 'Permission Needed'}
                    </Badge>
                  </div>
                  <span className="text-stone-500 text-[11px] mt-0.5 block">
                    Receive system alerts even when the browser is unfocused or backgrounded
                  </span>
                </div>

                {browserPermission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={requestBrowserNotificationPermission}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sage-700 hover:bg-sage-800 text-white cursor-pointer self-start sm:self-auto transition-colors"
                  >
                    Enable Browser Alerts
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      updateNotificationSettings({
                        browserNotificationsEnabled: !notificationSettings.browserNotificationsEnabled,
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer self-start sm:self-auto ${
                      notificationSettings.browserNotificationsEnabled
                        ? 'bg-sage-700 text-white'
                        : 'bg-sand-200 text-stone-600 hover:bg-sand-300'
                    }`}
                  >
                    {notificationSettings.browserNotificationsEnabled ? 'Active' : 'Disabled'}
                  </button>
                )}
              </div>

              {/* In-App Toasts & Sound */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50/70 border border-sand-200/60">
                  <div>
                    <span className="font-semibold text-stone-800 block">In-App Toasts</span>
                    <span className="text-stone-500 text-[11px]">
                      Gentle corner toast alerts
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateNotificationSettings({
                        inAppToastsEnabled: !notificationSettings.inAppToastsEnabled,
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      notificationSettings.inAppToastsEnabled
                        ? 'bg-sage-700 text-white'
                        : 'bg-sand-200 text-stone-600 hover:bg-sand-300'
                    }`}
                  >
                    {notificationSettings.inAppToastsEnabled ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50/70 border border-sand-200/60">
                  <div>
                    <span className="font-semibold text-stone-800 block">Zen Audio Chime</span>
                    <span className="text-stone-500 text-[11px]">528Hz harmonic tone</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateNotificationSettings({
                        soundAlertsEnabled: !notificationSettings.soundAlertsEnabled,
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      notificationSettings.soundAlertsEnabled
                        ? 'bg-sage-700 text-white'
                        : 'bg-sand-200 text-stone-600 hover:bg-sand-300'
                    }`}
                  >
                    {notificationSettings.soundAlertsEnabled ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5" /> On
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5" /> Muted
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quiet Hours Configuration */}
              <div className="p-3.5 rounded-xl bg-sand-50/70 border border-sand-200/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-stone-600" />
                    <div>
                      <span className="font-semibold text-stone-800 block">Quiet Hours</span>
                      <span className="text-stone-500 text-[11px]">
                        Suppress routine and low-priority alerts during deep focus or meals
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateNotificationSettings({
                        quietHoursEnabled: !notificationSettings.quietHoursEnabled,
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      notificationSettings.quietHoursEnabled
                        ? 'bg-sage-700 text-white'
                        : 'bg-sand-200 text-stone-600 hover:bg-sand-300'
                    }`}
                  >
                    {notificationSettings.quietHoursEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {notificationSettings.quietHoursEnabled && (
                  <div className="flex items-center gap-3 pt-2 border-t border-sand-200/60">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-stone-500">From:</span>
                      <input
                        type="time"
                        value={notificationSettings.quietHoursStart}
                        onChange={(e) =>
                          updateNotificationSettings({ quietHoursStart: e.target.value })
                        }
                        className="px-2 py-1 rounded-lg border border-sand-300 bg-white font-mono text-stone-800 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-stone-500">Until:</span>
                      <input
                        type="time"
                        value={notificationSettings.quietHoursEnd}
                        onChange={(e) =>
                          updateNotificationSettings({ quietHoursEnd: e.target.value })
                        }
                        className="px-2 py-1 rounded-lg border border-sand-300 bg-white font-mono text-stone-800 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Category Preferences */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-2">
                  Enabled Intervention Categories
                </span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'hydration', label: 'Hydration' },
                      { id: 'eye-break', label: 'Eye Care (20-20-20)' },
                      { id: 'posture', label: 'Posture' },
                      { id: 'movement', label: 'Movement' },
                      { id: 'breathing', label: 'Breathing' },
                      { id: 'rest', label: 'Rest Pauses' },
                    ] as { id: ReminderCategory; label: string }[]
                  ).map((cat) => {
                    const isEnabled = notificationSettings.categoryPreferences[cat.id];
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isEnabled
                            ? 'bg-sage-100 text-sage-900 border border-sage-300'
                            : 'bg-sand-100 text-stone-400 line-through border border-sand-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* AI Personalization & Data Privacy Controls (Sprint 4) */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">
                    AI Personalization & Privacy Guardrails
                  </h3>
                  <p className="text-xs text-stone-500">
                    Configure intelligent recommendations and cloud boundary controls
                  </p>
                </div>
              </div>
              {aiHealth.available ? (
                <Badge variant="sage" size="sm" icon={<Cpu className="w-3 h-3 text-sage-600" />}>
                  Provider: {aiHealth.provider} ({aiHealth.model || 'active'})
                </Badge>
              ) : (
                <Badge variant="sand" size="sm">
                  🌱 Local Deterministic Engine
                </Badge>
              )}
            </div>

            <div className="space-y-4 text-xs">
              {/* Consent Toggle */}
              <div className="p-3.5 rounded-xl bg-sand-50/80 border border-sand-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-semibold text-stone-900 block flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-500" />
                    Allow AI Telemetry Personalization
                  </span>
                  <p className="text-[11px] text-stone-600 leading-relaxed max-w-lg">
                    When enabled, Mindora transmits only anonymous aggregate statistics (such as focus durations, session counts, and general mood ratings) to the configured server AI provider to generate tailored daily plans and rhythm insights.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateAiConsent(!aiConsent.hasConsented)}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0 ${
                    aiConsent.hasConsented
                      ? 'bg-sage-600 text-white shadow-xs hover:bg-sage-700'
                      : 'bg-sand-200 text-stone-700 hover:bg-sand-300'
                  }`}
                >
                  {aiConsent.hasConsented ? 'Consent Granted ✓' : 'Consent Disabled'}
                </button>
              </div>

              {/* Privacy Notice Invariant */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-sand-200 text-stone-600 space-y-1 text-[11px] leading-relaxed">
                <span className="font-semibold text-stone-800 block">Strict Privacy Invariants:</span>
                <p>• Keystroke logs, screen captures, and application content are <strong>never</strong> collected.</p>
                <p>• API keys are strictly kept on the server and are <strong>never</strong> transmitted to the client.</p>
                <p>• If consent is revoked or disabled, 100% of wellness plans and insights are computed locally using the deterministic fallback engine.</p>
              </div>

              {/* Regenerate Plan & Insights */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <span className="font-semibold text-stone-800 block">Recalibrate AI Profile</span>
                  <span className="text-stone-500 text-[11px]">
                    Force refresh daily wellness plan and behavioral insights with latest metrics
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      generateDailyPlan(true);
                      refreshAiInsights();
                    }}
                    className="text-xs"
                  >
                    Recalibrate Plan & Insights
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Persistent Storage & Privacy Controls */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-sky-50 text-calm-water">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Data Sovereignty & Privacy Controls
                </h3>
                <p className="text-xs text-stone-500">
                  Manage your local IndexedDB storage and telemetry privacy
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-sand-50/80 border border-sand-200/70">
                <div className="flex items-center gap-2 font-semibold text-stone-900 mb-1">
                  <Database className="w-3.5 h-3.5 text-sage-700" />
                  <span>Local Storage Architecture</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Mindora stores all your focus session history, hydration logs, and daily wellness scores in your local browser’s IndexedDB (<code>mindora_wellness_db</code>). Your data never leaves your computer.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <span className="font-semibold text-stone-800 block">Export Telemetry Data</span>
                  <span className="text-stone-500 text-[11px]">
                    Download a full JSON archive of your recorded work patterns
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sand-300 text-xs font-semibold text-stone-700 hover:bg-sand-100 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{exportedSuccess ? 'Downloaded!' : 'Export JSON'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-sand-100">
                <div>
                  <span className="font-semibold text-red-800 block">Erase Stored Activity</span>
                  <span className="text-stone-500 text-[11px]">
                    Permanently delete all recorded history and start from a clean state
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal to Clear Data */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Stored Data"
        subtitle="This action will delete all recorded sessions, hydration records, and custom goals from IndexedDB."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              Are you sure? Once cleared, historical records cannot be recovered unless previously exported.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowClearModal(false)}
              className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-sand-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleClearData}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              Yes, Erase Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
