import { isSupabaseConfigured, supabase } from './supabaseClient';

export interface FamilySafetyAlertEvent {
  senderId: string;
  senderName: string;
  relationship?: string;
  newStatus: 'SAFE' | 'AT RISK';
  locationName: string;
  timestamp: string;
  familyConnectionId?: string;
}

export type FamilyAlertSubscriber = (event: FamilySafetyAlertEvent) => void;

class FamilyAlertServiceImpl {
  private subscribers = new Set<FamilyAlertSubscriber>();
  private realtimeChannel: any = null;
  private localBroadcastChannel: BroadcastChannel | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.initLocalBroadcast();
    this.initSupabaseRealtime();
    this.requestWebNotificationPermission();
  }

  /**
   * Initializes browser BroadcastChannel for instantaneous cross-tab synchronization
   */
  private initLocalBroadcast() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBroadcastChannel = new BroadcastChannel('weathergpt_family_alerts');
        this.localBroadcastChannel.onmessage = (event) => {
          if (event?.data && event.data.type === 'FAMILY_ALERT') {
            this.handleIncomingAlert(event.data.payload, false);
          }
        };
      } catch (err) {
        console.warn('[FamilyAlertService] BroadcastChannel init error:', err);
      }
    }
  }

  /**
   * Initializes Supabase Realtime channel for cross-device, cross-user broadcast
   */
  private initSupabaseRealtime() {
    if (!isSupabaseConfigured) return;

    try {
      this.realtimeChannel = supabase.channel('family-safety-alerts', {
        config: { broadcast: { self: false } }
      });

      this.realtimeChannel
        .on('broadcast', { event: 'safety-status-change' }, (payload: any) => {
          if (payload?.payload) {
            this.handleIncomingAlert(payload.payload, false);
          }
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('[FamilyAlertService] Subscribed to Supabase Realtime family alerts');
          }
        });
    } catch (err) {
      console.warn('[FamilyAlertService] Realtime subscription notice:', err);
    }
  }

  /**
   * Requests Web Notification permission on initial interaction
   */
  public async requestWebNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      try {
        return await Notification.requestPermission();
      } catch (e) {
        return 'denied';
      }
    }

    return Notification.permission;
  }

  /**
   * Plays a distinct synthesized siren/chime cue using the Web Audio API
   */
  public playAlertSound(isDanger: boolean) {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (isDanger) {
        // High-urgency alert siren pulse (alternating 880Hz and 660Hz)
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(660, now + 0.15);
        osc.frequency.setValueAtTime(880, now + 0.3);
        osc.frequency.setValueAtTime(660, now + 0.45);
        osc.frequency.setValueAtTime(880, now + 0.6);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.9);

        // Mobile device vibration cue
        if (navigator.vibrate) {
          navigator.vibrate([350, 150, 350, 150, 500]);
        }
      } else {
        // Low-urgency gentle confirmation chime (two rising harmonious sine tones)
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // G5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      console.warn('[FamilyAlertService] Audio playback notice:', e);
    }
  }

  /**
   * Fires a native OS-level Web Notification if document is backgrounded/hidden
   */
  private triggerNativePushNotification(event: FamilySafetyAlertEvent) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const isDanger = event.newStatus === 'AT RISK';
      const title = isDanger
        ? `🚨 ${event.senderName} is IN DANGER!`
        : `✅ ${event.senderName} is now SAFE`;

      const body = isDanger
        ? `${event.senderName} (${event.relationship || 'Family Member'}) reported IN DANGER near ${event.locationName || 'their location'}. Tap to open Family Circle.`
        : `${event.senderName} has confirmed their safety check-in.`;

      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `family-status-${event.senderId}`,
        requireInteraction: isDanger
      });

      notif.onclick = () => {
        window.focus();
        window.dispatchEvent(
          new CustomEvent('navigate-to-family-member', {
            detail: { memberId: event.senderId || event.familyConnectionId }
          })
        );
        notif.close();
      };
    } catch (err) {
      console.warn('[FamilyAlertService] Web Notification error:', err);
    }
  }

  /**
   * Internal handler when an alert arrives from either Realtime or BroadcastChannel
   */
  private handleIncomingAlert(event: FamilySafetyAlertEvent, isLocalTrigger = false) {
    const isDanger = event.newStatus === 'AT RISK';

    // Play sound cue
    this.playAlertSound(isDanger);

    // Trigger OS-level notification if tab is in background
    if (typeof document !== 'undefined' && document.hidden) {
      this.triggerNativePushNotification(event);
    }

    // Notify all in-app UI listeners
    this.subscribers.forEach((callback) => {
      try {
        callback(event);
      } catch (e) {
        console.error('[FamilyAlertService] Subscriber error:', e);
      }
    });

    // Also fire a window CustomEvent for any ad-hoc components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('family-safety-alert-received', { detail: event })
      );
    }
  }

  /**
   * Broadcasts a safety status change to all connected family members
   */
  public async broadcastSafetyAlert(event: FamilySafetyAlertEvent): Promise<void> {
    // 1. Trigger local subscribers
    this.handleIncomingAlert(event, true);

    // 2. Broadcast via local BroadcastChannel across tabs on the same machine
    if (this.localBroadcastChannel) {
      try {
        this.localBroadcastChannel.postMessage({
          type: 'FAMILY_ALERT',
          payload: event
        });
      } catch (e) {
        console.warn('[FamilyAlertService] BroadcastChannel postMessage error:', e);
      }
    }

    // 3. Broadcast via Supabase Realtime channel across different devices / sessions
    if (isSupabaseConfigured && this.realtimeChannel) {
      try {
        await this.realtimeChannel.send({
          type: 'broadcast',
          event: 'safety-status-change',
          payload: event
        });
      } catch (e) {
        console.warn('[FamilyAlertService] Supabase broadcast error:', e);
      }
    }
  }

  /**
   * Subscribe to incoming family alerts
   */
  public subscribe(callback: FamilyAlertSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
}

export const FamilyAlertService = new FamilyAlertServiceImpl();
