/* ============================================
 HMG SermonScribe v3 — Live Broadcast Engine
 BroadcastChannel (same-origin) + localStorage fallback (cross-tab).
 Congregation caption sharing with QR code.
 ============================================ */

export class LiveBroadcast {
  constructor() {
    this.channel = null;
    this.fallbackKey = 'hmg-sermonscribe-live-v3';
    this.listeners = [];
    this.init();
  }

  init() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('hmg-sermonscribe-live-v3');
        this.channel.onmessage = (e) => { this.notify(e.data); };
      } catch (e) { this.channel = null; }
    }
    this.initStorageFallback();
  }

  initStorageFallback() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.fallbackKey) {
        try { const data = JSON.parse(e.newValue); this.notify(data); } catch {}
      }
    });
  }

  broadcastTranscript(text, elapsed = 0) {
    const payload = { text, elapsed, timestamp: Date.now() };
    if (this.channel) { try { this.channel.postMessage(payload); } catch {} }
    try { localStorage.setItem(this.fallbackKey, JSON.stringify(payload)); } catch {}
  }

  onMessage(callback) { this.listeners.push(callback); }

  notify(data) { this.listeners.forEach(cb => { try { cb(data); } catch {} }); }

  getShareURL() {
    return `${window.location.origin}${window.location.pathname.replace(/index\.html/, 'live.html')}`;
  }
}

export function initLivePage() {
  const broadcast = new LiveBroadcast();
  const el = document.getElementById('live-caption');
  const meta = document.getElementById('live-meta');
  if (!el) return;

  broadcast.onMessage((data) => {
    if (data.text) {
      el.textContent = data.text;
      if (meta) meta.textContent = `Last updated: ${new Date(data.timestamp).toLocaleTimeString()}`;
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  });

  // Also read latest on load
  try {
    const latest = localStorage.getItem('hmg-sermonscribe-live-v3');
    if (latest) { const data = JSON.parse(latest); if (data.text) el.textContent = data.text; }
  } catch {}

  // Screen orientation lock for live captions
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {});
  }
}
