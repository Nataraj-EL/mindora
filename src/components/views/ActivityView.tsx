import React, { useState } from 'react';
import {
  Clock,
  Search,
  Monitor,
  CheckCircle2,
  Droplets,
  Activity as ActivityIcon,
  Coffee,
  Sparkles,
  Download,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ActivityCategory } from '../../types';

export const ActivityView: React.FC = () => {
  const { timeline, screenTime } = useWellness();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ActivityCategory>('all');
  const [copied, setCopied] = useState(false);

  const filteredItems = timeline.filter((item) => {
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
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

  const handleExport = () => {
    const dataStr = JSON.stringify(timeline, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindora-activity-log-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sage-50 text-sage-700">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Total Screen Active
              </span>
              <p className="text-xl font-bold text-stone-900">
                {Math.floor(screenTime.totalMinutes / 60)}h {screenTime.totalMinutes % 60}m
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
                Logged Pauses & Breaks
              </span>
              <p className="text-xl font-bold text-stone-900">
                {timeline.filter((i) => i.category === 'break' || i.category === 'movement').length} intervals
              </p>
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
                Total Tracked Events
              </span>
              <p className="text-xl font-bold text-stone-900">{timeline.length} logged</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Activity Filter & Log */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200">
          <div>
            <h3 className="text-base font-semibold text-stone-900">Activity Journal</h3>
            <p className="text-xs text-stone-500">Detailed timestamped records of your day</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-sand-200 text-xs bg-sand-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
              />
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sand-200 text-xs font-semibold text-stone-700 hover:bg-sand-100 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{copied ? 'Exported!' : 'Export JSON'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Items' },
              { id: 'focus', label: 'Focus Work' },
              { id: 'break', label: 'Breaks' },
              { id: 'movement', label: 'Movement' },
              { id: 'hydration', label: 'Hydration' },
              { id: 'wellbeing', label: 'Wellbeing' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                categoryFilter === tab.id
                  ? 'bg-sage-700 text-white font-semibold'
                  : 'bg-sand-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity Table / List */}
        <div className="mt-3 divide-y divide-sand-100">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No matching activity found. Try adjusting your search query.
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
    </div>
  );
};
