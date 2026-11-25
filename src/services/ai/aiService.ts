import {
  DailyWellnessPlan,
  AIInsightsDashboardData,
  AIPersonalizationPayload,
  AIHealthStatus,
  AIConsentSettings,
} from '../../types/ai';
import { DeterministicFallbackEngine } from './deterministicFallbackEngine';
import { storage } from '../storage/indexedDb';

class AIService {
  private healthCache: { status: AIHealthStatus; timestamp: number } | null = null;
  private readonly HEALTH_CACHE_TTL_MS = 60000; // 1 minute

  /**
   * Retrieves user consent settings from persistent storage.
   */
  async getConsentSettings(): Promise<AIConsentSettings> {
    try {
      const saved = await storage.getSetting<AIConsentSettings>('ai_consent_settings');
      if (saved) return saved;
    } catch {
      // Fallback
    }
    return {
      hasConsented: false,
      consentedAt: null,
      allowAnonymizedMetrics: false,
    };
  }

  /**
   * Updates user consent settings in persistent storage.
   */
  async saveConsentSettings(settings: AIConsentSettings): Promise<void> {
    await storage.saveSetting('ai_consent_settings', settings);
  }

  /**
   * Checks backend AI service availability and active provider.
   */
  async checkHealth(): Promise<AIHealthStatus> {
    if (this.healthCache && Date.now() - this.healthCache.timestamp < this.HEALTH_CACHE_TTL_MS) {
      return this.healthCache.status;
    }

    try {
      const response = await fetch('/api/ai/health', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const status: AIHealthStatus = {
          available: false,
          provider: 'fallback',
          error: `HTTP error ${response.status}`,
        };
        this.healthCache = { status, timestamp: Date.now() };
        return status;
      }

      const data = (await response.json()) as AIHealthStatus;
      this.healthCache = { status: data, timestamp: Date.now() };
      return data;
    } catch (err) {
      const status: AIHealthStatus = {
        available: false,
        provider: 'fallback',
        error: (err as Error).message || 'Server unreachable',
      };
      this.healthCache = { status, timestamp: Date.now() };
      return status;
    }
  }

  /**
   * Generates a personalized daily wellness plan.
   * If consent is denied or the AI provider fails, falls back to the deterministic engine.
   */
  async generateDailyPlan(payload: AIPersonalizationPayload): Promise<DailyWellnessPlan> {
    const consent = await this.getConsentSettings();

    // Invariant: If user hasn't consented, NEVER send data to external AI API
    if (!consent.hasConsented) {
      return DeterministicFallbackEngine.generateDailyPlan(payload);
    }

    try {
      // Check recent hashes to avoid repetition
      const recentHashes = await storage.getRecentRecommendationHashes(15);
      const enrichedPayload: AIPersonalizationPayload = {
        ...payload,
        recentRecommendationHashes: recentHashes,
      };

      const response = await fetch('/api/ai/daily-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedPayload),
      });

      if (!response.ok) {
        console.warn(`[AIService] Server returned ${response.status}. Using deterministic fallback.`);
        return DeterministicFallbackEngine.generateDailyPlan(payload);
      }

      const plan = (await response.json()) as DailyWellnessPlan;
      if (!plan || !Array.isArray(plan.focusBlocks) || plan.focusBlocks.length === 0) {
        return DeterministicFallbackEngine.generateDailyPlan(payload);
      }

      // Record recommendation hashes
      for (const m of plan.movementRecommendations || []) {
        const hash = `mv_${m.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        await storage.recordDeliveredRecommendation('movement', m.title, hash);
      }

      return plan;
    } catch (err) {
      console.warn('[AIService] Network failure during plan generation. Using fallback.', err);
      return DeterministicFallbackEngine.generateDailyPlan(payload);
    }
  }

  /**
   * Generates personalized pattern observations and behavioral summaries.
   * If consent is denied or the AI provider fails, falls back to the deterministic engine.
   */
  async generateInsights(payload: AIPersonalizationPayload): Promise<AIInsightsDashboardData> {
    const consent = await this.getConsentSettings();

    // Invariant: Never send metrics if consent is not granted
    if (!consent.hasConsented) {
      return DeterministicFallbackEngine.generateInsights(payload);
    }

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(`[AIService] Server returned ${response.status}. Using deterministic fallback.`);
        return DeterministicFallbackEngine.generateInsights(payload);
      }

      const insights = (await response.json()) as AIInsightsDashboardData;
      if (!insights || !Array.isArray(insights.patternObservations)) {
        return DeterministicFallbackEngine.generateInsights(payload);
      }

      return insights;
    } catch (err) {
      console.warn('[AIService] Network failure during insights analysis. Using fallback.', err);
      return DeterministicFallbackEngine.generateInsights(payload);
    }
  }
}

export const aiService = new AIService();
