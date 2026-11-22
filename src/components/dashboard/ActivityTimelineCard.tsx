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
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import { Card } from '../common/Card';
import { ActivityCategory } from '../../types';

export const ActivityTimelineCard: React.FC = () => {
  const {
    timeline,
    timelineCategoryFilter,
    setTimelineCategoryFilter,
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

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTimelineItem({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Mindful habit logged.',
      category: newCategory,
      impact: 'restorative',
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const filterTabs: { id: 'all' | ActivityCategory; label: string }[] = [
    { id: 'all', label: 'All' },
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
              <h3 className="text-sm font-semibold text-stone-900">Today's Activity Stream</h3>
              <p className="text-xs text-stone-500">Real-time work sessions & recovery log</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sand-100 hover:bg-sand-200 text-stone-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Activity</span>
          </button>
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
                className="px-3 py-1 rounded-md text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-sage-700 text-white rounded-md font-semibold hover:bg-sage-800"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Category Filters Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 mr-1" />
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimelineCategoryFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                timelineCategoryFilter === tab.id
                  ? 'bg-sage-700 text-white font-semibold'
                  : 'bg-sand-100/80 text-stone-600 hover:text-stone-900 hover:bg-sand-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline List */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-sand-200">
          {filteredTimeline.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-400">
              No activity logged in this category today yet.
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
