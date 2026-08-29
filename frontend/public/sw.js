// AURA-MED AI — PWA Service Worker
const CACHE_NAME = 'auramed-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Background Web Push Notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'AURA-MED — MEDICATION REMINDER',
    body: 'Time to take your scheduled prescription dose.',
    reminder_id: null,
    medicine_name: 'Scheduled Medication',
    dosage: 'Prescribed dose'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: `${data.medicine_name} (${data.dosage})\nScheduled: ${data.body || 'Due Now'}`,
    icon: './favicon.svg',
    badge: './favicon.svg',
    vibrate: [200, 100, 200, 100, 200],
    tag: `reminder-${data.reminder_id || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: data,
    actions: [
      { action: 'taken', title: '✓ TAKEN' },
      { action: 'snooze', title: '⏱ SNOOZE (15m)' },
      { action: 'missed', title: '✕ MISSED' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle Notification Clicks (TAKEN / SNOOZE / MISSED Action Buttons)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const remData = event.notification.data || {};
  const remId = remData.reminder_id;

  if (remId) {
    let endpoint = `/api/reminders/${remId}/taken`;
    if (action === 'missed') endpoint = `/api/reminders/${remId}/missed`;
    if (action === 'snooze') endpoint = `/api/reminders/${remId}/snooze?minutes=15`;

    event.waitUntil(
      fetch(endpoint, { method: 'POST' }).catch((err) => console.error('SW Action error:', err))
    );
  }

  // Focus open window or open dashboard
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
