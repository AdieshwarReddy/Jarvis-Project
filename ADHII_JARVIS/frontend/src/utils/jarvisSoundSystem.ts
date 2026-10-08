// =========================================================
// Adhii Jarvis — High-Tech Sci-Fi Audio & Ambient Engine
// Powered by HTML5 Web Audio API (Zero External Asset Dependency)
// =========================================================

class JarvisSoundSystem {
  private ctx: AudioContext | null = null;
  private isAmbienceActive: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfoNode: OscillatorNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Start or toggle the Iron Man Arc Reactor Ambient Sound Hum.
   * Produces a deep, warm 55Hz/110Hz sub-core drone with a gentle 0.15Hz breathing LFO.
   */
  public startAmbience(): boolean {
    try {
      this.initContext();
      if (!this.ctx) return false;

      if (this.isAmbienceActive) return true;

      const now = this.ctx.currentTime;

      // Master Ambient Gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      // Smooth fade in to a subtle, comfortable ambient level
      this.ambientGain.gain.exponentialRampToValueAtTime(0.12, now + 1.2);
      this.ambientGain.connect(this.ctx.destination);

      // Low Pass Warmth Filter
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(320, now);
      lowpass.Q.setValueAtTime(1.8, now);
      lowpass.connect(this.ambientGain);

      // Sub-Bass Core Oscillator (55Hz - Arc Reactor Grounding)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, now);
      const osc1Gain = this.ctx.createGain();
      osc1Gain.gain.setValueAtTime(0.6, now);
      osc1.connect(osc1Gain);
      osc1Gain.connect(lowpass);
      osc1.start(now);
      this.oscillators.push(osc1);

      // 2nd Harmonic with detune (110Hz - Electrical hum shimmer)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, now);
      osc2.detune.setValueAtTime(4, now); // +4 cents chorusing
      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.25, now);
      osc2.connect(osc2Gain);
      osc2Gain.connect(lowpass);
      osc2.start(now);
      this.oscillators.push(osc2);

      // 3rd High-Tech Resonance Tone (220Hz with bandpass filter)
      const osc3 = this.ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(220, now);
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(220, now);
      bandpass.Q.setValueAtTime(3.0, now);
      const osc3Gain = this.ctx.createGain();
      osc3Gain.gain.setValueAtTime(0.15, now);
      osc3.connect(bandpass);
      bandpass.connect(osc3Gain);
      osc3Gain.connect(this.ambientGain);
      osc3.start(now);
      this.oscillators.push(osc3);

      // Breathing LFO (0.12 Hz - subtle Stark pulsing energy)
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.04, now);
      lfo.connect(lfoGain);
      lfoGain.connect(this.ambientGain.gain);
      lfo.start(now);
      this.lfoNode = lfo;

      this.isAmbienceActive = true;
      return true;
    } catch (e) {
      console.warn('Could not start Jarvis ambient audio:', e);
      return false;
    }
  }

  /**
   * Stop the background ambient audio with a smooth fade-out.
   */
  public stopAmbience() {
    if (!this.ctx || !this.isAmbienceActive) return;

    try {
      const now = this.ctx.currentTime;
      if (this.ambientGain) {
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      }

      setTimeout(() => {
        this.oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (_) {}
        });
        this.oscillators = [];
        if (this.lfoNode) {
          try {
            this.lfoNode.stop();
            this.lfoNode.disconnect();
          } catch (_) {}
          this.lfoNode = null;
        }
        if (this.ambientGain) {
          try {
            this.ambientGain.disconnect();
          } catch (_) {}
          this.ambientGain = null;
        }
        this.isAmbienceActive = false;
      }, 700);
    } catch (e) {
      this.isAmbienceActive = false;
    }
  }

  /**
   * Toggle background sound state.
   */
  public toggleAmbience(): boolean {
    if (this.isAmbienceActive) {
      this.stopAmbience();
      return false;
    } else {
      return this.startAmbience();
    }
  }

  public isAmbienceOn(): boolean {
    return this.isAmbienceActive;
  }

  /**
   * Ducks background ambient volume when Jarvis is speaking, then restores it.
   */
  public setDucking(duck: boolean) {
    if (!this.ctx || !this.ambientGain || !this.isAmbienceActive) return;
    try {
      const now = this.ctx.currentTime;
      const target = duck ? 0.03 : 0.12;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.linearRampToValueAtTime(target, now + 0.4);
    } catch (_) {}
  }

  /**
   * SFX: Iron Man Mark Repulsor / Arc Reactor Wake-up Chime
   */
  public playWakeup() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Rising pitch frequency sweep (160Hz -> 640Hz -> 880Hz)
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (_) {}
  }

  /**
   * SFX: High-tech holographic chirp / tap acknowledge
   */
  public playChirp() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch (_) {}
  }

  /**
   * SFX: Directive / Command Completed Affirmative Chime
   */
  public playSuccess() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Dual harmonious chimes: E5 (659Hz) and B5 (987Hz)
      [659.25, 987.77].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.09;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.5);
      });
    } catch (_) {}
  }
}

export const jarvisSound = new JarvisSoundSystem();
