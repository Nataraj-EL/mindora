import {
  UserProfile,
  ScreenTimeData,
  FocusSessionSummary,
  WellnessScoreData,
  ReminderItem,
  ActivityTimelineItem,
  DayActivityData,
  RecommendedWellnessAction,
  WellnessInsightItem,
  MoodEntry,
} from '../types';

export const mockUserProfile: UserProfile = {
  id: 'usr_mindora_01',
  name: 'Elena Rostova',
  title: 'Lead Systems Architect & Product Strategist',
  email: 'elena.rostova@mindora.health',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
  joinedDate: 'October 2026',
  timezone: 'UTC+01:00 (CET)',
  dailyGoals: {
    maxScreenTimeMinutes: 390, // 6h 30m
    targetFocusMinutes: 150, // 2h 30m
    hydrationGlasses: 8, // 2000 ml
    breaksCount: 6,
  },
};

export const initialScreenTimeData: ScreenTimeData = {
  totalMinutes: 285, // 4h 45m estimated full workday
  inAppActiveMinutes: 38, // Tracked in-app active Mindora time
  maxTargetMinutes: 390, // 6h 30m
  activeContinuousMinutes: 38,
  continuousStrainThresholdMinutes: 50,
  changeVsYesterdayMinutes: -25, // 25 mins less screen fatigue than yesterday
  isEstimatedSystemTotal: true,
  categories: [
    {
      category: 'Deep Focus & Code',
      minutes: 135,
      percentage: 47,
      color: '#3D6B42', // Sage primary
    },
    {
      category: 'Architecture Review',
      minutes: 75,
      percentage: 26,
      color: '#7AA97E', // Sage medium
    },
    {
      category: 'Team Sync & Async Comms',
      minutes: 50,
      percentage: 18,
      color: '#A4977E', // Sand neutral
    },
    {
      category: 'Documentation & Notes',
      minutes: 25,
      percentage: 9,
      color: '#C2B8A3', // Sand light
    },
  ],
};

export const initialFocusSummary: FocusSessionSummary = {
  totalFocusMinutes: 100, // 4 sessions x 25 min
  targetFocusMinutes: 150, // 6 sessions total
  completedSessions: 4,
  targetSessions: 6,
  currentStreakDays: 7,
  averageSessionLengthMinutes: 25,
};

export const initialWellnessScore: WellnessScoreData = {
  overall: 87,
  deltaVsYesterday: 4,
  statusLabel: 'Harmonious & Sustainable',
  badgeVariant: 'optimal',
  dimensions: {
    physical: {
      name: 'Physical Ergonomics & Movement',
      score: 84,
      weight: 0.25,
      description: 'Regular micro-posture breaks and gentle standing intervals.',
      status: 'optimal',
    },
    mentalFocus: {
      name: 'Mental Focus Quality',
      score: 92,
      weight: 0.3,
      description: 'Minimal app context switching and deep flow consistency.',
      status: 'optimal',
    },
    workRhythm: {
      name: 'Pacing & Cadence',
      score: 89,
      weight: 0.25,
      description: 'Consistent 50-minute work blocks followed by screen-free resets.',
      status: 'optimal',
    },
    restRecovery: {
      name: 'Restorative Breaks',
      score: 82,
      weight: 0.2,
      description: '5 intentional pauses taken; 1 hydration check overdue.',
      status: 'good',
    },
  },
  aiObservation:
    'Your screen-to-break ratio today is 23% healthier than your 30-day baseline. Maintaining this cadence will prevent late-afternoon cognitive fatigue.',
};

export const initialReminders: ReminderItem[] = [
  {
    id: 'rem_1',
    title: 'Hydration Check-in',
    description: 'Drink 250ml of water to hit your midday target (6/8 glasses).',
    dueTime: 'Due now',
    category: 'hydration',
    urgency: 'due-soon',
    isCompleted: false,
  },
  {
    id: 'rem_2',
    title: '20-20-20 Eye Relaxation',
    description: 'Look at an object 20 feet away for 20 seconds to soothe ciliary muscle tension.',
    dueTime: 'In 12 mins',
    category: 'eye-break',
    urgency: 'routine',
    isCompleted: false,
  },
  {
    id: 'rem_3',
    title: 'Ergonomic Shoulder Roll & Stretch',
    description: 'Release shoulder blade tension with 5 backward circular rotations.',
    dueTime: 'In 35 mins',
    category: 'posture',
    urgency: 'routine',
    isCompleted: false,
  },
  {
    id: 'rem_4',
    title: 'Post-Lunch Restorative Walk',
    description: 'A brief 10-minute daylight walk to regulate circadian rhythm and glucose uptake.',
    dueTime: 'Completed at 1:30 PM',
    category: 'movement',
    urgency: 'routine',
    isCompleted: true,
  },
];

export const initialActivityTimeline: ActivityTimelineItem[] = [
  {
    id: 'act_1',
    timestamp: '2026-11-22T16:45:00',
    timeDisplay: '4:45 PM',
    title: 'Focus Session Completed',
    description: 'Deep work on Mindora system architecture & core state synchronization.',
    durationMinutes: 25,
    category: 'focus',
    impact: 'positive',
  },
  {
    id: 'act_2',
    timestamp: '2026-11-22T16:15:00',
    timeDisplay: '4:15 PM',
    title: 'Hydration Logged',
    description: 'Drank 250ml mineral water with fresh lemon slice.',
    category: 'hydration',
    impact: 'restorative',
  },
  {
    id: 'act_3',
    timestamp: '2026-11-22T15:30:00',
    timeDisplay: '3:30 PM',
    title: 'Micro-Break & Spine Stretch',
    description: 'Standing doorway chest opener & thoracic extension sequence.',
    durationMinutes: 5,
    category: 'movement',
    impact: 'restorative',
  },
  {
    id: 'act_4',
    timestamp: '2026-11-22T14:40:00',
    timeDisplay: '2:40 PM',
    title: 'Focus Session Completed',
    description: 'Sprint planning and user journey workflow mapping.',
    durationMinutes: 25,
    category: 'focus',
    impact: 'positive',
  },
  {
    id: 'act_5',
    timestamp: '2026-11-22T13:20:00',
    timeDisplay: '1:20 PM',
    title: 'Mindful Outdoor Walk',
    description: 'Screen-free neighborhood stroll in natural daylight.',
    durationMinutes: 15,
    category: 'wellbeing',
    impact: 'restorative',
  },
  {
    id: 'act_6',
    timestamp: '2026-11-22T11:45:00',
    timeDisplay: '11:45 AM',
    title: 'Focus Session Completed',
    description: 'Database schema refinement and API payload specification.',
    durationMinutes: 25,
    category: 'focus',
    impact: 'positive',
  },
  {
    id: 'act_7',
    timestamp: '2026-11-22T10:10:00',
    timeDisplay: '10:10 AM',
    title: 'Box Breathing Pause',
    description: '4-4-4-4 diaphragmatic breathing to lower pre-meeting cortisol.',
    durationMinutes: 4,
    category: 'break',
    impact: 'restorative',
  },
  {
    id: 'act_8',
    timestamp: '2026-11-22T09:15:00',
    timeDisplay: '9:15 AM',
    title: 'Day Start & Intent Setting',
    description: 'Set daily target: 6 focus blocks, max 6.5h screen time.',
    category: 'wellbeing',
    impact: 'positive',
  },
];

export const weeklyActivityData: DayActivityData[] = [
  {
    dayName: 'Mon',
    shortDate: 'Nov 17',
    screenTimeHours: 6.2,
    focusHours: 2.5,
    breakCount: 6,
    wellnessScore: 84,
    isToday: false,
  },
  {
    dayName: 'Tue',
    shortDate: 'Nov 18',
    screenTimeHours: 5.8,
    focusHours: 3.0,
    breakCount: 7,
    wellnessScore: 88,
    isToday: false,
  },
  {
    dayName: 'Wed',
    shortDate: 'Nov 19',
    screenTimeHours: 7.1,
    focusHours: 2.2,
    breakCount: 4,
    wellnessScore: 73,
    isToday: false,
  },
  {
    dayName: 'Thu',
    shortDate: 'Nov 20',
    screenTimeHours: 5.5,
    focusHours: 2.8,
    breakCount: 6,
    wellnessScore: 85,
    isToday: false,
  },
  {
    dayName: 'Fri',
    shortDate: 'Nov 21',
    screenTimeHours: 5.1,
    focusHours: 3.2,
    breakCount: 8,
    wellnessScore: 91,
    isToday: false,
  },
  {
    dayName: 'Sat',
    shortDate: 'Nov 22',
    screenTimeHours: 4.75,
    focusHours: 1.67,
    breakCount: 5,
    wellnessScore: 87,
    isToday: true,
  },
  {
    dayName: 'Sun',
    shortDate: 'Nov 23',
    screenTimeHours: 0,
    focusHours: 0,
    breakCount: 0,
    wellnessScore: 0,
    isToday: false,
  },
];

export const initialWellnessActions: RecommendedWellnessAction[] = [
  {
    id: 'act_rec_1',
    title: '4-7-8 Parasympathetic Reset',
    category: 'breathing',
    timeEstimate: '3 min',
    energyImpact: 'Deep Reset',
    description: 'Inhale through nose for 4s, hold for 7s, exhale slowly through mouth for 8s.',
    isCompleted: false,
  },
  {
    id: 'act_rec_2',
    title: 'Hydration Target Boost',
    category: 'hydration',
    timeEstimate: '1 min',
    energyImpact: 'Gentle Boost',
    description: 'Drink one fresh glass (250ml) to maintain optimal cognitive hydration.',
    isCompleted: false,
  },
  {
    id: 'act_rec_3',
    title: 'Sub-occipital Neck Release',
    category: 'stretch',
    timeEstimate: '4 min',
    energyImpact: 'Physical Relief',
    description: 'Tuck chin gently and apply gentle upward traction to ease base-of-skull tension.',
    isCompleted: false,
  },
  {
    id: 'act_rec_4',
    title: '20-20-20 Visual Depth Shift',
    category: 'eye-care',
    timeEstimate: '1 min',
    energyImpact: 'Physical Relief',
    description: 'Focus on outdoor greenery or distant horizon to relax eye muscles.',
    isCompleted: true,
  },
  {
    id: 'act_rec_5',
    title: 'Micro-Mindfulness Reflection',
    category: 'mindfulness',
    timeEstimate: '2 min',
    energyImpact: 'Gentle Boost',
    description: 'Close your eyes, notice 3 physical sensations without judgment, and release jaw tension.',
    isCompleted: false,
  },
];

export const initialMoodEntries: MoodEntry[] = [
  {
    id: 'mood_1',
    level: 4,
    label: 'Energized & Focused',
    emoji: '🌿',
    note: 'Great morning flow after the team design sync.',
    timestamp: '2:15 PM',
  },
  {
    id: 'mood_2',
    level: 3,
    label: 'Calm & Steady',
    emoji: '🌤️',
    note: 'Slight eye fatigue around noon, eased after walking.',
    timestamp: '11:30 AM',
  },
  {
    id: 'mood_3',
    level: 5,
    label: 'Inspired & Centered',
    emoji: '✨',
    note: 'Felt refreshed after morning tea and intent setting.',
    timestamp: '9:00 AM',
  },
];

export const initialInsights: WellnessInsightItem[] = [
  {
    id: 'ins_1',
    type: 'focus',
    title: 'Prime Cognitive Flow Window',
    summary: 'Your deepest uninterrupted focus periods occur consistently between 9:30 AM and 11:45 AM.',
    recommendation: 'Protect this morning window from recurring sync meetings to maximize creative throughput.',
    metricBadge: '94% Flow Quality',
    priority: 'high',
  },
  {
    id: 'ins_2',
    type: 'fatigue',
    title: 'Screen Fatigue Threshold Identified',
    summary: 'Continuous screen time over 55 minutes correlates with an 18% decline in subsequent task stamina.',
    recommendation: 'Schedule proactive 3-minute eye and mobility resets every 45-50 minutes.',
    metricBadge: '48m Optimal Interval',
    priority: 'high',
  },
  {
    id: 'ins_3',
    type: 'recovery',
    title: 'Hydration Cadence Synergy',
    summary: 'Days where 6+ glasses are logged before 3:00 PM show 26% fewer afternoon slumps.',
    recommendation: 'Keep your insulated water flask within arm’s reach at your primary workstation.',
    metricBadge: '+26% Vitality',
    priority: 'medium',
  },
  {
    id: 'ins_4',
    type: 'rhythm',
    title: 'Consistent Evening Screen Wind-down',
    summary: 'Concluding active terminal and IDE work before 7:00 PM boosted your morning readiness score by 12 points.',
    recommendation: 'Maintain your 6:30 PM digital sunset routine.',
    metricBadge: '7:00 PM Wind-down',
    priority: 'info',
  },
];
