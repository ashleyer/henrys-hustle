/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NarrationSnippet } from '../types/game';
import { soundManager } from '../audio/soundManager';

export const LANDMARK_NARRATIONS: Record<string, NarrationSnippet> = {
  'Park Street Station': {
    id: 'narrate_park_street',
    title: 'Park Street Station (1897)',
    landmark: 'Boston Common & State House',
    category: 'MBTA_HISTORY',
    text: "America's very first subway station opened right here under Boston Common in 1897! You are riding historic rails!",
    icon: '🚇',
    badgeEmoji: '🌳',
    durationMs: 6500,
  },
  'Boylston Street Station': {
    id: 'narrate_boylston',
    title: 'Boylston Street Station',
    landmark: 'Historic Underground Curves',
    category: 'MBTA_HISTORY',
    text: "Green Line streetcars have been turning these sharp underground curves for over one hundred and twenty years!",
    icon: '🚋',
    badgeEmoji: '✨',
    durationMs: 6000,
  },
  'Copley Square (02116)': {
    id: 'narrate_copley',
    title: 'Copley Square Marathon Finish',
    landmark: 'Boston Marathon Line',
    category: 'GYMNASTICS_HISTORY',
    text: "The famous Boston Marathon finish line! Fun fact: Modern Olympic gymnastics began in 1896, celebrating peak human agility!",
    icon: '🏃‍♂️',
    badgeEmoji: '🏅',
    durationMs: 7000,
  },
  'Fenway & Kenmore': {
    id: 'narrate_fenway',
    title: 'Fenway Park & Kenmore',
    landmark: 'The Green Monster Wall',
    category: 'BOSTON_HERITAGE',
    text: "Fenway Park ahead! Home of the Green Monster wall! Gymnasts build monster strength on the parallel bars and rings!",
    icon: '⚾',
    badgeEmoji: '🏟️',
    durationMs: 6500,
  },
  'Charles / MGH Bridge': {
    id: 'narrate_charles',
    title: 'Charles River Longfellow Bridge',
    landmark: 'Salt-and-Pepper Towers',
    category: 'GYMNASTICS_HISTORY',
    text: "Zooming across the Charles River! Vaulting over hurdles requires fast sprint speed, just like a high-speed express train!",
    icon: '⛵',
    badgeEmoji: '🌉',
    durationMs: 6500,
  },
  'Harvard Square': {
    id: 'narrate_harvard',
    title: 'Harvard Square & Yard',
    landmark: 'Historic Harvard Gates',
    category: 'GYMNASTICS_HISTORY',
    text: "Passing historic Harvard Square! Gymnastics comes from the Greek gymnazo, meaning to train with total agility and courage!",
    icon: '🎓',
    badgeEmoji: '🏛️',
    durationMs: 7000,
  },
  'Boston Harbor & Tea Party': {
    id: 'narrate_harbor',
    title: 'Boston Harbor (1773)',
    landmark: 'Tea Party Ocean Harbor',
    category: 'BOSTON_HERITAGE',
    text: "Boston Harbor ahead! In 1773, brave patriots made giant ocean tea! In gymnastics, sticking your landing takes rock-solid focus!",
    icon: '🌊',
    badgeEmoji: '☕',
    durationMs: 7000,
  },
};

export const GYMNASTICS_NARRATIONS: NarrationSnippet[] = [
  {
    id: 'gym_vault_horse',
    title: 'History of the Vault Table',
    landmark: 'Gymnastics History',
    category: 'GYMNASTICS_HISTORY',
    text: 'Vaulting was invented centuries ago so athletes could practice leaping cleanly onto galloping horses!',
    icon: '🤸‍♂️',
    badgeEmoji: '🐎',
    durationMs: 6000,
  },
  {
    id: 'gym_chalk_grip',
    title: 'Magic Chalk Chemistry',
    landmark: 'Gymnastics Science',
    category: 'GYMNASTICS_HISTORY',
    text: 'Gymnastics chalk is pure magnesium carbonate! It dries hand sweat so you grip vault blocks and bars like a gecko!',
    icon: '💨',
    badgeEmoji: '🦎',
    durationMs: 6500,
  },
  {
    id: 'gym_angular_momentum',
    title: 'Physics of the Cannonball Tuck',
    landmark: 'Physics Academy',
    category: 'GYMNASTICS_HISTORY',
    text: 'Tucking your knees tight to your chest makes your body spin three times faster! That is the physics of angular momentum!',
    icon: '🔄',
    badgeEmoji: '⚡',
    durationMs: 6500,
  },
  {
    id: 'gym_stick_landing',
    title: 'The Art of the Sticking Landing',
    landmark: 'Olympic Judges',
    category: 'GYMNASTICS_HISTORY',
    text: 'Sticking the landing means freezing like a statue! Bending your knees like shock absorbers absorbs all the impact force!',
    icon: '🎯',
    badgeEmoji: '🔟',
    durationMs: 6500,
  },
  {
    id: 'gym_perfect_ten',
    title: 'The First Perfect 10 in 1896-1976',
    landmark: 'Gymnastics Lore',
    category: 'GYMNASTICS_HISTORY',
    text: 'In 1976, Nadia Comaneci scored the first Olympic Perfect 10! The scoreboard could only show 1.00 because nobody thought a 10 was possible!',
    icon: '🌟',
    badgeEmoji: '⭐',
    durationMs: 7500,
  },
];

type NarrationListener = (snippet: NarrationSnippet | null) => void;

class VoiceNarrator {
  private listeners: Set<NarrationListener> = new Set();
  private currentSnippet: NarrationSnippet | null = null;
  private isMuted: boolean = false;
  private isVoiceEnabled: boolean = true;
  private lastNarrationTime: number = 0;
  private minIntervalMs: number = 20000; // Spacious 20-second minimum between narrations
  private hideTimer: number | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('hub_hustle_voice_enabled');
        if (saved !== null) {
          this.isVoiceEnabled = saved === 'true';
        }
      } catch {
        // Fallback
      }

      if ('speechSynthesis' in window) {
        const pickVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          // Prefer high-quality, friendly English voices
          const preferred = voices.find(v =>
            (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Aaron') || v.name.includes('Google US English') || v.name.includes('Daniel')) &&
            v.lang.startsWith('en')
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
          this.selectedVoice = preferred;
        };
        pickVoice();
        window.speechSynthesis.onvoiceschanged = pickVoice;
      }
    }
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
    try {
      localStorage.setItem('hub_hustle_voice_enabled', enabled ? 'true' : 'false');
    } catch {
      // Fallback
    }
    if (!enabled) {
      this.cancelSpeech();
    }
  }

  public getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
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

    // Station announcement chime
    soundManager.playStationChime();

    // Set subtitle
    this.currentSnippet = snippet;
    this.notify();

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    const duration = snippet.durationMs || 6500;
    this.hideTimer = window.setTimeout(() => {
      this.currentSnippet = null;
      this.notify();
    }, duration);

    // Speak audio if enabled and not muted
    if (this.isVoiceEnabled && !this.isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(snippet.text);
        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }
        utterance.pitch = 1.12; // Bright, enthusiastic, kid-friendly
        utterance.rate = 1.05;  // Clear, crisp cadence
        utterance.volume = 0.95;

        utterance.onend = () => {
          // Keep subtitle visible for extra half-second for readability
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        // SpeechSynthesis error ignored; subtitle remains active
      }
    }

    return true;
  }

  public cancelSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Fallback
      }
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.currentSnippet = null;
    this.notify();
  }
}

export const voiceNarrator = new VoiceNarrator();
