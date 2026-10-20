/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CharacterOutfit, ChalkBoardItem, GameStats } from '../types/game';
import { OUTFITS, CHALK_BOARDS } from '../game/gameEngine';
import { Star, Check, Lock, ShoppingBag, X, Zap } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface ShopModalProps {
  stats: GameStats;
  selectedOutfit: CharacterOutfit;
  selectedBoard: ChalkBoardItem;
  onSelectOutfit: (outfit: CharacterOutfit) => void;
  onSelectBoard: (board: ChalkBoardItem) => void;
  onBuyBoardPacks: () => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  stats,
  selectedOutfit,
  selectedBoard,
  onSelectOutfit,
  onSelectBoard,
  onBuyBoardPacks,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'OUTFITS' | 'BOARDS' | 'POWERUPS'>('OUTFITS');

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="max-w-lg w-full bg-slate-900 border-2 border-yellow-500/50 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col relative max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-yellow-400" />
            <h2 className="font-arcade text-lg md:text-xl text-white">HENRY'S GYM SHOP</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 px-3 py-1 rounded-full border border-yellow-500/40 flex items-center gap-1.5 font-arcade text-yellow-400 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{stats.starsInBank}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 my-3">
          {(['OUTFITS', 'BOARDS', 'POWERUPS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tab
                  ? 'bg-yellow-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-800/70 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab === 'OUTFITS' ? 'LEOTARDS' : tab === 'BOARDS' ? 'CHALK BOARDS' : 'SUPPLIES'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {activeTab === 'OUTFITS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OUTFITS.map(outfit => {
                const isSelected = outfit.id === selectedOutfit.id;
                const isUnlocked = outfit.unlocked || stats.starsInBank >= outfit.cost;

                return (
                  <div
                    key={outfit.id}
                    className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-500/10'
                        : isUnlocked
                        ? 'border-slate-700 bg-slate-800/40'
                        : 'border-slate-800 bg-slate-900/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-arcade text-lg text-white font-black shadow-md"
                        style={{ backgroundColor: outfit.suitColor }}
                      >
                        #7
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-black text-white">{outfit.name}</div>
                        <div className="text-[11px] text-amber-400 font-semibold">{outfit.title}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mb-1.5">{outfit.description}</p>
                    {outfit.historyNote && (
                      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-1.5 text-[10px] text-emerald-300 font-medium mb-2.5">
                        📜 {outfit.historyNote}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (isUnlocked) {
                          onSelectOutfit(outfit);
                          soundManager.playVault();
                        }
                      }}
                      disabled={!isUnlocked}
                      className={`w-full py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-yellow-400 text-slate-950'
                          : isUnlocked
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> EQUIPPED
                        </>
                      ) : isUnlocked ? (
                        'EQUIP'
                      ) : (
                        <>
                          <Lock className="w-3 h-3" /> {outfit.cost} STARS NEEDED
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'BOARDS' && (
            <div className="space-y-3">
              {CHALK_BOARDS.map(board => {
                const isSelected = board.id === selectedBoard.id;
                const isUnlocked = board.unlocked || stats.starsInBank >= board.cost;

                return (
                  <div
                    key={board.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : isUnlocked
                        ? 'border-slate-700 bg-slate-800/40'
                        : 'border-slate-800 bg-slate-900/50 opacity-70'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: board.boardColor }}
                    >
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-black text-white">{board.name}</div>
                      <div className="text-xs text-slate-300">{board.description}</div>
                    </div>
                    <button
                      onClick={() => {
                        if (isUnlocked) {
                          onSelectBoard(board);
                          soundManager.playBoardDeploy();
                        }
                      }}
                      disabled={!isUnlocked}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950'
                          : isUnlocked
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isSelected ? 'ACTIVE' : isUnlocked ? 'EQUIP' : `${board.cost} ★`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'POWERUPS' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-slate-700 bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>🛹 3x Chalk-Boards Pack</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Crash protection & trick boost during runs. Currently have: {stats.boardsAvailable}
                  </div>
                </div>
                <button
                  onClick={onBuyBoardPacks}
                  disabled={stats.starsInBank < 30}
                  className={`px-4 py-2.5 rounded-xl font-arcade text-xs font-black transition ${
                    stats.starsInBank >= 30
                      ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 active:scale-95 shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  BUY (30 ★)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full mt-3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition"
        >
          BACK TO GAME
        </button>
      </div>
    </div>
  );
};
