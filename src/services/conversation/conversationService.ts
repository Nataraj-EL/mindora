import {
  ConversationMessage,
  ConversationSession,
  GuidedExperienceData,
} from '../../types/conversation';
import { AIPersonalizationPayload } from '../../types/ai';
import { storage } from '../storage/indexedDb';
import { aiService } from '../ai/aiService';

// Crisis safety keywords for immediate de-escalation & hotline response
const CRISIS_PATTERNS = [
  /\b(kill|end)\s+(my\s*self|my\s*life)\b/i,
  /\bsuicid(e|al)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bself[-\s]?harm\b/i,
  /\bhurt\s+myself\b/i,
  /\bcan('?t|not)\s+go\s+on\s+living\b/i,
];

const CRISIS_SUPPORT_TEXT = `I hear how much weight you are carrying right now. Please know that you are not alone, and there is immediate, compassionate help available. 

As an AI wellness companion, I cannot provide psychiatric or crisis care, but please reach out to dedicated human professionals who can support you right now:

- **United States & Canada**: Call or text **988** (Suicide & Crisis Lifeline — free, confidential, available 24/7)
- **United Kingdom**: Call **111** (NHS Mental Health) or Samaritans at **116 123**
- **Crisis Text Line**: Text **HOME** to **741741** (Free, confidential 24/7 SMS support)
- **International Resources**: Visit **[findahelpline.com](https://findahelpline.com)** to find immediate free support in your country.

Please consider reaching out to one of these resources or connecting with a trusted colleague, friend, or family member right away.`;

export class ConversationService {
  /**
   * Checks if a message contains crisis language
   */
  isCrisisMessage(text: string): boolean {
    return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
  }

  /**
   * Creates a new conversation session
   */
  async createConversation(initialTitle = 'New Wellness Session'): Promise<ConversationSession> {
    const session: ConversationSession = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: initialTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preview: 'Start a conversation with your Mindora wellness companion.',
      messageCount: 0,
    };
    await storage.saveConversation(session);
    return session;
  }

  /**
   * Retrieves all conversation sessions
   */
  async getConversations(): Promise<ConversationSession[]> {
    return storage.getConversations();
  }

  /**
   * Retrieves a single conversation by ID
   */
  async getConversation(id: string): Promise<ConversationSession | null> {
    return storage.getConversation(id);
  }

  /**
   * Renames a conversation session
   */
  async renameConversation(id: string, newTitle: string): Promise<void> {
    const session = await storage.getConversation(id);
    if (!session) return;
    session.title = newTitle.trim() || 'Wellness Session';
    session.updatedAt = new Date().toISOString();
    await storage.saveConversation(session);
  }

  /**
   * Deletes a conversation session and all its messages
   */
  async deleteConversation(id: string): Promise<void> {
    await storage.deleteConversation(id);
  }

  /**
   * Clears all conversation sessions and messages
   */
  async clearAllConversations(): Promise<void> {
    await storage.clearAllConversations();
  }

  /**
   * Retrieves messages for a specific conversation
   */
  async getMessages(conversationId: string): Promise<ConversationMessage[]> {
    return storage.getMessages(conversationId);
  }

  /**
   * Sends a user message and obtains the companion response.
   * Handles crisis safeguards, external LLM calls, and rule-based local fallbacks.
   */
  async sendMessage(
    conversationId: string,
    userText: string,
    contextPayload?: AIPersonalizationPayload
  ): Promise<{ userMessage: ConversationMessage; assistantMessage: ConversationMessage }> {
    const now = new Date().toISOString();

    // 1. Create and persist User Message
    const userMessage: ConversationMessage = {
      id: `msg_u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conversationId,
      role: 'user',
      content: userText.trim(),
      timestamp: now,
      status: 'sent',
    };
    await storage.saveMessage(userMessage);

    // 2. Immediate Crisis Safeguard Check
    if (this.isCrisisMessage(userText)) {
      const assistantMessage: ConversationMessage = {
        id: `msg_a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        conversationId,
        role: 'assistant',
        content: CRISIS_SUPPORT_TEXT,
        timestamp: new Date().toISOString(),
        status: 'sent',
        isCrisisHelp: true,
      };
      await storage.saveMessage(assistantMessage);
      await this.updateConversationMetadata(conversationId, userText, assistantMessage.content);
      return { userMessage, assistantMessage };
    }

    // 3. Obtain response via External AI or Local Deterministic Engine
    let assistantMessage: ConversationMessage;
    const consent = await aiService.getConsentSettings();

    if (consent.hasConsented) {
      try {
        const history = await storage.getMessages(conversationId);
        const payloadHistory = history.map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: payloadHistory,
            contextPayload: contextPayload || {},
          }),
        });

        if (response.ok) {
          const data = await response.json();
          assistantMessage = {
            id: `msg_a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            conversationId,
            role: 'assistant',
            content: data.content,
            timestamp: new Date().toISOString(),
            status: 'sent',
            guidedExperience: data.guidedExperience,
            isCrisisHelp: data.isCrisisHelp,
          };
        } else {
          // Fallback if server returned non-200
          assistantMessage = this.generateLocalFallbackResponse(
            conversationId,
            userText,
            contextPayload
          );
        }
      } catch {
        // Fallback if network failed
        assistantMessage = this.generateLocalFallbackResponse(
          conversationId,
          userText,
          contextPayload
        );
      }
    } else {
      // Local privacy mode: compute deterministic response
      assistantMessage = this.generateLocalFallbackResponse(
        conversationId,
        userText,
        contextPayload
      );
    }

    await storage.saveMessage(assistantMessage);
    await this.updateConversationMetadata(conversationId, userText, assistantMessage.content);

    return { userMessage, assistantMessage };
  }

  /**
   * Updates conversation session title and preview
   */
  private async updateConversationMetadata(
    conversationId: string,
    userText: string,
    assistantText: string
  ): Promise<void> {
    const session = await storage.getConversation(conversationId);
    if (!session) return;

    if (session.messageCount === 0 || session.title === 'New Wellness Session') {
      // Generate clean title from first user message
      const cleanTitle = userText.slice(0, 36).trim();
      session.title = cleanTitle.length > 0 ? (cleanTitle.length >= 35 ? `${cleanTitle}…` : cleanTitle) : 'Wellness Session';
    }

    session.updatedAt = new Date().toISOString();
    session.preview = assistantText.replace(/[#*`_]/g, '').slice(0, 85).trim() + '…';
    session.messageCount += 2;
    await storage.saveConversation(session);
  }

  /**
   * High-accuracy, empathetic local fallback conversation generator
   */
  generateLocalFallbackResponse(
    conversationId: string,
    userText: string,
    context?: AIPersonalizationPayload
  ): ConversationMessage {
    const textLower = userText.toLowerCase();
    const id = `msg_a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const todayFocus = context?.todayMetrics?.focusMinutes ?? 120;
    const todaySessions = context?.todayMetrics?.focusSessionCount ?? 3;
    const todayHydration = context?.todayMetrics?.hydrationGlasses ?? 4;
    const targetHydration = context?.userGoals?.hydrationGlasses ?? 8;
    const continuousStrain = context?.todayMetrics?.continuousStrainMinutes ?? 0;

    // 1. Breathing Exercise request
    if (textLower.includes('breath') || textLower.includes('4-7-8') || textLower.includes('relax') || textLower.includes('calm')) {
      const breathingExperience: GuidedExperienceData = {
        type: 'breathing_478',
        title: '4-7-8 Parasympathetic Vagal Reset',
        category: 'break',
        durationSeconds: 180,
        steps: [
          { stepIndex: 1, label: 'Inhale', durationSeconds: 4, instruction: 'Breathe in quietly through your nose for 4 seconds.' },
          { stepIndex: 2, label: 'Hold', durationSeconds: 7, instruction: 'Retain the breath gently without straining for 7 seconds.' },
          { stepIndex: 3, label: 'Exhale', durationSeconds: 8, instruction: 'Exhale completely through your mouth with a soft whoosh for 8 seconds.' },
        ],
      };

      return {
        id,
        conversationId,
        role: 'assistant',
        content: `I'd be glad to guide you through a **4-7-8 Parasympathetic Reset**.

This technique stimulates the vagus nerve, reducing autonomic sympathetic arousal (screen tension and mental strain).

Click **Start Guided Breathwork** below to begin a paced, interactive cycle.`,
        timestamp: now,
        status: 'sent',
        guidedExperience: breathingExperience,
      };
    }

    // 2. Eye strain or 20-20-20 rule
    if (textLower.includes('eye') || textLower.includes('20-20-20') || textLower.includes('vision') || textLower.includes('screen strain')) {
      const eyeExperience: GuidedExperienceData = {
        type: 'eye_relaxation_202020',
        title: '20-20-20 Ocular Reset',
        category: 'break',
        durationSeconds: 20,
        steps: [
          { stepIndex: 1, label: 'Look Away', durationSeconds: 5, instruction: 'Shift your gaze away from all monitors and backlit screens.' },
          { stepIndex: 2, label: 'Focus at Distance', durationSeconds: 15, instruction: 'Find an object at least 20 feet (6m) away. Soften your eyelids and blink naturally.' },
        ],
      };

      return {
        id,
        conversationId,
        role: 'assistant',
        content: `Here is a quick **20-20-20 Ocular Reset** to relax the ciliary eye muscles after prolonged focus.

Continuous screen exposure locks the focal distance of your eyes. Taking 20 seconds to look at an object 20 feet away relieves eye strain and prevents tension headaches.

Launch the quick timer below:`,
        timestamp: now,
        status: 'sent',
        guidedExperience: eyeExperience,
      };
    }

    // 3. Neck & shoulder stretches
    if (textLower.includes('neck') || textLower.includes('shoulder') || textLower.includes('stretch') || textLower.includes('posture')) {
      const stretchExperience: GuidedExperienceData = {
        type: 'neck_shoulder_stretch',
        title: 'Desk Ergonomics: Scapular & Neck Release',
        category: 'movement',
        durationSeconds: 120,
        steps: [
          { stepIndex: 1, label: 'Ear to Shoulder', durationSeconds: 30, instruction: 'Slowly lower your right ear toward your right shoulder for 15s, then switch to left.' },
          { stepIndex: 2, label: 'Scapular Squeeze', durationSeconds: 30, instruction: 'Interlace fingers behind your lower back and gently squeeze shoulder blades together.' },
          { stepIndex: 3, label: 'Chin Tucks', durationSeconds: 30, instruction: 'Gently tuck your chin backward (double chin posture) to align cervical vertebrae.' },
          { stepIndex: 4, label: 'Deep Breath', durationSeconds: 30, instruction: 'Take one slow, deep belly breath with relaxed shoulders.' },
        ],
      };

      return {
        id,
        conversationId,
        role: 'assistant',
        content: `Let's relieve upper body tension with a **2-Minute Desk Stretch Protocol**.

Sitting for extended focus blocks often induces anterior head carriage and shoulder hunching. Follow the interactive steps below to reset your postural alignment.`,
        timestamp: now,
        status: 'sent',
        guidedExperience: stretchExperience,
      };
    }

    // 4. Focus and productivity status inquiries
    if (textLower.includes('focus') || textLower.includes('productivity') || textLower.includes('how am i doing') || textLower.includes('stat')) {
      return {
        id,
        conversationId,
        role: 'assistant',
        content: `Here is a summary of your tracked work patterns today:

- **Total Deep Focus**: **${todayFocus} minutes** across **${todaySessions} completed Pomodoro sessions**.
- **Continuous Strain**: Currently at **${continuousStrain} minutes** of screen time without an intentional pause.
- **Hydration Level**: **${todayHydration} of ${targetHydration} glasses** logged today.

${continuousStrain >= 45 
  ? `⚠️ *Observation*: You have been focused continuously for ${continuousStrain}m. I recommend scheduling a 5-minute restorative pause before your next task.` 
  : `✨ *Cadence*: Your focus intervals are well-paced. Keep alternating deep work with intentional micro-pauses.`}

Would you like me to guide you through a 2-minute reset or set up your next focus sprint?`,
        timestamp: now,
        status: 'sent',
      };
    }

    // 5. Hydration inquiries
    if (textLower.includes('water') || textLower.includes('hydration') || textLower.includes('drink')) {
      const deficit = targetHydration - todayHydration;
      return {
        id,
        conversationId,
        role: 'assistant',
        content: `💧 **Hydration Status Overview**:

You have logged **${todayHydration} glasses** (${todayHydration * 250}ml) toward your goal of **${targetHydration} glasses** (${targetHydration * 250}ml).

${deficit > 0 
  ? `You are currently **${deficit} glasses** behind your optimal pace. Drinking a glass now will help prevent afternoon cognitive fatigue and headaches.`
  : `🎉 Great work! You have hit your hydration target for the day.`}

You can log a glass anytime by clicking the quick "+" in the dashboard or sidebar!`,
        timestamp: now,
        status: 'sent',
      };
    }

    // 6. Focus session preparation
    if (textLower.includes('prep') || textLower.includes('start') || textLower.includes('begin') || textLower.includes('work')) {
      const focusPrepExperience: GuidedExperienceData = {
        type: 'focus_prep',
        title: 'Deep Work Intention Setting',
        category: 'focus',
        durationSeconds: 60,
        steps: [
          { stepIndex: 1, label: 'Single Task', durationSeconds: 20, instruction: 'Choose the ONE critical task you will focus on. Minimize all other tabs.' },
          { stepIndex: 2, label: 'Environment', durationSeconds: 20, instruction: 'Silence notifications and place water within arm’s reach.' },
          { stepIndex: 3, label: 'Anchor Breath', durationSeconds: 20, instruction: 'Take one centering breath and initiate your 25m Pomodoro sprint.' },
        ],
      };

      return {
        id,
        conversationId,
        role: 'assistant',
        content: `Let's set you up for a high-clarity **Deep Focus Session**.

Research shows taking 60 seconds to define a single task boundary dramatically decreases mid-session distraction. 

Click below to run the 1-minute intention-setting ritual:`,
        timestamp: now,
        status: 'sent',
        guidedExperience: focusPrepExperience,
      };
    }

    // 7. General greeting / open question
    return {
      id,
      conversationId,
      role: 'assistant',
      content: `Hello! I am your **Mindora Wellness Companion**.

I'm here to support your workday cognitive stamina, physical ergonomics, and mindful pauses. How can I assist you right now?

Here are a few things we can do together:
- 🧘 **Guide a 4-7-8 Breathing Reset**
- 👁️ **Run a 20-20-20 Eye Relaxation Timer**
- 🤸 **Lead a 2-Minute Desk Neck & Shoulder Stretch**
- 📊 **Check your focus & hydration metrics for today**
- 🎯 **Prepare for your next Deep Work session**`,
      timestamp: now,
      status: 'sent',
    };
  }
}

export const conversationService = new ConversationService();
