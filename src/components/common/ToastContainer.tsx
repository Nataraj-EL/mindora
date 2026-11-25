import React from 'react';
import {
  Eye,
  Activity,
  Droplets,
  Wind,
  Coffee,
  X,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NotificationToast, ReminderCategory } from '../../types/reminders';

interface ToastContainerProps {
  toasts: NotificationToast[];
  onDismiss: (id: string) => void;
  onComplete: (toast: NotificationToast) => void;
  onSnooze: (toast: NotificationToast, snoozeMinutes?: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onComplete,
  onSnooze,
}) => {
  if (toasts.length === 0) return null;

  const getCategoryIcon = (category: ReminderCategory) => {
    switch (category) {
      case 'eye-break':
        return <Eye className="w-4 h-4 text-amber-600" />;
      case 'posture':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'hydration':
        return <Droplets className="w-4 h-4 text-calm-water" />;
      case 'movement':
        return <Activity className="w-4 h-4 text-clay-600" />;
      case 'breathing':
        return <Wind className="w-4 h-4 text-teal-600" />;
      case 'rest':
      default:
        return <Coffee className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white rounded-2xl border border-sand-300 shadow-xl p-4 transition-all duration-300 transform translate-y-0 opacity-100 flex flex-col gap-2.5 animate-in slide-in-from-bottom-5"
        >
          {/* Top row: Category icon, Title, Close */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-sand-100 shrink-0">
                {getCategoryIcon(toast.category)}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-stone-900 block truncate">
                  {toast.title}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {toast.timestamp}
                </span>
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-sand-100 transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-stone-600 leading-relaxed">
            {toast.message}
          </p>

          {/* Trigger Reason Pill */}
          {toast.triggerReason && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sage-50 border border-sage-200/60 text-[10px] text-sage-800">
              <Sparkles className="w-3 h-3 text-sage-600 shrink-0" />
              <span className="truncate">{toast.triggerReason}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-sand-100">
            <button
              onClick={() => onSnooze(toast, 15)}
              className="px-2.5 py-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 hover:bg-sand-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              <span>Snooze 15m</span>
            </button>
            <button
              onClick={() => onComplete(toast)}
              className="px-3 py-1 text-[11px] font-semibold text-white bg-sage-700 hover:bg-sage-800 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Mark Done</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
