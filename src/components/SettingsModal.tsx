/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings, Volume2, VolumeX, X } from 'lucide-react';

interface SettingsModalProps {
  isMuted: boolean;
  musicVolume: number;
  sfxVolume: number;
  onToggleMute: () => void;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isMuted,
  musicVolume,
  sfxVolume,
  onToggleMute,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onClose,
}) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md select-none font-sans">
    <div className="max-w-md w-full bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/80 cursor-pointer"
        aria-label="Close settings"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center justify-center gap-2 mb-5">
        <Settings className="w-5 h-5 text-emerald-400" />
        <h2 className="font-arcade text-xl text-emerald-300">SETTINGS</h2>
      </div>

      <div className="space-y-4">
        <button
          onClick={onToggleMute}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-sm font-bold text-slate-200"
          aria-pressed={isMuted}
        >
          <span className="flex items-center gap-2">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            Sound
          </span>
          <span className={isMuted ? 'text-rose-300' : 'text-emerald-300'}>{isMuted ? 'Muted' : 'On'}</span>
        </button>

        <label className="block p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="flex justify-between text-sm font-bold text-slate-200 mb-2">
            <span>Music volume</span>
            <span className="text-emerald-300">{Math.round(musicVolume * 100)}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={(event) => onMusicVolumeChange(Number(event.target.value))}
            className="w-full accent-emerald-400"
            aria-label="Music volume"
          />
        </label>

        <label className="block p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="flex justify-between text-sm font-bold text-slate-200 mb-2">
            <span>Sound effects</span>
            <span className="text-emerald-300">{Math.round(sfxVolume * 100)}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={sfxVolume}
            onChange={(event) => onSfxVolumeChange(Number(event.target.value))}
            className="w-full accent-emerald-400"
            aria-label="Sound effects volume"
          />
        </label>
      </div>

      <button
        onClick={onClose}
        className="w-full mt-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade text-sm transition active:scale-95"
      >
        DONE
      </button>
    </div>
  </div>
);
