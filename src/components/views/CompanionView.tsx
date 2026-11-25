import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareHeart,
  Send,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Bot,
  User as UserIcon,
  Check,
  X,
  AlertCircle,
  ShieldAlert,
  Wind,
  Eye,
  Droplets,
  Target,
  ArrowRight,
} from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';
import {
  ConversationMessage,
  ConversationSession,
  ChatPromptSuggestion,
} from '../../types/conversation';
import { conversationService } from '../../services/conversation/conversationService';
import { GuidedExperienceCard } from '../companion/GuidedExperienceCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export const CompanionView: React.FC = () => {
  const {
    aiConsent,
    aiHealth,
    focusSummary,
    screenTime,
    hydration,
    user,
    wellnessScore,
    moodEntries,
    setActiveTab,
  } = useWellness();

  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested contextual conversation starters
  const suggestedPrompts: ChatPromptSuggestion[] = [
    {
      id: 'p_1',
      label: '4-7-8 Breathing Reset',
      prompt: 'Can you guide me through a 4-7-8 breathing exercise to calm down mental strain?',
      category: 'recovery',
    },
    {
      id: 'p_2',
      label: '20-20-20 Eye Relief',
      prompt: 'My eyes feel tired from continuous screens. Can you guide me through an eye reset?',
      category: 'ergonomics',
    },
    {
      id: 'p_3',
      label: 'Workday Focus Check',
      prompt: 'How is my deep focus and break rhythm looking today based on my tracked metrics?',
      category: 'focus',
    },
    {
      id: 'p_4',
      label: 'Desk Shoulder Stretch',
      prompt: 'Can you walk me through a 2-minute desk neck and shoulder stretch?',
      category: 'ergonomics',
    },
    {
      id: 'p_5',
      label: 'Hydration Check-in',
      prompt: 'How is my hydration pacing today, and am I behind my daily target?',
      category: 'hydration',
    },
    {
      id: 'p_6',
      label: 'Focus Sprint Prep',
      prompt: 'Help me set clear intentions before I begin my next deep work focus block.',
      category: 'focus',
    },
  ];

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      const list = await conversationService.getConversations();
      setConversations(list);
      if (list.length > 0) {
        setActiveConversationId(list[0].id);
      } else {
        // Create initial welcoming session
        const initial = await conversationService.createConversation('Welcome to Mindora');
        setConversations([initial]);
        setActiveConversationId(initial.id);
      }
    };
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    const loadMessages = async () => {
      const msgs = await conversationService.getMessages(activeConversationId);
      setMessages(msgs);
    };
    loadMessages();
  }, [activeConversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Build current telemetry context payload for conversational awareness
  const buildContextPayload = () => {
    const latestMood = moodEntries[moodEntries.length - 1];
    return {
      userGoals: user.dailyGoals,
      todayMetrics: {
        focusMinutes: focusSummary.totalFocusMinutes,
        focusSessionCount: focusSummary.completedSessions,
        averageSessionMinutes: focusSummary.averageSessionLengthMinutes,
        screenTimeMinutes: screenTime.totalMinutes,
        inAppActiveMinutes: screenTime.inAppActiveMinutes,
        continuousStrainMinutes: screenTime.activeContinuousMinutes,
        hydrationGlasses: hydration.currentGlasses,
        breakCount: user.dailyGoals.breaksCount,
        wellnessScore: wellnessScore.overall,
      },
      recentMoodSummary: latestMood
        ? {
            latestMoodLevel: latestMood.level,
            latestMoodLabel: latestMood.label,
            averageMoodScore: latestMood.level,
          }
        : undefined,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeConversationId || isGenerating) return;

    setInputText('');
    setIsGenerating(true);

    try {
      const payload = buildContextPayload();
      const { userMessage, assistantMessage } = await conversationService.sendMessage(
        activeConversationId,
        text,
        payload
      );

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // Refresh conversations list to update title and timestamps
      const updatedList = await conversationService.getConversations();
      setConversations(updatedList);
    } catch {
      // In case of unexpected crash
      const errorMsg: ConversationMessage = {
        id: `err_${Date.now()}`,
        conversationId: activeConversationId,
        role: 'assistant',
        content: "I encountered a momentary hiccup connecting to the assistant. Please try sending your message again.",
        timestamp: new Date().toISOString(),
        status: 'error',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewConversation = async () => {
    const newSession = await conversationService.createConversation('New Wellness Session');
    setConversations((prev) => [newSession, ...prev]);
    setActiveConversationId(newSession.id);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await conversationService.deleteConversation(id);
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeConversationId === id) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        const fresh = await conversationService.createConversation('New Wellness Session');
        setConversations([fresh]);
        setActiveConversationId(fresh.id);
      }
    }
  };

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(id);
    setEditTitleValue(currentTitle);
  };

  const saveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await conversationService.renameConversation(id, editTitleValue);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: editTitleValue || 'Wellness Session' } : c))
    );
    setEditingTitleId(null);
  };

  const handleClearAll = async () => {
    await conversationService.clearAllConversations();
    const fresh = await conversationService.createConversation('Welcome to Mindora');
    setConversations([fresh]);
    setActiveConversationId(fresh.id);
    setMessages([]);
    setShowClearModal(false);
  };

  const activeSession = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-5">
      {/* Left Sidebar: Conversation Sessions */}
      <div className="w-full lg:w-72 xl:w-80 flex flex-col bg-white rounded-2xl border border-sand-200/90 shadow-xs overflow-hidden shrink-0">
        <div className="p-4 border-b border-sand-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sage-50 text-sage-700">
              <MessageSquareHeart className="w-4 h-4" />
            </span>
            <span className="font-bold text-sm text-stone-900 tracking-tight">Conversations</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleNewConversation}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs py-1 px-2.5"
          >
            New Session
          </Button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-sand-50">
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = editingTitleId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`group p-3 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-sage-50/90 border border-sage-200/90 text-stone-900 shadow-2xs'
                    : 'hover:bg-sand-50/80 text-stone-600 border border-transparent'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitleValue}
                      onChange={(e) => setEditTitleValue(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-white border border-sage-400 rounded-md focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={(e) => saveRename(conv.id, e)}
                      className="p-1 text-sage-700 hover:text-sage-900"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingTitleId(null)}
                      className="p-1 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs truncate max-w-[170px] text-stone-900">
                        {conv.title}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => startRename(conv.id, conv.title, e)}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-sand-200/60"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete session"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">{conv.preview}</p>
                    <span className="text-[10px] text-stone-400 block mt-1">
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with Clear All */}
        <div className="p-3 border-t border-sand-100 flex items-center justify-between text-xs text-stone-500 bg-sand-50/40">
          <span>{conversations.length} sessions stored</span>
          <button
            onClick={() => setShowClearModal(true)}
            className="text-stone-400 hover:text-red-700 transition-colors cursor-pointer text-[11px]"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-sand-200/90 shadow-xs overflow-hidden">
        {/* Top Chat Header */}
        <div className="p-4 border-b border-sand-100 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sage-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-5 h-5 text-sage-100" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-stone-900 tracking-tight truncate">
                  {activeSession?.title || 'Wellness Companion'}
                </h3>
                {aiHealth.available ? (
                  <Badge variant="sage" size="sm" icon={<Sparkles className="w-3 h-3 text-sage-600" />}>
                    {aiHealth.provider}
                  </Badge>
                ) : (
                  <Badge variant="sand" size="sm">
                    Local Engine
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-stone-500 truncate">
                Mindful focus coach & ergonomic guide • Non-clinical support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!aiConsent.hasConsented ? (
              <button
                onClick={() => setActiveTab('settings')}
                className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                Local Privacy Mode
              </button>
            ) : (
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium hidden sm:inline-block">
                Context Enabled
              </span>
            )}
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            /* Empty State / Welcome Screen with Suggested Starters */
            <div className="h-full flex flex-col justify-center items-center text-center max-w-xl mx-auto py-8">
              <div className="w-14 h-14 rounded-2xl bg-sage-100/90 text-sage-700 flex items-center justify-center mb-4 shadow-xs">
                <Sparkles className="w-7 h-7 text-sage-600" />
              </div>

              <h3 className="text-xl font-bold text-stone-900 tracking-tight mb-2">
                Mindora Wellness Companion
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-md mb-6">
                I'm here to help you sustain healthy cognitive energy, recover from screen strain, and guide you through calming micro-resets throughout your workday.
              </p>

              {/* Suggested conversation starters */}
              <div className="w-full text-left">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2 text-center">
                  Suggested Contextual Starters
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestedPrompts.map((sug) => (
                    <button
                      key={sug.id}
                      onClick={() => handleSendMessage(sug.prompt)}
                      className="p-3 rounded-xl border border-sand-200 hover:border-sage-400 hover:bg-sage-50/50 text-left transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-semibold text-stone-900 group-hover:text-sage-900 flex items-center justify-between">
                        {sug.label}
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-sage-700 transition-transform group-hover:translate-x-0.5" />
                      </span>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-1">
                        {sug.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Rendered Messages */
            messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-sage-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Bot className="w-4 h-4 text-sage-100" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-sage-700 text-white rounded-br-xs'
                          : msg.isCrisisHelp
                          ? 'bg-rose-50 border border-rose-200 text-stone-800 rounded-bl-xs'
                          : 'bg-sand-50/90 border border-sand-200/80 text-stone-800 rounded-bl-xs'
                      }`}
                    >
                      {/* Crisis Warning Banner */}
                      {msg.isCrisisHelp && (
                        <div className="flex items-center gap-2 font-bold text-rose-800 mb-2 pb-2 border-b border-rose-200 text-xs">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>Immediate Support & Care Resources</span>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Interactive Guided Reset widget if offered */}
                      {msg.guidedExperience && (
                        <GuidedExperienceCard experience={msg.guidedExperience} />
                      )}
                    </div>

                    <span
                      className={`text-[10px] text-stone-400 block px-1 ${
                        isUser ? 'text-right' : 'text-left'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-sand-200 text-stone-700 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isGenerating && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-sage-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                <Bot className="w-4 h-4 text-sage-100" />
              </div>
              <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 text-xs flex items-center gap-1.5 text-stone-500 rounded-bl-xs">
                <span className="w-2 h-2 rounded-full bg-sage-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-sage-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-sage-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1.5 text-stone-400">Mindora is reflecting…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 border-t border-sand-200/80 bg-white">
          {/* Quick action chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 text-xs">
            <button
              onClick={() => handleSendMessage('Can you guide me through a 4-7-8 breathing reset?')}
              className="px-2.5 py-1 rounded-lg bg-sand-100 hover:bg-sage-100 text-stone-700 hover:text-sage-900 transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-[11px]"
            >
              <Wind className="w-3 h-3 text-teal-600" />
              <span>4-7-8 Breath</span>
            </button>
            <button
              onClick={() => handleSendMessage('Run a 20-20-20 eye relaxation timer.')}
              className="px-2.5 py-1 rounded-lg bg-sand-100 hover:bg-sage-100 text-stone-700 hover:text-sage-900 transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-[11px]"
            >
              <Eye className="w-3 h-3 text-sky-600" />
              <span>20-20-20 Eye Reset</span>
            </button>
            <button
              onClick={() => handleSendMessage('How is my focus and break rhythm looking today?')}
              className="px-2.5 py-1 rounded-lg bg-sand-100 hover:bg-sage-100 text-stone-700 hover:text-sage-900 transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-[11px]"
            >
              <Target className="w-3 h-3 text-amber-600" />
              <span>Focus Status</span>
            </button>
            <button
              onClick={() => handleSendMessage('How is my hydration pacing today?')}
              className="px-2.5 py-1 rounded-lg bg-sand-100 hover:bg-sage-100 text-stone-700 hover:text-sage-900 transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-[11px]"
            >
              <Droplets className="w-3 h-3 text-blue-600" />
              <span>Hydration Status</span>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about your work rhythm, request guided breathwork, or stretch pauses…"
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-sand-50/70 border border-sand-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sage-500 text-stone-800 placeholder:text-stone-400"
              disabled={isGenerating}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputText.trim() || isGenerating}
              icon={<Send className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>

          {/* Disclaimer & Privacy footer note */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 px-1">
            <span>Mindora provides digital ergonomics & lifestyle coaching, not clinical or therapy services.</span>
            <span>Local privacy guaranteed</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Clear All Conversations */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Chat History"
        subtitle="This action will delete all conversation sessions and messages from your local IndexedDB storage."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              Are you sure? All stored conversation logs will be permanently erased.
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
              onClick={handleClearAll}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs cursor-pointer"
            >
              Yes, Clear History
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
