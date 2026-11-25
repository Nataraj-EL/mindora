import { ActivityCategory } from './index';

export type GuidedExperienceType =
  | 'breathing_478'
  | 'eye_relaxation_202020'
  | 'neck_shoulder_stretch'
  | 'mindfulness_grounding'
  | 'focus_prep'
  | 'evening_winddown';

export interface GuidedStep {
  stepIndex: number;
  label: string;
  durationSeconds: number;
  instruction: string;
}

export interface GuidedExperienceData {
  type: GuidedExperienceType;
  title: string;
  category: ActivityCategory;
  durationSeconds: number;
  steps: GuidedStep[];
  isCompleted?: boolean;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  guidedExperience?: GuidedExperienceData;
  isCrisisHelp?: boolean;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  preview: string;
  messageCount: number;
}

export interface ChatPromptSuggestion {
  id: string;
  label: string;
  prompt: string;
  category: 'focus' | 'recovery' | 'ergonomics' | 'hydration' | 'reflection';
  icon?: string;
}
