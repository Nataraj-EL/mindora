import { createAIProviderFromEnv } from './aiService.mjs';

/**
 * Validates and sanitizes plan response object
 */
function sanitizeDailyPlan(raw, providerName) {
  return {
    id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    dateKey: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    source: 'ai',
    providerUsed: providerName,
    summary: typeof raw.summary === 'string' ? raw.summary : 'AI-optimized daily focus and recovery plan.',
    focusBlocks: Array.isArray(raw.focusBlocks) ? raw.focusBlocks.map((b, i) => ({
      id: `fb_${i}_${Date.now()}`,
      title: b.title || `Focus Sprint ${i + 1}`,
      startTime: b.startTime || '10:00',
      endTime: b.endTime || '11:00',
      durationMinutes: Number(b.durationMinutes) || 45,
      targetGoal: b.targetGoal || 'Deep technical focus',
      isCompleted: false,
    })) : [],
    breakIntervals: Array.isArray(raw.breakIntervals) ? raw.breakIntervals.map((br, i) => ({
      id: `br_${i}_${Date.now()}`,
      title: br.title || `Micro Recovery ${i + 1}`,
      scheduledTime: br.scheduledTime || '11:00',
      durationMinutes: Number(br.durationMinutes) || 5,
      type: br.type || 'micro',
      isCompleted: false,
    })) : [],
    hydrationGoal: {
      targetMl: Number(raw?.hydrationGoal?.targetMl) || 2000,
      glassesCount: Number(raw?.hydrationGoal?.glassesCount) || 8,
      intervalMinutes: Number(raw?.hydrationGoal?.intervalMinutes) || 60,
      currentGlasses: 0,
    },
    eyeCareSchedule: {
      rule: '20-20-20',
      intervalMinutes: Number(raw?.eyeCareSchedule?.intervalMinutes) || 25,
      targetPromptCount: Number(raw?.eyeCareSchedule?.targetPromptCount) || 6,
      completedCount: 0,
    },
    movementRecommendations: Array.isArray(raw.movementRecommendations) ? raw.movementRecommendations.map((m, i) => ({
      id: `mv_${i}_${Date.now()}`,
      title: m.title || 'Desk Stretch',
      targetWindow: m.targetWindow || 'midday',
      durationMinutes: Number(m.durationMinutes) || 3,
      description: m.description || 'Gentle mobility pause.',
      isCompleted: false,
    })) : [],
    recoverySuggestions: Array.isArray(raw.recoverySuggestions) ? raw.recoverySuggestions.map((r, i) => ({
      id: `rc_${i}_${Date.now()}`,
      title: r.title || 'Mindful Pause',
      category: r.category || 'breathing',
      guidance: r.guidance || 'Parasympathetic vagal breath.',
      isCompleted: false,
    })) : [],
  };
}

/**
 * Validates and sanitizes insights response object
 */
function sanitizeInsights(raw) {
  return {
    generatedAt: new Date().toISOString(),
    source: 'ai',
    patternObservations: Array.isArray(raw.patternObservations) ? raw.patternObservations.map((o, i) => ({
      id: `obs_${i}_${Date.now()}`,
      category: o.category || 'focus',
      observation: o.observation || 'Identified consistent morning deep work.',
      evidenceMetric: o.evidenceMetric || 'Direct telemetry tracking',
      isAiGenerated: true,
      suggestedAdjustment: o.suggestedAdjustment || 'Maintain 5-minute pauses between sprints.',
    })) : [],
    weeklySummary: {
      focusTrend: raw?.weeklySummary?.focusTrend || 'Stable cognitive stamina across working days.',
      circadianPeakWindow: raw?.weeklySummary?.circadianPeakWindow || '09:30 - 11:45 AM',
      fatigueDropWindow: raw?.weeklySummary?.fatigueDropWindow || '14:00 - 15:30 PM',
      breakComplianceRate: Number(raw?.weeklySummary?.breakComplianceRate) || 75,
      hydrationConsistencyRate: Number(raw?.weeklySummary?.hydrationConsistencyRate) || 80,
      keyTakeaway: raw?.weeklySummary?.keyTakeaway || 'Front-loading deep architectural work preserves evening cognitive energy.',
    },
    improvementOpportunities: Array.isArray(raw.improvementOpportunities) ? raw.improvementOpportunities.map((op, i) => ({
      id: `opp_${i}_${Date.now()}`,
      area: op.area || 'Rhythm Pacing',
      impact: op.impact || 'medium',
      action: op.action || 'Introduce a 5-minute daylight ocular reset.',
      rationale: op.rationale || 'Protects against late-afternoon focus degradation.',
    })) : [],
    recommendationEffectivenessSummary: {
      totalDelivered: Number(raw?.recommendationEffectivenessSummary?.totalDelivered) || 12,
      acceptedCount: Number(raw?.recommendationEffectivenessSummary?.acceptedCount) || 10,
      adherencePercentage: Number(raw?.recommendationEffectivenessSummary?.adherencePercentage) || 83,
      feedbackNotes: raw?.recommendationEffectivenessSummary?.feedbackNotes || 'High adherence to 20-20-20 eye care interventions.',
    },
    medicalDisclaimer: 'Mindora provides behavioral ergonomic guidance and cognitive rhythm observations, not clinical diagnoses, psychological treatment, or medical advice.',
  };
}

function sanitizeChatResponse(raw) {
  return {
    content: typeof raw?.content === 'string' && raw.content.trim().length > 0
      ? raw.content
      : "I'm here to support your mindful focus and recovery today.",
    guidedExperience: raw?.guidedExperience && typeof raw.guidedExperience.type === 'string'
      ? {
          type: raw.guidedExperience.type,
          title: raw.guidedExperience.title || 'Guided Wellness Reset',
          category: raw.guidedExperience.category || 'wellbeing',
          durationSeconds: Number(raw.guidedExperience.durationSeconds) || 180,
          steps: Array.isArray(raw.guidedExperience.steps)
            ? raw.guidedExperience.steps.map((s, idx) => ({
                stepIndex: idx + 1,
                label: s.label || `Step ${idx + 1}`,
                durationSeconds: Number(s.durationSeconds) || 5,
                instruction: s.instruction || 'Follow the rhythm gently.',
              }))
            : [],
        }
      : undefined,
    isCrisisHelp: Boolean(raw?.isCrisisHelp),
  };
}

/**
 * Handles incoming HTTP request for AI routes
 */
export async function handleAIRequest(req, res, pathname, body) {
  const provider = createAIProviderFromEnv();

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  // 1. Health check: GET /api/ai/health
  if (pathname === '/api/ai/health' && req.method === 'GET') {
    const health = await provider.healthCheck();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(health));
    return true;
  }

  // 2. Daily Plan: POST /api/ai/daily-plan
  if (pathname === '/api/ai/daily-plan' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    if (!provider.isAvailable()) {
      res.statusCode = 503;
      res.end(JSON.stringify({
        error: 'AI Provider is not configured or available',
        code: 'PROVIDER_UNAVAILABLE',
      }));
      return true;
    }

    try {
      const payload = body || {};
      const rawPlan = await provider.generateDailyPlan(payload);
      const sanitized = sanitizeDailyPlan(rawPlan, provider.name);
      res.statusCode = 200;
      res.end(JSON.stringify(sanitized));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({
        error: err.message || 'Failed to generate AI daily plan',
        code: 'GENERATION_FAILED',
      }));
    }
    return true;
  }

  // 3. Analyze & Insights: POST /api/ai/analyze
  if (pathname === '/api/ai/analyze' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    if (!provider.isAvailable()) {
      res.statusCode = 503;
      res.end(JSON.stringify({
        error: 'AI Provider is not configured or available',
        code: 'PROVIDER_UNAVAILABLE',
      }));
      return true;
    }

    try {
      const payload = body || {};
      const rawInsights = await provider.generateInsights(payload);
      const sanitized = sanitizeInsights(rawInsights);
      res.statusCode = 200;
      res.end(JSON.stringify(sanitized));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({
        error: err.message || 'Failed to analyze wellness metrics',
        code: 'ANALYSIS_FAILED',
      }));
    }
    return true;
  }

  // 4. Conversational Chat: POST /api/ai/chat (Sprint 5)
  if (pathname === '/api/ai/chat' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    if (!provider.isAvailable()) {
      res.statusCode = 503;
      res.end(JSON.stringify({
        error: 'AI Provider is not configured or available',
        code: 'PROVIDER_UNAVAILABLE',
      }));
      return true;
    }

    try {
      const { messages, contextPayload } = body || {};
      const rawResponse = await provider.chat(messages || [], contextPayload || {});
      const sanitized = sanitizeChatResponse(rawResponse);
      res.statusCode = 200;
      res.end(JSON.stringify(sanitized));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({
        error: err.message || 'Failed to generate chat response',
        code: 'CHAT_FAILED',
      }));
    }
    return true;
  }

  return false;
}
