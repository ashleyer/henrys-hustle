/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API sound generator for Henry's Hustle
// Zero external mp3 dependencies, works instantly in browser

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmInterval: number | null = null;
  private stepCount: number = 0;

  constructor() {
    // Sound will initialize on first user interaction to comply with browser autoplay policy
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicGainNode = this.ctx.createGain();
      this.sfxGainNode = this.ctx.createGain();

      this.musicGainNode.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.sfxGainNode.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.musicGainNode.connect(this.ctx.destination);
      this.sfxGainNode.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.musicGainNode && this.sfxGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.musicGainNode.gain.setValueAtTime(muted ? 0 : 0.18, now);
      this.sfxGainNode.gain.setValueAtTime(muted ? 0 : 0.35, now);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play a quick synth tone
  private playTone(freq: number, type: OscillatorType, duration: number, gainVal: number = 0.3, pitchSlide?: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);

      if (pitchSlide) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, pitchSlide), now + duration);
      }

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio safety catch
    }
  }

  // --- SOUND EFFECTS ---

  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    this.playTone(260, 'sine', 0.22, 0.4, 520);
  }

  public playSlide() {
    if (this.isMuted) return;
    this.initContext();
    this.playTone(320, 'triangle', 0.2, 0.3, 110);
  }

  public playSpringboard() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playGymnasticsFlip() {
    if (this.isMuted) return;
    this.initContext();
    // Whooshing acrobatic sparkle
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.12, 0.25, freq * 1.25);
      }, i * 35);
    });
  }

  public playVault() {
    if (this.isMuted) return;
    this.initContext();
    // Vault tap + whoosh
    this.playTone(180, 'square', 0.08, 0.3, 220);
    setTimeout(() => {
      this.playTone(520, 'sine', 0.2, 0.35, 780);
    }, 50);
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    const freqs = [784, 1046]; // G5 to C6
    this.playTone(freqs[0], 'sine', 0.08, 0.25);
    setTimeout(() => {
      this.playTone(freqs[1], 'triangle', 0.14, 0.3);
    }, 45);
  }

  public playLetter() {
    if (this.isMuted) return;
    this.initContext();
    // Triumphant mini chord
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.3, 0.35), i * 50);
    });
  }

  public playPerfectTen() {
    if (this.isMuted) return;
    this.initContext();
    // Gong + Fanfare for Perfect 10
    this.playTone(440, 'triangle', 0.6, 0.4);
    setTimeout(() => this.playTone(660, 'sine', 0.5, 0.4), 80);
    setTimeout(() => this.playTone(880, 'sine', 0.5, 0.45), 160);
    setTimeout(() => this.playTone(1320, 'sine', 0.7, 0.5), 240);
  }

  public playCrash() {
    if (this.isMuted) return;
    this.initContext();
    // Friendly cartoon bonk
    this.playTone(280, 'sawtooth', 0.3, 0.4, 70);
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.initContext();
    const chords = [392, 493, 587, 784, 987];
    chords.forEach((note, idx) => {
      setTimeout(() => {
        this.playTone(note, 'sine', 0.25, 0.3);
      }, idx * 40);
    });
  }

  // --- PROCEDURAL BACKGROUND RUNNER MUSIC ---
  public startRunnerMusic() {
    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;

    // Upbeat energetic funky arcade bass & arpeggio in C Major / A Minor
    // 136 BPM = approx 110ms per 16th note
    const bassNotes = [130.81, 130.81, 164.81, 174.61, 196.00, 196.00, 220.00, 196.00];
    const leadNotes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 880.00, 987.77];

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.musicGainNode) return;

      const step = this.stepCount % 16;
      this.stepCount++;

      // Snappy bassline on eighth notes
      if (step % 2 === 0) {
        const noteIdx = Math.floor(step / 2) % bassNotes.length;
        const bFreq = bassNotes[noteIdx];
        this.playBgmNote(bFreq, 'sawtooth', 0.12, 0.14);
      }

      // Funky high lead accent every 4 steps
      if (step % 4 === 1 || step === 14) {
        const lFreq = leadNotes[(step * 3) % leadNotes.length];
        this.playBgmNote(lFreq, 'triangle', 0.16, 0.12);
      }

      // Snare-like noise burst on beat 4 & 12
      if (step === 4 || step === 12) {
        this.playDrumHit();
      }
    }, 110);
  }

  private playBgmNote(freq: number, type: OscillatorType, duration: number, gainVal: number) {
    if (!this.ctx || !this.musicGainNode) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.musicGainNode);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Ignore
    }
  }

  private playDrumHit() {
    if (!this.ctx || !this.musicGainNode) return;
    try {
      // Noise burst for snare
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGainNode);

      whiteNoise.start();
    } catch {
      // Ignore
    }
  }

  public stopRunnerMusic() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }
}

export const soundManager = new SoundManager();
