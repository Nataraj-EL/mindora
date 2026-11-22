import { useState, useEffect, useRef } from 'react';
import { BrowserInAppTelemetryProvider } from '../services/tracking/telemetryInterfaces';
import { workPatternService } from '../services/tracking/workPatternService';

export interface AppActiveTimeState {
  isTracking: boolean;
  isIdle: boolean;
  isVisible: boolean;
  inAppActiveSeconds: number;
  continuousActiveSeconds: number;
  sessionMinutes: number;
}

export const useAppActiveTimeTracker = (enabled = true) => {
  const [state, setState] = useState<AppActiveTimeState>({
    isTracking: enabled,
    isIdle: false,
    isVisible: true,
    inAppActiveSeconds: 0,
    continuousActiveSeconds: 0,
    sessionMinutes: 0,
  });

  const providerRef = useRef<BrowserInAppTelemetryProvider | null>(null);
  const continuousSecsRef = useRef(0);
  const totalSecsRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const provider = new BrowserInAppTelemetryProvider();
    providerRef.current = provider;
    provider.initialize();

    const unsubPresence = provider.onPresenceChange((isActive) => {
      setState((prev) => ({
        ...prev,
        isIdle: !isActive,
      }));
      if (!isActive) {
        continuousSecsRef.current = 0;
      }
    });

    const unsubVisibility = provider.onVisibilityChange((isVisible) => {
      setState((prev) => ({
        ...prev,
        isVisible,
      }));
      if (!isVisible) {
        continuousSecsRef.current = 0;
      }
    });

    // 5-second interval heartbeat
    const interval = setInterval(async () => {
      if (provider.isCurrentlyActive()) {
        totalSecsRef.current += 5;
        continuousSecsRef.current += 5;

        setState((prev) => ({
          ...prev,
          inAppActiveSeconds: totalSecsRef.current,
          continuousActiveSeconds: continuousSecsRef.current,
          sessionMinutes: Math.floor(totalSecsRef.current / 60),
        }));

        try {
          await workPatternService.recordAppUsageHeartbeat(5, true);
        } catch {
          // Non-blocking telemetry persistence
        }
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      unsubPresence();
      unsubVisibility();
      provider.dispose();
      providerRef.current = null;
    };
  }, [enabled]);

  return state;
};
