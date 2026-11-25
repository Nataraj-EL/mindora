import {
  ActivityEvent,
  FocusSessionRecord,
  HydrationRecord,
  AppUsageRecord,
} from '../../types/tracking';
import {
  MoodEntry,
  AdaptiveReminder,
  NotificationToast,
  DailyWellnessPlan,
  AIInsightsDashboardData,
  ConversationMessage,
  ConversationSession,
} from '../../types';

const DB_NAME = 'mindora_wellness_db';
const DB_VERSION = 4;

class MindoraStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback: Map<string, unknown[]> = new Map();

  private isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    if (!this.isSupported()) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Activities store
        if (!db.objectStoreNames.contains('activities')) {
          const actStore = db.createObjectStore('activities', { keyPath: 'id' });
          actStore.createIndex('by_dateKey', 'dateKey', { unique: false });
          actStore.createIndex('by_category', 'category', { unique: false });
          actStore.createIndex('by_timestamp', 'timestamp', { unique: false });
        }

        // Focus sessions store
        if (!db.objectStoreNames.contains('focus_sessions')) {
          const focusStore = db.createObjectStore('focus_sessions', { keyPath: 'id' });
          focusStore.createIndex('by_dateKey', 'dateKey', { unique: false });
          focusStore.createIndex('by_completedAt', 'completedAt', { unique: false });
        }

        // Hydration logs store
        if (!db.objectStoreNames.contains('hydration_logs')) {
          const hydStore = db.createObjectStore('hydration_logs', { keyPath: 'id' });
          hydStore.createIndex('by_dateKey', 'dateKey', { unique: false });
        }

        // App usage tracking store
        if (!db.objectStoreNames.contains('app_usage')) {
          db.createObjectStore('app_usage', { keyPath: 'dateKey' });
        }

        // Mood entries store
        if (!db.objectStoreNames.contains('mood_entries')) {
          const moodStore = db.createObjectStore('mood_entries', { keyPath: 'id' });
          moodStore.createIndex('by_dateKey', 'dateKey', { unique: false });
        }

        // General settings / preferences store
        if (!db.objectStoreNames.contains('user_settings')) {
          db.createObjectStore('user_settings', { keyPath: 'key' });
        }

        // Reminders store
        if (!db.objectStoreNames.contains('reminders')) {
          const remStore = db.createObjectStore('reminders', { keyPath: 'id' });
          remStore.createIndex('by_category', 'category', { unique: false });
          remStore.createIndex('by_status', 'status', { unique: false });
          remStore.createIndex('by_dueAt', 'dueAt', { unique: false });
        }

        // Notification history store
        if (!db.objectStoreNames.contains('notification_history')) {
          const notifStore = db.createObjectStore('notification_history', { keyPath: 'id' });
          notifStore.createIndex('by_timestamp', 'timestamp', { unique: false });
          notifStore.createIndex('by_category', 'category', { unique: false });
        }

        // Sprint 4: AI Daily Plans store
        if (!db.objectStoreNames.contains('ai_daily_plans')) {
          const planStore = db.createObjectStore('ai_daily_plans', { keyPath: 'dateKey' });
          planStore.createIndex('by_generatedAt', 'generatedAt', { unique: false });
        }

        // Sprint 4: AI Insights cache store
        if (!db.objectStoreNames.contains('ai_insights_cache')) {
          const insightStore = db.createObjectStore('ai_insights_cache', { keyPath: 'id' });
          insightStore.createIndex('by_generatedAt', 'generatedAt', { unique: false });
        }

        // Sprint 4: Delivered recommendations history to avoid repetition
        if (!db.objectStoreNames.contains('ai_recommendations_history')) {
          const recHistStore = db.createObjectStore('ai_recommendations_history', { keyPath: 'id' });
          recHistStore.createIndex('by_deliveredAt', 'deliveredAt', { unique: false });
          recHistStore.createIndex('by_hash', 'hash', { unique: false });
        }

        // Sprint 5: Conversational AI Companion stores
        if (!db.objectStoreNames.contains('conversations')) {
          const convStore = db.createObjectStore('conversations', { keyPath: 'id' });
          convStore.createIndex('by_updatedAt', 'updatedAt', { unique: false });
          convStore.createIndex('by_createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('conversation_messages')) {
          const msgStore = db.createObjectStore('conversation_messages', { keyPath: 'id' });
          msgStore.createIndex('by_conversationId', 'conversationId', { unique: false });
          msgStore.createIndex('by_timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- Activities ---

  async saveActivity(activity: ActivityEvent): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('activities', 'readwrite');
        const store = tx.objectStore('activities');
        const req = store.put(activity);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('activities') as ActivityEvent[]) || [];
      const index = list.findIndex((a) => a.id === activity.id);
      if (index >= 0) list[index] = activity;
      else list.unshift(activity);
      this.memoryFallback.set('activities', list);
    }
  }

  async getActivities(dateKey?: string, category?: string): Promise<ActivityEvent[]> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('activities', 'readonly');
        const store = tx.objectStore('activities');

        let req: IDBRequest;
        if (dateKey) {
          const index = store.index('by_dateKey');
          req = index.getAll(IDBKeyRange.only(dateKey));
        } else {
          req = store.getAll();
        }

        req.onsuccess = () => {
          let results = (req.result as ActivityEvent[]) || [];
          if (category && category !== 'all') {
            results = results.filter((item) => item.category === category);
          }
          // Sort newest first
          results.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          resolve(results);
        };

        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('activities') as ActivityEvent[]) || [];
      let res = [...list];
      if (dateKey) res = res.filter((a) => a.dateKey === dateKey);
      if (category && category !== 'all') res = res.filter((a) => a.category === category);
      return res;
    }
  }

  // --- Focus Sessions ---

  async saveFocusSession(session: FocusSessionRecord): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('focus_sessions', 'readwrite');
        const store = tx.objectStore('focus_sessions');
        const req = store.put(session);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('focus_sessions') as FocusSessionRecord[]) || [];
      const index = list.findIndex((s) => s.id === session.id);
      if (index >= 0) list[index] = session;
      else list.unshift(session);
      this.memoryFallback.set('focus_sessions', list);
    }
  }

  async getFocusSessions(dateKey?: string): Promise<FocusSessionRecord[]> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('focus_sessions', 'readonly');
        const store = tx.objectStore('focus_sessions');

        let req: IDBRequest;
        if (dateKey) {
          const index = store.index('by_dateKey');
          req = index.getAll(IDBKeyRange.only(dateKey));
        } else {
          req = store.getAll();
        }

        req.onsuccess = () => {
          const results = (req.result as FocusSessionRecord[]) || [];
          results.sort(
            (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
          );
          resolve(results);
        };

        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('focus_sessions') as FocusSessionRecord[]) || [];
      return dateKey ? list.filter((s) => s.dateKey === dateKey) : list;
    }
  }

  // --- Hydration Logs ---

  async saveHydrationLog(log: HydrationRecord): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('hydration_logs', 'readwrite');
        const store = tx.objectStore('hydration_logs');
        const req = store.put(log);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('hydration_logs') as HydrationRecord[]) || [];
      list.push(log);
      this.memoryFallback.set('hydration_logs', list);
    }
  }

  async getHydrationLogs(dateKey?: string): Promise<HydrationRecord[]> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('hydration_logs', 'readonly');
        const store = tx.objectStore('hydration_logs');

        let req: IDBRequest;
        if (dateKey) {
          const index = store.index('by_dateKey');
          req = index.getAll(IDBKeyRange.only(dateKey));
        } else {
          req = store.getAll();
        }

        req.onsuccess = () => {
          const results = (req.result as HydrationRecord[]) || [];
          resolve(results);
        };

        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('hydration_logs') as HydrationRecord[]) || [];
      return dateKey ? list.filter((h) => h.dateKey === dateKey) : list;
    }
  }

  // --- App Usage ---

  async saveAppUsage(usage: AppUsageRecord): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('app_usage', 'readwrite');
        const store = tx.objectStore('app_usage');
        const req = store.put(usage);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.memoryFallback.set(`app_usage_${usage.dateKey}`, [usage]);
    }
  }

  async getAppUsage(dateKey: string): Promise<AppUsageRecord | null> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('app_usage', 'readonly');
        const store = tx.objectStore('app_usage');
        const req = store.get(dateKey);
        req.onsuccess = () => resolve((req.result as AppUsageRecord) || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const item = (this.memoryFallback.get(`app_usage_${dateKey}`) as AppUsageRecord[])?.[0];
      return item || null;
    }
  }

  // --- Mood Entries ---

  async saveMoodEntry(entry: MoodEntry & { dateKey: string }): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('mood_entries', 'readwrite');
        const store = tx.objectStore('mood_entries');
        const req = store.put(entry);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('mood_entries') as (MoodEntry & { dateKey: string })[]) || [];
      list.unshift(entry);
      this.memoryFallback.set('mood_entries', list);
    }
  }

  async getMoodEntries(dateKey?: string): Promise<MoodEntry[]> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('mood_entries', 'readonly');
        const store = tx.objectStore('mood_entries');

        let req: IDBRequest;
        if (dateKey) {
          const index = store.index('by_dateKey');
          req = index.getAll(IDBKeyRange.only(dateKey));
        } else {
          req = store.getAll();
        }

        req.onsuccess = () => {
          const results = (req.result as (MoodEntry & { dateKey: string })[]) || [];
          resolve(results);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('mood_entries') as (MoodEntry & { dateKey: string })[]) || [];
      return dateKey ? list.filter((m) => m.dateKey === dateKey) : list;
    }
  }

  // --- User Settings / Preferences ---

  async saveSetting<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('user_settings', 'readwrite');
        const store = tx.objectStore('user_settings');
        const req = store.put({ key, value });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`mindora_setting_${key}`, JSON.stringify(value));
      }
    }
  }

  async getSetting<T>(key: string): Promise<T | null> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('user_settings', 'readonly');
        const store = tx.objectStore('user_settings');
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && 'value' in req.result) {
            resolve(req.result.value as T);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(`mindora_setting_${key}`);
        return item ? (JSON.parse(item) as T) : null;
      }
      return null;
    }
  }

  // --- Reminders & Notifications ---

  async saveReminder(reminder: AdaptiveReminder): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('reminders', 'readwrite');
        const store = tx.objectStore('reminders');
        const req = store.put(reminder);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('reminders') as AdaptiveReminder[]) || [];
      const idx = list.findIndex((r) => r.id === reminder.id);
      if (idx >= 0) list[idx] = reminder;
      else list.unshift(reminder);
      this.memoryFallback.set('reminders', list);
    }
  }

  async getReminders(): Promise<AdaptiveReminder[]> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('reminders', 'readonly');
        const store = tx.objectStore('reminders');
        const req = store.getAll();
        req.onsuccess = () => {
          const results = (req.result as AdaptiveReminder[]) || [];
          resolve(results);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return (this.memoryFallback.get('reminders') as AdaptiveReminder[]) || [];
    }
  }

  async saveNotificationToast(toast: NotificationToast): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('notification_history', 'readwrite');
        const store = tx.objectStore('notification_history');
        const req = store.put(toast);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('notification_history') as NotificationToast[]) || [];
      list.unshift(toast);
      this.memoryFallback.set('notification_history', list);
    }
  }

  async getNotificationHistory(limit = 50): Promise<NotificationToast[]> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('notification_history', 'readonly');
        const store = tx.objectStore('notification_history');
        const req = store.getAll();
        req.onsuccess = () => {
          let results = (req.result as NotificationToast[]) || [];
          results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          if (limit > 0) results = results.slice(0, limit);
          resolve(results);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('notification_history') as NotificationToast[]) || [];
      return list.slice(0, limit);
    }
  }

  // --- AI Personalization & Daily Plans (Sprint 4) ---

  async saveDailyPlan(plan: DailyWellnessPlan): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('ai_daily_plans', 'readwrite');
        const store = tx.objectStore('ai_daily_plans');
        const req = store.put(plan);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const plans = (this.memoryFallback.get('ai_daily_plans') as DailyWellnessPlan[]) || [];
      const idx = plans.findIndex((p) => p.dateKey === plan.dateKey);
      if (idx >= 0) plans[idx] = plan;
      else plans.unshift(plan);
      this.memoryFallback.set('ai_daily_plans', plans);
    }
  }

  async getDailyPlan(dateKey: string): Promise<DailyWellnessPlan | null> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('ai_daily_plans', 'readonly');
        const store = tx.objectStore('ai_daily_plans');
        const req = store.get(dateKey);
        req.onsuccess = () => resolve((req.result as DailyWellnessPlan) || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const plans = (this.memoryFallback.get('ai_daily_plans') as DailyWellnessPlan[]) || [];
      return plans.find((p) => p.dateKey === dateKey) || null;
    }
  }

  async saveAIInsights(data: AIInsightsDashboardData): Promise<void> {
    const entry = {
      id: 'latest_insights',
      ...data,
    };
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('ai_insights_cache', 'readwrite');
        const store = tx.objectStore('ai_insights_cache');
        const req = store.put(entry);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.memoryFallback.set('ai_insights_cache', [entry]);
    }
  }

  async getLatestAIInsights(): Promise<AIInsightsDashboardData | null> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('ai_insights_cache', 'readonly');
        const store = tx.objectStore('ai_insights_cache');
        const req = store.get('latest_insights');
        req.onsuccess = () => resolve((req.result as AIInsightsDashboardData) || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('ai_insights_cache') as AIInsightsDashboardData[]) || [];
      return list[0] || null;
    }
  }

  async recordDeliveredRecommendation(category: string, title: string, hash: string): Promise<void> {
    const record = {
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category,
      title,
      hash,
      deliveredAt: new Date().toISOString(),
    };
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('ai_recommendations_history', 'readwrite');
        const store = tx.objectStore('ai_recommendations_history');
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('ai_recommendations_history') as typeof record[]) || [];
      list.push(record);
      this.memoryFallback.set('ai_recommendations_history', list);
    }
  }

  async getRecentRecommendationHashes(limit = 20): Promise<string[]> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('ai_recommendations_history', 'readonly');
        const store = tx.objectStore('ai_recommendations_history');
        const req = store.getAll();
        req.onsuccess = () => {
          const items = (req.result || []) as Array<{ deliveredAt: string; hash: string }>;
          items.sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime());
          resolve(items.slice(0, limit).map((i) => i.hash));
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('ai_recommendations_history') as Array<{ hash: string }>) || [];
      return list.map((i) => i.hash).slice(0, limit);
    }
  }

  // --- Sprint 5: Conversational AI Companion ---

  async saveConversation(session: ConversationSession): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('conversations', 'readwrite');
        const store = tx.objectStore('conversations');
        const req = store.put(session);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('conversations') as ConversationSession[]) || [];
      const idx = list.findIndex((c) => c.id === session.id);
      if (idx >= 0) list[idx] = session;
      else list.unshift(session);
      this.memoryFallback.set('conversations', list);
    }
  }

  async getConversations(): Promise<ConversationSession[]> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('conversations', 'readonly');
        const store = tx.objectStore('conversations');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []) as ConversationSession[];
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('conversations') as ConversationSession[]) || [];
      return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }

  async getConversation(id: string): Promise<ConversationSession | null> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('conversations', 'readonly');
        const store = tx.objectStore('conversations');
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as ConversationSession) || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('conversations') as ConversationSession[]) || [];
      return list.find((c) => c.id === id) || null;
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      const db = await this.openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('conversations', 'readwrite');
        const store = tx.objectStore('conversations');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      await this.deleteMessages(id);
    } catch {
      const list = (this.memoryFallback.get('conversations') as ConversationSession[]) || [];
      this.memoryFallback.set('conversations', list.filter((c) => c.id !== id));
      await this.deleteMessages(id);
    }
  }

  async saveMessage(message: ConversationMessage): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('conversation_messages', 'readwrite');
        const store = tx.objectStore('conversation_messages');
        const req = store.put(message);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('conversation_messages') as ConversationMessage[]) || [];
      const idx = list.findIndex((m) => m.id === message.id);
      if (idx >= 0) list[idx] = message;
      else list.push(message);
      this.memoryFallback.set('conversation_messages', list);
    }
  }

  async getMessages(conversationId: string): Promise<ConversationMessage[]> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('conversation_messages', 'readonly');
        const store = tx.objectStore('conversation_messages');
        const index = store.index('by_conversationId');
        const req = index.getAll(conversationId);
        req.onsuccess = () => {
          const list = (req.result || []) as ConversationMessage[];
          list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (this.memoryFallback.get('conversation_messages') as ConversationMessage[]) || [];
      return list
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
  }

  async deleteMessages(conversationId: string): Promise<void> {
    try {
      const db = await this.openDatabase();
      const messages = await this.getMessages(conversationId);
      return new Promise((resolve, reject) => {
        const tx = db.transaction('conversation_messages', 'readwrite');
        const store = tx.objectStore('conversation_messages');
        messages.forEach((m) => store.delete(m.id));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const list = (this.memoryFallback.get('conversation_messages') as ConversationMessage[]) || [];
      this.memoryFallback.set('conversation_messages', list.filter((m) => m.conversationId !== conversationId));
    }
  }

  async clearAllConversations(): Promise<void> {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['conversations', 'conversation_messages'], 'readwrite');
        tx.objectStore('conversations').clear();
        tx.objectStore('conversation_messages').clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      this.memoryFallback.set('conversations', []);
      this.memoryFallback.set('conversation_messages', []);
    }
  }

  // --- Seed check & Clear ---

  async isDataSeeded(): Promise<boolean> {
    try {
      const seeded = await this.getSetting<boolean>('is_initial_data_seeded');
      return !!seeded;
    } catch {
      return false;
    }
  }

  async seedInitialDataset(
    initialActivities: ActivityEvent[],
    initialSessions: FocusSessionRecord[],
    initialHydrations: HydrationRecord[],
    initialMoods: (MoodEntry & { dateKey: string })[]
  ): Promise<void> {
    const isSeeded = await this.isDataSeeded();
    if (isSeeded) return;

    for (const act of initialActivities) {
      await this.saveActivity(act);
    }
    for (const sess of initialSessions) {
      await this.saveFocusSession(sess);
    }
    for (const hyd of initialHydrations) {
      await this.saveHydrationLog(hyd);
    }
    for (const mood of initialMoods) {
      await this.saveMoodEntry(mood);
    }

    await this.saveSetting('is_initial_data_seeded', true);
  }

  async clearAllData(): Promise<void> {
    try {
      const db = await this.openDatabase();
      const storeNames = [
        'activities',
        'focus_sessions',
        'hydration_logs',
        'app_usage',
        'mood_entries',
        'reminders',
        'notification_history',
        'ai_daily_plans',
        'ai_insights_cache',
        'ai_recommendations_history',
        'conversations',
        'conversation_messages',
      ];
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeNames, 'readwrite');
        storeNames.forEach((name) => tx.objectStore(name).clear());
        tx.oncomplete = () => {
          this.memoryFallback.clear();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      this.memoryFallback.clear();
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    }
  }
}

export const storage = new MindoraStorage();
