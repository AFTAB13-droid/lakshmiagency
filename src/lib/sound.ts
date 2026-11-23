/**
 * Web Audio API Sound Synthesizer for Lakshmi Agency
 * Loud, crisp, luxury bell chimes without external audio file dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a loud, pleasant, crystal-clear luxury bell chime
 */
export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Fast 3-tone arpeggio in E Major (B5: 987.77Hz, E6: 1318.51Hz, G#6: 1661.22Hz, B6: 1975.53Hz)
    const tones = [
      { freq: 987.77, delay: 0.0, dur: 0.7, vol: 0.35 },
      { freq: 1318.51, delay: 0.07, dur: 0.8, vol: 0.45 },
      { freq: 1661.22, delay: 0.14, dur: 0.9, vol: 0.4 },
      { freq: 1975.53, delay: 0.21, dur: 1.1, vol: 0.3 },
    ];

    tones.forEach(({ freq, delay, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      // Volume envelope: instant loud attack, sparkling acoustic decay
      const startTime = now + delay;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(vol, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    });
  } catch (err) {
    console.error("Failed to play notification chime:", err);
  }
}

/**
 * Play a subtle soft pop sound on delete/clear
 */
export function playActionPopSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // Ignore audio errors
  }
}
