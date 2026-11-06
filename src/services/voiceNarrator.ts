/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NarrationSnippet } from '../types/game';
import { soundManager } from '../audio/soundManager';

export const LANDMARK_NARRATIONS: Record<string, NarrationSnippet> = {
  'Park Street Station': {
    id: 'narrate_park_street',
    title: 'Park Street (1897)',
    landmark: '1st Subway Tunnel',
    category: 'MBTA_HISTORY',
    text: "Choo-choo! Park Street was America's very first underground train tunnel!",
    icon: '🚇',
    badgeEmoji: '🌳',
    durationMs: 4200,
  },
  'Boylston Street Station': {
    id: 'narrate_boylston',
    title: 'Boylston Street',
    landmark: 'Green Line Trolleys',
    category: 'MBTA_HISTORY',
    text: 'Green trolleys have zoomed around these underground corners for over 100 years!',
    icon: '🚋',
    badgeEmoji: '✨',
    durationMs: 4000,
  },
  'Copley Square (02116)': {
    id: 'narrate_copley',
    title: 'Copley Square',
    landmark: 'Marathon Finish Line',
    category: 'GYMNASTICS_HISTORY',
    text: 'This is the famous Boston Marathon finish line! Sprint across like a champion!',
    icon: '🏃‍♂️',
    badgeEmoji: '🏅',
    durationMs: 4200,
  },
  'Fenway & Kenmore': {
    id: 'narrate_fenway',
    title: 'Fenway Park',
    landmark: 'Big Green Monster Wall',
    category: 'BOSTON_HERITAGE',
    text: 'Look! That giant green baseball wall is the famous Green Monster at Fenway Park!',
    icon: '⚾',
    badgeEmoji: '🏟️',
    durationMs: 4200,
  },
  'Charles / MGH Bridge': {
    id: 'narrate_charles',
    title: 'Charles River Bridge',
    landmark: 'Sailboat River',
    category: 'GYMNASTICS_HISTORY',
    text: 'Zooming over the Charles River! Look at the castle towers on the bridge!',
    icon: '⛵',
    badgeEmoji: '🌉',
    durationMs: 4000,
  },
  'Harvard Square': {
    id: 'narrate_harvard',
    title: 'Harvard Square',
    landmark: 'Oldest School',
    category: 'GYMNASTICS_HISTORY',
    text: 'Welcome to Harvard! Gymnastics means training your body to be strong and brave!',
    icon: '🎓',
    badgeEmoji: '🏛️',
    durationMs: 4200,
  },
  'Boston Harbor & Tea Party': {
    id: 'narrate_harbor',
    title: 'Boston Harbor',
    landmark: 'Ocean Ships',
    category: 'BOSTON_HERITAGE',
    text: 'Splash! In 1773, patriots dumped boxes of tea right into this ocean harbor!',
    icon: '🌊',
    badgeEmoji: '☕',
    durationMs: 4200,
  },
};

export const GYMNASTICS_NARRATIONS: NarrationSnippet[] = [
  {
    id: 'gym_vault_horse',
    title: 'Super Vaults',
    landmark: 'Gymnastics Fun Fact',
    category: 'GYMNASTICS_HISTORY',
    text: 'Long ago, gymnasts practiced jumping onto wooden horses!',
    icon: '🤸‍♂️',
    badgeEmoji: '🐎',
    durationMs: 3800,
  },
  {
    id: 'gym_chalk_grip',
    title: 'Magic White Chalk',
    landmark: 'Gymnastics Fun Fact',
    category: 'GYMNASTICS_HISTORY',
    text: 'Gymnasts put special white chalk on their hands so they never slip!',
    icon: '💨',
    badgeEmoji: '🦎',
    durationMs: 3800,
  },
  {
    id: 'gym_angular_momentum',
    title: 'Turbo Cannonball Spin',
    landmark: 'Gymnastics Fun Fact',
    category: 'GYMNASTICS_HISTORY',
    text: 'Hugging your knees tight makes you spin three times quicker in the air!',
    icon: '🔄',
    badgeEmoji: '⚡',
    durationMs: 3800,
  },
  {
    id: 'gym_stick_landing',
    title: 'Stick the Landing!',
    landmark: 'Gymnastics Fun Fact',
    category: 'GYMNASTICS_HISTORY',
    text: 'Freeze like a superhero statue when you land to score a Perfect 10!',
    icon: '🎯',
    badgeEmoji: '🔟',
    durationMs: 3800,
  },
];

type NarrationListener = (snippet: NarrationSnippet | null) => void;

class VoiceNarrator {
  private listeners: Set<NarrationListener> = new Set();
  private currentSnippet: NarrationSnippet | null = null;
  private isMuted: boolean = false;
  private isVoiceEnabled: boolean = true;
  private lastNarrationTime: number = 0;
  private minIntervalMs: number = 24000; // Spacious 24-second minimum between narrations
  private hideTimer: number | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.isVoiceEnabled = false;
  }

  public subscribe(listener: NarrationListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSnippet);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.currentSnippet));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.cancelSpeech();
    }
  }

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
    if (!enabled) {
      this.cancelSpeech();
    }
  }

  public getVoiceEnabled(): boolean {
    return false;
  }

  public speakLandmark(stationName: string, force: boolean = false): boolean {
    const snippet = LANDMARK_NARRATIONS[stationName];
    if (!snippet) return false;
    return this.narrate(snippet, force);
  }

  public speakGymnasticsFact(force: boolean = false): boolean {
    const idx = Math.floor(Math.random() * GYMNASTICS_NARRATIONS.length);
    const snippet = GYMNASTICS_NARRATIONS[idx];
    return this.narrate(snippet, force);
  }

  public narrate(snippet: NarrationSnippet, force: boolean = false): boolean {
    const now = Date.now();
    if (!force && now - this.lastNarrationTime < this.minIntervalMs) {
      return false;
    }
    this.lastNarrationTime = now;

    // Station announcement chime (pleasant musical chime, no robotic TTS voice)
    soundManager.playStationChime();

    // Set subtitle
    this.currentSnippet = snippet;
    this.notify();

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    const duration = snippet.durationMs || 4200;
    this.hideTimer = window.setTimeout(() => {
      this.currentSnippet = null;
      this.notify();
    }, duration);

    return true;
  }

  public cancelSpeech() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.currentSnippet = null;
    this.notify();
  }
}

export const voiceNarrator = new VoiceNarrator();
