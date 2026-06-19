/* ============================================
   HMG SermonScribe v2 — Live Broadcast Module
   BroadcastChannel for same-device projector,
   periodic QR share for congregation refresh.
   ============================================ */
export class LiveBroadcast{constructor(sessionId){this.session=sessionId||'hmg-'+Date.now().toString(36);this.bc=null;this.lastSent='';this.init();}
init(){if(typeof BroadcastChannel!=='undefined'){this.bc=new BroadcastChannel('hmg-sermonscribe-live');this.bc.onmessage=(e)=>{if(e.data?.type==='ping'&&e.data?.session===this.session){this.emit('ping',e.data);}};}}
emit(type,data){if(this.bc){this.bc.postMessage({type,session:this.session,...data});}}
broadcastTranscript(text,elapsed){const payload={type:'transcript',session:this.session,text,elapsed,timestamp:Date.now()};this.lastSent=text;this.emit('transcript',payload);try{localStorage.setItem('hmg-live-'+this.session,JSON.stringify(payload));}catch(_){}}
getShareURL(){return `${window.location.origin}${window.location.pathname.replace('index.html','')}live.html?session=${this.session}`;}
getLastPayload(){try{return JSON.parse(localStorage.getItem('hmg-live-'+this.session)||'null');}catch(_){return null;}}
}
