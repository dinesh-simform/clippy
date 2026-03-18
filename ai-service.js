const DEFAULT_AI_SETTINGS = {
  enabled: false,
  provider: 'azure-openai',
  azureEndpoint: '',
  azureApiKey: '',
  azureDeployment: '',
  azureApiVersion: '2024-02-15-preview',
  model: 'gpt-4o-mini',
  openAIBaseUrl: 'https://api.openai.com/v1',
  openAIApiKey: '',
  temperature: 0.2,
  maxTokens: 500,
  redactSensitiveBeforeSend: true,
  timeoutMs: 30000
};

function mergeAISettings(base = {}) {
  return {
    ...DEFAULT_AI_SETTINGS,
    ...(base || {})
  };
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function redactSensitiveContent(text) {
  if (!text) return '';

  let redacted = text;
  redacted = redacted.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]');
  redacted = redacted.replace(/\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?){2,4}\d{2,4}\b/g, '[REDACTED_PHONE]');
  redacted = redacted.replace(/\b(?:sk|rk|pk|ghp|xoxb|xoxp|AKIA)[A-Za-z0-9_-]{8,}\b/g, '[REDACTED_TOKEN]');
  redacted = redacted.replace(/\b(?:Bearer\s+)?[A-Za-z0-9-_]{24,}\.[A-Za-z0-9-_]{6,}\.[A-Za-z0-9-_]{6,}\b/g, '[REDACTED_JWT]');
  return redacted;
}

async function safeFetchJson(url, options, timeoutMs) {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is unavailable in this Electron runtime.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    const bodyText = await response.text();
    let bodyJson = null;

    try {
      bodyJson = bodyText ? JSON.parse(bodyText) : null;
    } catch (e) {
      bodyJson = null;
    }

    if (!response.ok) {
      const providerError = bodyJson && bodyJson.error && bodyJson.error.message
        ? bodyJson.error.message
        : bodyText || `HTTP ${response.status}`;
      throw new Error(`AI provider request failed: ${providerError}`);
    }

    return bodyJson;
  } finally {
    clearTimeout(timer);
  }
}

class AIService {
  constructor(getSettings) {
    this.getSettings = getSettings;
  }

  getRuntimeSettings() {
    return mergeAISettings(this.getSettings ? this.getSettings() : {});
  }

  getStatus() {
    const settings = this.getRuntimeSettings();
    return {
      enabled: !!settings.enabled,
      configured: this.isConfigured(settings),
      provider: settings.provider
    };
  }

  isConfigured(settings) {
    if (!settings.enabled) return false;

    if (settings.provider === 'azure-openai') {
      return !!(settings.azureEndpoint && settings.azureApiKey && settings.azureDeployment);
    }

    if (settings.provider === 'openai') {
      return !!settings.openAIApiKey;
    }

    return !!(settings.openAIBaseUrl && settings.openAIApiKey);
  }

  preprocessText(text, settings) {
    const input = (text || '').toString();
    if (!settings.redactSensitiveBeforeSend) return input;
    return redactSensitiveContent(input);
  }

  async summarize(text) {
    const systemInstruction = 'You are a clipboard assistant. Summarize the user text in 3 concise bullet points. Keep key facts and action items.';
    const content = `Summarize this clipboard content:\n\n${text}`;
    return this.chat([
      { role: 'system', content: systemInstruction },
      { role: 'user', content }
    ]);
  }

  async rewrite(text, style) {
    const rewriteStyle = (style || 'concise and professional').toString();
    const systemInstruction = 'You rewrite user text while preserving meaning. Keep output clear and accurate.';
    const content = `Rewrite the following clipboard content in this style: ${rewriteStyle}.\n\n${text}`;
    return this.chat([
      { role: 'system', content: systemInstruction },
      { role: 'user', content }
    ]);
  }

  async suggestTags(text) {
    const systemInstruction = 'You are a clipboard assistant. Given the user text, suggest up to 6 short tags (1-3 words each) that describe topics, intents, and categories. Output ONLY a valid JSON array of strings and nothing else. Prefer short phrases.';
    const content = `Suggest tags for this clipboard content:\n\n${text}`;
    const resp = await this.chat([
      { role: 'system', content: systemInstruction },
      { role: 'user', content }
    ]);

    // Try to parse JSON array from resp.text
    const out = (resp && resp.text) ? resp.text.trim() : '';
    // Attempt to extract JSON array
    try {
      const start = out.indexOf('[');
      const end = out.lastIndexOf(']');
      if (start !== -1 && end !== -1 && end > start) {
        const jsonStr = out.slice(start, end + 1);
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          const normalized = Array.from(new Set(parsed.map(p => (p || '').toString().trim()).filter(Boolean))).slice(0,6);
          return { tags: normalized, raw: out };
        }
      }
    } catch (e) {
      // fallthrough
    }

    // Fallback: split lines or commas and normalize
    const candidates = Array.from(new Set(out.split(/\n|,|;/).map(s => s.trim()).filter(Boolean))).slice(0,6);
    return { tags: candidates, raw: out };
  }

  async chat(messages) {
    const settings = this.getRuntimeSettings();

    if (!settings.enabled) {
      throw new Error('AI is disabled. Enable it in Settings.');
    }

    if (!this.isConfigured(settings)) {
      throw new Error('AI is not configured. Add provider credentials in Settings.');
    }

    const safeMessages = (Array.isArray(messages) ? messages : [])
      .filter((m) => m && typeof m.content === 'string' && m.content.trim())
      .map((m) => ({
        role: m.role === 'assistant' || m.role === 'system' ? m.role : 'user',
        content: this.preprocessText(m.content, settings)
      }));

    if (safeMessages.length === 0) {
      throw new Error('No messages were provided.');
    }

    if (settings.provider === 'azure-openai') {
      return this.callAzureOpenAI(safeMessages, settings);
    }

    return this.callOpenAICompatible(safeMessages, settings);
  }

  async callAzureOpenAI(messages, settings) {
    const endpoint = settings.azureEndpoint.replace(/\/$/, '');
    const url = `${endpoint}/openai/deployments/${encodeURIComponent(settings.azureDeployment)}/chat/completions?api-version=${encodeURIComponent(settings.azureApiVersion)}`;

    const payload = {
      messages,
      temperature: clampNumber(settings.temperature, 0, 2, 0.2),
      max_tokens: clampNumber(settings.maxTokens, 64, 2000, 500)
    };

    const data = await safeFetchJson(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': settings.azureApiKey
      },
      body: JSON.stringify(payload)
    }, clampNumber(settings.timeoutMs, 5000, 120000, 30000));

    const text = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : '';

    if (!text) {
      throw new Error('AI provider returned an empty response.');
    }

    return {
      text,
      usage: data.usage || null,
      provider: 'azure-openai'
    };
  }

  async callOpenAICompatible(messages, settings) {
    const baseUrl = (settings.provider === 'openai' ? 'https://api.openai.com/v1' : settings.openAIBaseUrl).replace(/\/$/, '');
    const url = `${baseUrl}/chat/completions`;

    const payload = {
      model: settings.model || 'gpt-4o-mini',
      messages,
      temperature: clampNumber(settings.temperature, 0, 2, 0.2),
      max_tokens: clampNumber(settings.maxTokens, 64, 2000, 500)
    };

    const data = await safeFetchJson(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.openAIApiKey}`
      },
      body: JSON.stringify(payload)
    }, clampNumber(settings.timeoutMs, 5000, 120000, 30000));

    const text = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : '';

    if (!text) {
      throw new Error('AI provider returned an empty response.');
    }

    return {
      text,
      usage: data.usage || null,
      provider: settings.provider
    };
  }
}

function createAIService(getSettings) {
  return new AIService(getSettings);
}

module.exports = {
  createAIService,
  DEFAULT_AI_SETTINGS,
  mergeAISettings
};
