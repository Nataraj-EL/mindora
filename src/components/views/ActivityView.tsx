import React, { useState } from 'react';
import {
  Clock,
  Search,
  CheckCircle2,
  Droplets,
  Activity as ActivityIcon,
  Coffee,
  Sparkles,
  Download,
  Trash2,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ActivityCategory } from '../../types';
import { DateFilterOption } from '../../types/tracking';

export const ActivityView: React.FC = () => {
  const {
    timeline,
    focusSummary,
    screenTime,
    trackingStatus,
    timelineDateFilter,
    setTimelineDateFilter,
    timelineCategoryFilter,
    setTimelineCategoryFilter,
    clearAllStoredData,
    exportStoredData,
  } = useWellness();

  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const filteredItems = timeline.filter((item) => {
    const matchesCategory =
      timelineCategoryFilter === 'all' || item.category === timelineCategoryFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat: ActivityCategory) => {
    switch (cat) {
      case 'focus':
        return <CheckCircle2 className="w-4 h-4 text-sage-600" />;
      case 'hydration':
        return <Droplets className="w-4 h-4 text-calm-water" />;
      case 'movement':
        return <ActivityIcon className="w-4 h-4 text-clay-600" />;
      case 'break':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'wellbeing':
        return <Sparkles className="w-4 h-4 text-teal-600" />;
    }
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmClear = async () => {
    await clearAllStoredData();
    setShowClearModal(false);
    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 3000);
  };

  const breaksCount = timeline.filter(
    (i) => i.category === 'break' || i.category === 'movement'
  ).length;

  const inAppMinutes = Math.max(
    Math.floor(trackingStatus.inAppActiveSeconds / 60),
    screenTime.inAppActiveMinutes
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Tracking Status Pill */}
      <div className="bg-white rounded-2xl border border-sand-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Work Pattern Tracking & Telemetry
            </h2>
            <Badge variant="sage" size="sm">
              IndexedDB Active
            </Badge>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xl">
            Real-time cadence tracking stored strictly in local browser storage. Focus intervals, mindful breaks, and in-app presence are maintained across page reloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sand-200 text-xs font-semibold text-stone-700 hover:bg-sand-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{copied ? 'Exported!' : 'Export JSON'}</span>
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {clearSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-emerald-600" />
          <span>Local storage cleared successfully. Ready for fresh session tracking.</span>
        </div>
      )}

      {/* Calculated Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sage-50 text-sage-700">
              <ActivityIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                In-App Tracked Time
              </span>
              <p className="text-xl font-bold text-stone-900 font-mono">
                {inAppMinutes} mins
              </p>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sage-100 text-sage-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Completed Focus
              </span>
              <p className="text-xl font-bold text-stone-900">
                {focusSummary.completedSessions} sessions ({focusSummary.totalFocusMinutes}m)
              </p>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Restorative Pauses
              </span>
              <p className="text-xl font-bold text-stone-900">{breaksCount} intervals</p>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-calm-water">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Avg Focus Length
              </span>
              <p className="text-xl font-bold text-stone-900 font-mono">
                {focusSummary.averageSessionLengthMinutes || 25} min
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Activity Filter & Log */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200">
          <div>
            <h3 className="text-base font-semibold text-stone-900">Historical Activity Log</h3>
            <p className="text-xs text-stone-500">Query and filter across all recorded dates</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-sand-200 text-xs bg-sand-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800 w-full sm:w-60"
            />
          </div>
        </div>

        {/* Date Filters & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-sand-100">
          {/* Date Range Tabs */}
          <div className="flex items-center gap-1 p-1 bg-sand-100 rounded-xl text-xs overflow-x-auto">
            <Calendar className="w-3.5 h-3.5 text-stone-400 mx-1 shrink-0" />
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'past_7_days', label: 'Past 7 Days' },
                { id: 'all', label: 'All History' },
              ] as { id: DateFilterOption; label: string }[]
            ).map((df) => (
              <button
                key={df.id}
                onClick={() => setTimelineDateFilter(df.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  timelineDateFilter === df.id
                    ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {df.label}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(
              [
                { id: 'all', label: 'All Types' },
                { id: 'focus', label: 'Focus' },
                { id: 'break', label: 'Breaks' },
                { id: 'movement', label: 'Movement' },
                { id: 'hydration', label: 'Hydration' },
                { id: 'wellbeing', label: 'Wellbeing' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimelineCategoryFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  timelineCategoryFilter === tab.id
                    ? 'bg-sage-700 text-white font-semibold'
                    : 'bg-sand-100 text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Table / List */}
        <div className="mt-3 divide-y divide-sand-100">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400 bg-sand-50/40 rounded-xl border border-dashed border-sand-200 mt-2">
              <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="font-semibold text-stone-700">No activity matching your selected filter.</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Switch date range or log new focus intervals to see records appear here.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-sand-50/40 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sand-100 shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-stone-900">{item.title}</span>
                      <Badge variant="stone" size="sm">
                        {item.category}
                      </Badge>
                      {item.durationMinutes && (
                        <span className="text-[11px] font-mono text-stone-500">
                          {item.durationMinutes} min
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto sm:text-right shrink-0">
                  <span className="text-xs font-mono text-stone-400">{item.timeDisplay}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Confirmation Modal to Clear Data */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear Local Activity Storage"
        subtitle="This action permanently deletes all recorded sessions and logs from this device"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              All recorded focus sessions, hydration records, and custom timeline entries in IndexedDB will be erased.
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
              onClick={handleConfirmClear}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              Yes, Clear Local Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
