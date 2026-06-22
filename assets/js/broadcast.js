/* HMG SermonScribe v4 - Broadcast Module */
export class LiveBroadcast {
  constructor() { this.channel = null; this.isBroadcasting = false; this.shareURL = ''; try { this.channel = new BroadcastChannel('sermonscribe-live'); } catch(e) { console.warn('BroadcastChannel not supported:', e); } }
  startBroadcast() { this.isBroadcasting = true; this.shareURL = window.location.origin + window.location.pathname.replace('index.html','') + 'live.html'; }
  stopBroadcast() { this.isBroadcasting = false; }
  broadcastTranscript(text, elapsed) { if (!this.isBroadcasting || !this.channel) return; this.channel.postMessage({ type: 'transcript', text, elapsed, timestamp: Date.now() }); }
  getShareURL() { return this.shareURL; }
}
