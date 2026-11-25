/**
 * Mindora AI Service - Server Layer
 * 
 * Provides modular LLM integration supporting Google Gemini, OpenAI,
 * Ollama, and local fallback providers.
 * 
 * SECURITY INVARIANT:
 * API keys reside strictly on the server and are NEVER sent to the client browser.
 */

// Medical safety invariant prompt included in all AI requests
const MEDICAL_SAFETY_INSTRUCTIONS = `
CRITICAL SAFETY & MEDICAL BOUNDARIES:
- Mindora is a digital ergonomic and cognitive pacing companion.
- NEVER present correlations as medical diagnoses or clinical advice.
- NEVER diagnose mental disorders, depression, anxiety, ADHD, or physiological illnesses.
- Maintain an encouraging, mindful, evidence-grounded tone regarding workday recovery, hydration pacing, and ergonomic posture.
`;

/**
 * Google Gemini Provider using Google Generative Language REST API
 */
export class GeminiProvider {
  constructor(apiKey, model = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
    this.name = 'gemini';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async healthCheck() {
    if (!this.isAvailable()) {
      return { available: false, provider: this.name, error: 'GEMINI_API_KEY is not configured.' };
    }
    return { available: true, provider: this.name, model: this.model };
  }

  async generateDailyPlan(payload) {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured');
    }

    const systemPrompt = `You are Mindora's AI Wellness Planner.
${MEDICAL_SAFETY_INSTRUCTIONS}
Analyze the user's workday metrics and generate a tailored, realistic daily wellness plan in JSON format.

JSON Schema to follow strictly:
{
  "summary": "Brief encouraging summary of today's focus-recovery rhythm (1-2 sentences)",
  "focusBlocks": [
    {
      "title": "Title of focus session (e.g. Morning Deep Architecture)",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "durationMinutes": 45,
      "targetGoal": "Specific ergonomic or focus intent"
    }
  ],
  "breakIntervals": [
    {
      "title": "Break title (e.g. Midday Daylight Walk)",
      "scheduledTime": "HH:MM",
      "durationMinutes": 10,
      "type": "micro" | "posture" | "hydration" | "restorative" | "meal"
    }
  ],
  "hydrationGoal": {
    "targetMl": 2000,
    "glassesCount": 8,
    "intervalMinutes": 60
  },
  "eyeCareSchedule": {
    "rule": "20-20-20",
    "intervalMinutes": 25,
    "targetPromptCount": 6
  },
  "movementRecommendations": [
    {
      "title": "Desk Thoracic Stretch",
      "targetWindow": "morning" | "midday" | "afternoon",
      "durationMinutes": 3,
      "description": "Step-by-step stretch instructions"
    }
  ],
  "recoverySuggestions": [
    {
      "title": "4-7-8 Breathing Cadence",
      "category": "breathing" | "meditation" | "nature" | "unplug",
      "guidance": "Restorative instructions"
    }
  ]
}
Return ONLY pure JSON.`;

    const userPrompt = `Generate a personalized daily wellness plan for this user context:
${JSON.stringify(payload, null, 2)}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini API');

    return JSON.parse(rawText);
  }

  async generateInsights(payload) {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured');
    }

    const systemPrompt = `You are Mindora's AI Behavioral Ergonomist.
${MEDICAL_SAFETY_INSTRUCTIONS}
Analyze the user's focus patterns, hydration status, break compliance, and mood history to produce actionable pattern observations and behavioral summaries in JSON format.

JSON Schema to follow strictly:
{
  "patternObservations": [
    {
      "category": "focus" | "fatigue" | "rhythm" | "hydration" | "recovery",
      "observation": "Clear description of observed behavior",
      "evidenceMetric": "Telemetry metric backing this up",
      "suggestedAdjustment": "Practical, gentle adjustment"
    }
  ],
  "weeklySummary": {
    "focusTrend": "Description of overall focus consistency",
    "circadianPeakWindow": "e.g. 09:30 - 11:30 AM",
    "fatigueDropWindow": "e.g. 14:00 - 15:15 PM",
    "breakComplianceRate": 75,
    "hydrationConsistencyRate": 80,
    "keyTakeaway": "Single high-leverage takeaway for this week"
  },
  "improvementOpportunities": [
    {
      "area": "Screen Pacing" | "Hydration Habit" | "Postural Micro-Breaks",
      "impact": "high" | "medium" | "low",
      "action": "Immediate small step to take",
      "rationale": "Why this enhances cognitive stamina"
    }
  ],
  "recommendationEffectivenessSummary": {
    "totalDelivered": 14,
    "acceptedCount": 11,
    "adherencePercentage": 79,
    "feedbackNotes": "User responds best to 5-minute movement pauses during midday dip."
  }
}
Return ONLY pure JSON.`;

    const userPrompt = `Analyze the following aggregated workday telemetry metrics:
${JSON.stringify(payload, null, 2)}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini API');

    return JSON.parse(rawText);
  }

  async chat(messages, contextPayload) {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured');
    }

    const systemPrompt = `You are Mindora, an empathetic and evidence-grounded AI mental wellness & digital ergonomics companion.
${MEDICAL_SAFETY_INSTRUCTIONS}

ROLE & OPERATING PRINCIPLES:
1. Tone: Warm, grounded, calming, and concise. Use clear markdown formatting.
2. Context Awareness: With user consent, you have access to their aggregated metrics below. Use this to provide personalized insights into their focus blocks, breaks, hydration, and fatigue.
3. Strict Grounding: NEVER hallucinate or invent metrics. If the user asks about a metric not in context, gently explain.
4. Non-Medical Stance: Remind users you are an ergonomic and cognitive wellness coach, not a doctor or therapist. Never diagnose conditions or prescribe medications.
5. CRISIS PROTOCOL: If the user indicates self-harm, suicide, severe depression, or acute crisis:
   - Immediately express deep compassion and concern.
   - Urge them to connect immediately with human professionals or someone they trust.
   - Provide these free, confidential, 24/7 hotlines:
     * US & Canada: Call or text 988 (Suicide & Crisis Lifeline)
     * UK: Call 111 or Samaritans at 116 123
     * Crisis Text Line: Text HOME to 741741
     * International: https://findahelpline.com
   - Set "isCrisisHelp": true.
6. GUIDED EXPERIENCES: When the user requests or would benefit from a guided reset (e.g. 4-7-8 breathing, 20-20-20 eye relaxation, neck/shoulder stretch, mindfulness grounding, focus prep, or evening winddown), provide a structured "guidedExperience" object with actionable steps and timings.

CURRENT USER TELEMETRY CONTEXT (Aggregated):
${JSON.stringify(contextPayload || {}, null, 2)}

OUTPUT JSON SCHEMA:
{
  "content": "Conversational markdown response",
  "guidedExperience": null | {
    "type": "breathing_478" | "eye_relaxation_202020" | "neck_shoulder_stretch" | "mindfulness_grounding" | "focus_prep" | "evening_winddown",
    "title": "Experience title",
    "category": "break" | "movement" | "wellbeing",
    "durationSeconds": 180,
    "steps": [
      {
        "stepIndex": 1,
        "label": "Step name",
        "durationSeconds": 4,
        "instruction": "Step instruction"
      }
    ]
  },
  "isCrisisHelp": false
}
Return ONLY valid JSON.`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: '{"content":"Hello, I am Mindora. I am here to support your mindful focus, restorative breaks, and digital ergonomics.","guidedExperience":null,"isCrisisHelp":false}' }] },
    ];

    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini Chat error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini API');

    return JSON.parse(rawText);
  }
}

/**
 * OpenAI Provider (ready for alternative or fallback configuration)
 */
export class OpenAIProvider {
  constructor(apiKey, model = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
    this.name = 'openai';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async healthCheck() {
    if (!this.isAvailable()) {
      return { available: false, provider: this.name, error: 'OPENAI_API_KEY is not configured.' };
    }
    return { available: true, provider: this.name, model: this.model };
  }

  async generateDailyPlan(payload) {
    if (!this.isAvailable()) throw new Error('OpenAI API key is not configured');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are Mindora's AI Wellness Planner. ${MEDICAL_SAFETY_INSTRUCTIONS} Output JSON with summary, focusBlocks, breakIntervals, hydrationGoal, eyeCareSchedule, movementRecommendations, recoverySuggestions.`,
          },
          { role: 'user', content: JSON.stringify(payload) },
        ],
      }),
    });
    if (!response.ok) throw new Error(`OpenAI error: ${await response.text()}`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async generateInsights(payload) {
    if (!this.isAvailable()) throw new Error('OpenAI API key is not configured');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are Mindora's AI Behavioral Ergonomist. ${MEDICAL_SAFETY_INSTRUCTIONS} Output JSON with patternObservations, weeklySummary, improvementOpportunities, recommendationEffectivenessSummary.`,
          },
          { role: 'user', content: JSON.stringify(payload) },
        ],
      }),
    });
    if (!response.ok) throw new Error(`OpenAI error: ${await response.text()}`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async chat(messages, contextPayload) {
    if (!this.isAvailable()) throw new Error('OpenAI API key is not configured');
    const systemPrompt = `You are Mindora, an AI-powered personalized mental wellness companion. ${MEDICAL_SAFETY_INSTRUCTIONS} Context: ${JSON.stringify(contextPayload || {})}. Return JSON with content, guidedExperience, isCrisisHelp.`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });
    if (!response.ok) throw new Error(`OpenAI Chat error: ${await response.text()}`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
}

/**
 * Ollama Provider (for local on-device models)
 */
export class OllamaProvider {
  constructor(baseUrl = 'http://localhost:11434', model = 'llama3.2') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
    this.name = 'ollama';
  }

  isAvailable() {
    return Boolean(this.baseUrl);
  }

  async healthCheck() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      if (res.ok) {
        return { available: true, provider: this.name, model: this.model };
      }
      return { available: false, provider: this.name, error: 'Ollama daemon unreachable' };
    } catch {
      return { available: false, provider: this.name, error: 'Ollama daemon offline' };
    }
  }

  async generateDailyPlan(payload) {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        format: 'json',
        stream: false,
        prompt: `System: Mindora AI Wellness Planner. ${MEDICAL_SAFETY_INSTRUCTIONS}\nPayload: ${JSON.stringify(payload)}`,
      }),
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
    const data = await res.json();
    return JSON.parse(data.response);
  }

  async generateInsights(payload) {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        format: 'json',
        stream: false,
        prompt: `System: Mindora AI Behavioral Ergonomist. ${MEDICAL_SAFETY_INSTRUCTIONS}\nPayload: ${JSON.stringify(payload)}`,
      }),
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
    const data = await res.json();
    return JSON.parse(data.response);
  }
}

/**
 * Provider Factory
 */
export function createAIProviderFromEnv() {
  const providerType = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  if (providerType === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    return new GeminiProvider(apiKey, model);
  }

  if (providerType === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY || '';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    return new OpenAIProvider(apiKey, model);
  }

  if (providerType === 'ollama') {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3.2';
    return new OllamaProvider(baseUrl, model);
  }

  // Fallback / unconfigured
  return new GeminiProvider(process.env.GEMINI_API_KEY || '', 'gemini-1.5-flash');
}
