const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJSON(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const url = endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check backend connection.');
    }
    throw err;
  }
}

export const api = {
  // Health & Model Status
  getHealth: () => fetchJSON('/health'),
  getAIStatus: () => fetchJSON('/ai/status'),
  getAIMetrics: () => fetchJSON('/ai/metrics'),
  predictRisk: () => fetchJSON('/ai/predict', { method: 'POST' }),

  // Vault Security Auth
  verifyVaultPin: (pin) => fetchJSON('/auth/verify-vault-pin', { method: 'POST', body: JSON.stringify({ pin }) }),
  getCurrentUser: () => fetchJSON('/auth/me'),

  // Medicines CRUD
  getMedicines: () => fetchJSON('/medicines'),
  createMedicine: (data) => fetchJSON('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  updateMedicine: (id, data) => fetchJSON(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMedicine: (id) => fetchJSON(`/medicines/${id}`, { method: 'DELETE' }),

  // Reminders Actions
  getReminders: (status = null) => fetchJSON(`/reminders${status ? `?filter_status=${status}` : ''}`),
  markTaken: (id) => fetchJSON(`/reminders/${id}/taken`, { method: 'POST' }),
  markMissed: (id) => fetchJSON(`/reminders/${id}/missed`, { method: 'POST' }),
  snoozeReminder: (id, minutes = 15) => fetchJSON(`/reminders/${id}/snooze?minutes=${minutes}`, { method: 'POST' }),

  // Smart Prescription OCR Endpoint
  uploadPrescriptionOCR: async (formData) => {
    const url = `${API_BASE}/ocr/prescription`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `OCR processing failed with status ${response.status}`);
    }
    return await response.json();
  },

  // Notifications & Web Push PWA
  getVapidPublicKey: () => fetchJSON('/notifications/vapid-public-key'),
  subscribePush: (subscription) => fetchJSON('/notifications/subscribe', { method: 'POST', body: JSON.stringify(subscription) }),
  triggerTestNotification: (channel = 'Web Push') => fetchJSON('/notifications/test-trigger', { method: 'POST', body: JSON.stringify({ channel }) }),
  getNotificationDiagnostics: () => fetchJSON('/notifications/diagnostics'),
  getNotificationLogs: () => fetchJSON('/notifications/logs'),

  // WhatsApp Integration
  getWhatsAppStatus: () => fetchJSON('/whatsapp/status'),
  triggerWhatsAppTest: () => fetchJSON('/whatsapp/test-trigger', { method: 'POST' }),

  // Analytics & History
  getAdherence: () => fetchJSON('/adherence'),
  getAdherenceHistory: (limit = 50) => fetchJSON(`/adherence/history?limit=${limit}`),
  getAnalytics: () => fetchJSON('/analytics'),
  getCaregiverOverview: () => fetchJSON('/caregiver/overview')
};
