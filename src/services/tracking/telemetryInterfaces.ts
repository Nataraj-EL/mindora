/**
 * Telemetry interfaces for Mindora.
 * 
 * Provides an abstraction layer so in-browser tracking and future OS/desktop
 * daemon tracking (Electron, Rust, or native service) adhere to the identical contract.
 * 
 * Privacy Invariant:
 * Telemetry providers must NEVER log key codes, screen contents, or private personal data.
 * Only temporal active/idle presence and session boundaries are monitored.
 */

export interface TelemetryMetadata {
  providerName: string;
  source: 'browser_active_telemetry' | 'desktop_telemetry_stub';
  privacyLevel: 'strict_in_app_only' | 'os_process_monitoring';
  isAvailable: boolean;
  activeFeatures: string[];
}

export interface ITelemetryProvider {
  initialize(): void;
  dispose(): void;
  onPresenceChange(callback: (isActive: boolean) => void): () => void;
  onVisibilityChange(callback: (isVisible: boolean) => void): () => void;
  isCurrentlyActive(): boolean;
  getMetadata(): TelemetryMetadata;
}

/**
 * In-browser telemetry implementation.
 * Monitors tab visibility, window focus, and interaction presence (pointer movements, scrolls).
 * Resets an idle timeout without inspecting any user text or sensitive input.
 */
export class BrowserInAppTelemetryProvider implements ITelemetryProvider {
  private isPresent = true;
  private isVisible = true;
  private presenceCallbacks: Set<(isActive: boolean) => void> = new Set();
  private visibilityCallbacks: Set<(isVisible: boolean) => void> = new Set();
  private idleTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly IDLE_THRESHOLD_MS = 60_000; // 60s idle threshold
  private cleanupListeners: (() => void)[] = [];

  initialize(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Visibility change (tab switched / minimized)
    const handleVisibility = () => {
      this.isVisible = document.visibilityState === 'visible';
      this.visibilityCallbacks.forEach((cb) => cb(this.isVisible));
      if (!this.isVisible) {
        this.setPresence(false);
      } else {
        this.resetIdleTimer();
      }
    };

    // Window focus / blur
    const handleFocus = () => {
      this.resetIdleTimer();
    };

    const handleBlur = () => {
      this.setPresence(false);
    };

    // Presence listeners (throttled interaction timestamps, strictly NO key values)
    let lastThrottledTime = 0;
    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastThrottledTime > 1000) {
        lastThrottledTime = now;
        this.resetIdleTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pointermove', handleUserInteraction, { passive: true });
    window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true });
    window.addEventListener('wheel', handleUserInteraction, { passive: true });

    this.cleanupListeners = [
      () => document.removeEventListener('visibilitychange', handleVisibility),
      () => window.removeEventListener('focus', handleFocus),
      () => window.removeEventListener('blur', handleBlur),
      () => window.removeEventListener('pointermove', handleUserInteraction),
      () => window.removeEventListener('pointerdown', handleUserInteraction),
      () => window.removeEventListener('scroll', handleUserInteraction),
      () => window.removeEventListener('wheel', handleUserInteraction),
    ];

    this.resetIdleTimer();
  }

  private resetIdleTimer(): void {
    if (!this.isPresent) {
      this.setPresence(true);
    }
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    this.idleTimeout = setTimeout(() => {
      this.setPresence(false);
    }, this.IDLE_THRESHOLD_MS);
  }

  private setPresence(active: boolean): void {
    if (this.isPresent !== active) {
      this.isPresent = active;
      this.presenceCallbacks.forEach((cb) => cb(active));
    }
  }

  onPresenceChange(callback: (isActive: boolean) => void): () => void {
    this.presenceCallbacks.add(callback);
    callback(this.isPresent);
    return () => this.presenceCallbacks.delete(callback);
  }

  onVisibilityChange(callback: (isVisible: boolean) => void): () => void {
    this.visibilityCallbacks.add(callback);
    callback(this.isVisible);
    return () => this.visibilityCallbacks.delete(callback);
  }

  isCurrentlyActive(): boolean {
    return this.isPresent && this.isVisible;
  }

  getMetadata(): TelemetryMetadata {
    return {
      providerName: 'Mindora Browser Telemetry Provider',
      source: 'browser_active_telemetry',
      privacyLevel: 'strict_in_app_only',
      isAvailable: true,
      activeFeatures: [
        'Tab Visibility Cadence',
        'In-App Idle Presence Detector',
        'Continuous Active Time Meter',
        'Zero-Content Inspection Privacy Guard',
      ],
    };
  }

  dispose(): void {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    this.cleanupListeners.forEach((fn) => fn());
    this.presenceCallbacks.clear();
    this.visibilityCallbacks.clear();
  }
}

/**
 * Interface stub for upcoming Sprint desktop agent integration (macOS/Windows/Linux).
 */
export interface IDesktopTelemetryProvider extends ITelemetryProvider {
  subscribeForegroundAppChanges?(callback: (appName: string) => void): () => void;
  getSystemScreenTimeSummary?(dateKey: string): Promise<{ totalMinutes: number; categories: unknown[] }>;
}
