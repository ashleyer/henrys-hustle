/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Production-grade procedural Web Audio API audio engine for Henry's Hustle
// Includes ascending coin chime scales, dynamic runner music, and gymnastics SFX

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.22;
  private sfxVolume: number = 0.45;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;

  private isBgmPlaying: boolean = false;
  private bgmInterval: number | null = null;
  private stepCount: number = 0;
  private isFeverMode: boolean = false;
  private isSkyMode: boolean = false;

  // Coin streak pitch progression (Subway Surfers signature feel)
  private coinStreakCount: number = 0;
  private lastCoinTime: number = 0;
  private readonly coinScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

  constructor() {
    // Context will resume on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicGainNode = this.ctx.createGain();
      this.sfxGainNode = this.ctx.createGain();

      this.musicGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime);
      this.sfxGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);

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
      this.musicGainNode.gain.setValueAtTime(muted ? 0 : this.musicVolume, now);
      this.sfxGainNode.gain.setValueAtTime(muted ? 0 : this.sfxVolume, now);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolumes(music: number, sfx: number) {
    this.musicVolume = Math.max(0, Math.min(1, music));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    if (!this.isMuted && this.musicGainNode && this.sfxGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.musicGainNode.gain.setValueAtTime(this.musicVolume, now);
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, now);
    }
  }

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

      gain.gain.setValueAtTime(gainVal * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio safety
    }
  }

  // --- SOUND EFFECTS ---

  public playLaneSwitch() {
    if (this.isMuted) return;
    this.initContext();
    // Crisp swoosh
    this.playTone(340, 'sine', 0.09, 0.25, 180);
  }

  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    this.playTone(280, 'sine', 0.22, 0.45, 620);
  }

  public playSpringJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playSlide() {
    if (this.isMuted) return;
    this.initContext();
    this.playTone(360, 'triangle', 0.18, 0.35, 110);
  }

  public playFastDive() {
    if (this.isMuted) return;
    this.initContext();
    this.playTone(520, 'sawtooth', 0.14, 0.35, 80);
  }

  // Subway Surfers signature ascending star/coin pitch
  public playStarCollect() {
    if (this.isMuted) return;
    this.initContext();

    const nowTime = Date.now();
    if (nowTime - this.lastCoinTime < 500) {
      this.coinStreakCount = (this.coinStreakCount + 1) % this.coinScale.length;
    } else {
      this.coinStreakCount = 0;
    }
    this.lastCoinTime = nowTime;

    const freq = this.coinScale[this.coinStreakCount];
    this.playTone(freq, 'sine', 0.1, 0.35);
    setTimeout(() => {
      this.playTone(freq * 1.5, 'triangle', 0.12, 0.2);
    }, 35);
  }

  public playGymnasticsFlip() {
    if (this.isMuted) return;
    this.initContext();
    const notes = [440, 587.33, 740, 987.77];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.12, 0.3, freq * 1.2);
      }, i * 35);
    });
  }

  public playVault() {
    if (this.isMuted) return;
    this.initContext();
    // Solid vault block impact + airy vault leap
    this.playTone(200, 'square', 0.08, 0.35, 260);
    setTimeout(() => {
      this.playTone(587.33, 'sine', 0.22, 0.4, 880);
    }, 45);
  }

  public playStickLanding() {
    if (this.isMuted) return;
    this.initContext();
    // Crisp judge bell + crowd cheer
    this.playTone(880, 'sine', 0.4, 0.4);
    setTimeout(() => this.playTone(1320, 'triangle', 0.5, 0.35), 60);
  }

  public playPerfectTen() {
    if (this.isMuted) return;
    this.initContext();
    // Grand Olympic fanfare
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((note, idx) => {
      setTimeout(() => {
        this.playTone(note, 'sine', 0.35, 0.45);
      }, idx * 60);
    });
  }

  public playLetter() {
    if (this.isMuted) return;
    this.initContext();
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.28, 0.4), i * 45);
    });
  }

  public playBoardDeploy() {
    if (this.isMuted) return;
    this.initContext();
    // High-tech magnetic board activation
    this.playTone(220, 'sawtooth', 0.25, 0.35, 880);
    setTimeout(() => this.playTone(880, 'sine', 0.3, 0.4, 440), 100);
  }

  public playBoardCrashSave() {
    if (this.isMuted) return;
    this.initContext();
    // Shield break glass shatter
    this.playTone(400, 'square', 0.25, 0.4, 100);
    this.playDrumHit(true);
  }

  public playCrash() {
    if (this.isMuted) return;
    this.initContext();
    this.playTone(280, 'sawtooth', 0.35, 0.5, 60);
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.initContext();
    const chords = [392, 493, 587, 784, 987, 1174];
    chords.forEach((note, idx) => {
      setTimeout(() => {
        this.playTone(note, 'sine', 0.25, 0.35);
      }, idx * 40);
    });
  }

  // --- PROCEDURAL BACKGROUND RUNNER MUSIC ---

  public setFeverMode(enabled: boolean) {
    this.isFeverMode = enabled;
  }

  public setSkyMode(enabled: boolean) {
    this.isSkyMode = enabled;
  }

  public startRunnerMusic() {
    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;

    // Upbeat funky runner progression in C Major / A Minor at ~138 BPM (108ms per 16th note)
    const standardBass = [130.81, 130.81, 164.81, 174.61, 196.00, 196.00, 220.00, 196.00];
    const feverBass = [174.61, 174.61, 220.00, 261.63, 261.63, 293.66, 329.63, 392.00];
    const standardLead = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 880.00, 987.77];
    const feverLead = [659.25, 783.99, 1046.50, 1318.51, 1567.98, 1318.51, 1046.50, 880.00];

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.musicGainNode) return;

      const step = this.stepCount % 16;
      this.stepCount++;

      const bassNotes = this.isFeverMode ? feverBass : standardBass;
      const leadNotes = this.isFeverMode ? feverLead : standardLead;

      // 1. Driving Bassline on eighth notes
      if (step % 2 === 0) {
        const noteIdx = Math.floor(step / 2) % bassNotes.length;
        const bFreq = bassNotes[noteIdx];
        this.playBgmNote(bFreq, this.isFeverMode ? 'sawtooth' : 'triangle', 0.12, 0.22);
      }

      // 2. High Lead Arpeggio
      if (step % 4 === 1 || step === 14 || this.isFeverMode) {
        const lFreq = leadNotes[(step * 3) % leadNotes.length];
        this.playBgmNote(lFreq, 'sine', 0.14, this.isFeverMode ? 0.24 : 0.16);
      }

      // 3. Crisp Snare Drum & Hi-Hats
      if (step === 4 || step === 12) {
        this.playDrumHit();
      } else if (step % 2 === 1) {
        this.playHiHat();
      }
    }, 108);
  }

  private playBgmNote(freq: number, type: OscillatorType, duration: number, gainVal: number) {
    if (!this.ctx || !this.musicGainNode) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);

      const targetGain = gainVal * this.musicVolume;
      gain.gain.setValueAtTime(targetGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.musicGainNode);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Ignore
    }
  }

  private playDrumHit(isCrash: boolean = false) {
    if (!this.ctx || !this.musicGainNode) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * (isCrash ? 0.2 : 0.06));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = isCrash ? 'bandpass' : 'highpass';
      filter.frequency.setValueAtTime(isCrash ? 2500 : 1200, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12 * this.musicVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (isCrash ? 0.2 : 0.06));

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGainNode);

      whiteNoise.start();
    } catch {
      // Ignore
    }
  }

  private playHiHat() {
    if (!this.ctx || !this.musicGainNode) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.02);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06 * this.musicVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

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
