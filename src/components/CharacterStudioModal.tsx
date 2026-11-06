/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CustomCharacterProfile, CharacterOutfit, HairStyle } from '../types/game';
import { OUTFITS } from '../game/gameEngine';
import { Sparkles, Check, X, Palette, User } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface CharacterStudioModalProps {
  currentProfile: CustomCharacterProfile;
  selectedOutfit: CharacterOutfit;
  onSaveProfile: (profile: CustomCharacterProfile) => void;
  onClose: () => void;
}

export const CharacterStudioModal: React.FC<CharacterStudioModalProps> = ({
  currentProfile,
  selectedOutfit,
  onSaveProfile,
  onClose,
}) => {
  const [profile, setProfile] = useState<CustomCharacterProfile>({ ...currentProfile });

  const hairStyles: { id: HairStyle; label: string; icon: string }[] = [
    { id: 'SPIKY', label: 'Spiky Champion', icon: '⚡' },
    { id: 'CURLY', label: 'Bouncy Curls', icon: '🌀' },
    { id: 'SWEEP', label: 'Wind Swept', icon: '💨' },
    { id: 'PONYTAIL', label: 'Gymnast Bun', icon: '🎀' },
    { id: 'BUZZ', label: 'Athletic Crop', icon: '✂️' },
  ];

  const hairColors = [
    { name: 'Chestnut', hex: '#7c4722' },
    { name: 'Golden', hex: '#eab308' },
    { name: 'Jet Black', hex: '#18181b' },
    { name: 'Auburn', hex: '#b45309' },
    { name: 'Cyber Teal', hex: '#06b6d4' },
    { name: 'Neon Violet', hex: '#a855f7' },
  ];

  const skinTones = [
    { name: 'Fair', hex: '#ffdfc4' },
    { name: 'Warm Peach', hex: '#fcd34d' },
    { name: 'Golden Tan', hex: '#d97706' },
    { name: 'Deep Bronze', hex: '#854d0e' },
    { name: 'Rich Espresso', hex: '#451a03' },
  ];

  const eyeColors = [
    { name: 'Ocean Blue', hex: '#0284c7' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Amber Hazel', hex: '#b45309' },
    { name: 'Dark Slate', hex: '#1e293b' },
    { name: 'Electric Violet', hex: '#9333ea' },
  ];

  const headbandColors = ['#15803d', '#dc2626', '#f59e0b', '#1e40af', '#ffffff', '#18181b', '#06b6d4'];

  const handleSave = () => {
    soundManager.playVault();
    onSaveProfile(profile);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none font-sans">
      <div className="max-w-md w-full bg-slate-900 border-2 border-yellow-500/60 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col relative max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-yellow-400" />
            <h2 className="font-arcade text-lg md:text-xl text-white">CHARACTER STUDIO</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          Personalize Henry's look, hair style, skin tone, and gymnastics gear!
        </p>

        {/* Form Controls */}
        <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1">
          {/* Hero Name */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
              GYMNAST NAME
            </label>
            <input
              type="text"
              value={profile.name}
              maxLength={18}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-yellow-300 font-bold focus:outline-none focus:border-yellow-400"
              placeholder="Enter hero name..."
            />
          </div>

          {/* Hair Style */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
              HAIR STYLE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {hairStyles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setProfile({ ...profile, hairStyle: style.id })}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    profile.hairStyle === style.id
                      ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">{style.icon}</span>
                  <span className="text-[10px] text-center">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
              HAIR COLOR
            </label>
            <div className="flex gap-2.5">
              {hairColors.map(c => (
                <button
                  key={c.hex}
                  onClick={() => setProfile({ ...profile, hairColor: c.hex })}
                  className={`w-9 h-9 rounded-full border-2 transition transform active:scale-90 flex items-center justify-center ${
                    profile.hairColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {profile.hairColor === c.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
              SKIN TONE
            </label>
            <div className="flex gap-2.5">
              {skinTones.map(s => (
                <button
                  key={s.hex}
                  onClick={() => setProfile({ ...profile, skinTone: s.hex })}
                  className={`w-9 h-9 rounded-full border-2 transition transform active:scale-90 flex items-center justify-center ${
                    profile.skinTone === s.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: s.hex }}
                  title={s.name}
                >
                  {profile.skinTone === s.hex && <Check className="w-4 h-4 text-slate-950 drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Eye Color */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
              EYE COLOR
            </label>
            <div className="flex gap-2.5">
              {eyeColors.map(e => (
                <button
                  key={e.hex}
                  onClick={() => setProfile({ ...profile, eyeColor: e.hex })}
                  className={`w-8 h-8 rounded-full border-2 transition transform active:scale-90 flex items-center justify-center ${
                    profile.eyeColor === e.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: e.hex }}
                  title={e.name}
                >
                  {profile.eyeColor === e.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Headband / Sweatband Color */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
              HEADBAND COLOR
            </label>
            <div className="flex gap-2.5">
              {headbandColors.map(hex => (
                <button
                  key={hex}
                  onClick={() => setProfile({ ...profile, headbandColor: hex })}
                  className={`w-8 h-8 rounded-full border-2 transition transform active:scale-90 flex items-center justify-center ${
                    profile.headbandColor === hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {profile.headbandColor === hex && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-arcade text-base shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <span>SAVE CUSTOM CHARACTER</span>
        </button>
      </div>
    </div>
  );
};
