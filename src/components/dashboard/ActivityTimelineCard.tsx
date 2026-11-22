import React, { useState } from 'react';
import {
  Clock,
  Filter,
  CheckCircle2,
  Droplets,
  Activity,
  Coffee,
  Sparkles,
  Plus,
  Calendar,
  Database,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { ActivityCategory } from '../../types';
import { DateFilterOption } from '../../types/tracking';

export const ActivityTimelineCard: React.FC = () => {
  const {
    timeline,
    timelineCategoryFilter,
    setTimelineCategoryFilter,
    timelineDateFilter,
    setTimelineDateFilter,
    addTimelineItem,
  } = useWellness();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ActivityCategory>('break');

  const filteredTimeline =
    timelineCategoryFilter === 'all'
      ? timeline
      : timeline.filter((item) => item.category === timelineCategoryFilter);

  const getCategoryMeta = (cat: ActivityCategory) => {
    switch (cat) {
      case 'focus':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />,
          bg: 'bg-sage-100/70',
          border: 'border-sage-200',
          badgeText: 'Focus Session',
        };
      case 'hydration':
        return {
          icon: <Droplets className="w-3.5 h-3.5 text-calm-water" />,
          bg: 'bg-sky-100/70',
          border: 'border-sky-200',
          badgeText: 'Hydration',
        };
      case 'movement':
        return {
          icon: <Activity className="w-3.5 h-3.5 text-clay-600" />,
          bg: 'bg-clay-100/70',
          border: 'border-clay-200',
          badgeText: 'Movement',
        };
      case 'break':
        return {
          icon: <Coffee className="w-3.5 h-3.5 text-amber-600" />,
          bg: 'bg-amber-100/70',
          border: 'border-amber-200',
          badgeText: 'Restorative Break',
        };
      case 'wellbeing':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-teal-600" />,
          bg: 'bg-teal-100/70',
          border: 'border-teal-200',
          badgeText: 'Mindfulness',
        };
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTimelineItem({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Mindful habit logged.',
      category: newCategory,
      impact: 'restorative',
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const dateFilterTabs: { id: DateFilterOption; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'past_7_days', label: 'Past 7 Days' },
    { id: 'all', label: 'All Time' },
  ];

  const categoryFilterTabs: { id: 'all' | ActivityCategory; label: string }[] = [
    { id: 'all', label: 'All Types' },
    { id: 'focus', label: 'Focus' },
    { id: 'break', label: 'Breaks' },
    { id: 'hydration', label: 'Hydration' },
    { id: 'movement', label: 'Movement' },
    { id: 'wellbeing', label: 'Wellbeing' },
  ];

  return (
    <Card className="flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-stone-900">Activity Stream</h3>
                <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  IndexedDB
                </span>
              </div>
              <p className="text-xs text-stone-500">Persistent work sessions, breaks, and habits</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sand-100 hover:bg-sand-200 text-stone-800 transition-colors cursor-pointer border border-sand-200/60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Activity</span>
          </button>
        </div>

        {/* Date Filter & Category Pills Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-sand-100">
          {/* Date Selector */}
          <div className="flex items-center gap-1 p-1 bg-sand-100 rounded-xl text-xs overflow-x-auto">
            <Calendar className="w-3.5 h-3.5 text-stone-400 mx-1 shrink-0" />
            {dateFilterTabs.map((df) => (
              <button
                key={df.id}
                onClick={() => setTimelineDateFilter(df.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  timelineDateFilter === df.id
                    ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {df.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            {categoryFilterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimelineCategoryFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  timelineCategoryFilter === tab.id
                    ? 'bg-sage-700 text-white font-semibold'
                    : 'bg-sand-100/70 text-stone-600 hover:text-stone-900 hover:bg-sand-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Quick Activity Form Drawer */}
        {showAddModal && (
          <form
            onSubmit={handleCreateActivity}
            className="mb-4 p-4 rounded-xl bg-sand-50/90 border border-sand-200 text-xs space-y-3"
          >
            <span className="font-semibold text-stone-900 block text-xs">
              Record a Mindful Pause or Session
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Title (e.g. 10m Meditation)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-sand-200 bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
                required
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ActivityCategory)}
                className="w-full px-3 py-1.5 rounded-lg border border-sand-200 bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
              >
                <option value="break">Restorative Break</option>
                <option value="focus">Focus Work Session</option>
                <option value="movement">Movement / Stretch</option>
                <option value="hydration">Hydration</option>
                <option value="wellbeing">Wellbeing / Check-in</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Optional notes or reflection..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-sand-200 bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1 rounded-md text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-sage-700 text-white rounded-md font-semibold hover:bg-sage-800 cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Timeline List */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-sand-200">
          {filteredTimeline.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400 bg-sand-50/50 rounded-xl border border-dashed border-sand-200">
              <Calendar className="w-6 h-6 text-stone-300 mx-auto mb-2" />
              <p className="font-semibold text-stone-700">No recorded activities for this filter.</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Complete a focus session, log water, or click "Log Activity" to record a mindful event.
              </p>
            </div>
          ) : (
            filteredTimeline.map((item) => {
              const meta = getCategoryMeta(item.category);
              return (
                <div key={item.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full ${meta.bg} border ${meta.border} flex items-center justify-center`}
                  >
                    {meta.icon}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-900">
                        {item.title}
                      </span>
                      {item.durationMinutes && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-sand-100 font-mono text-stone-600">
                          {item.durationMinutes}m
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {item.timeDisplay}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};
