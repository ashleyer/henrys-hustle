/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types/game';
import { Trophy, Medal, Star, X, MapPin, RefreshCw } from 'lucide-react';

interface LeaderboardModalProps {
  onClose: () => void;
  currentScore?: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) {
        setEntries(data.leaderboard);
      }
    } catch {
      // Fallback local list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none font-sans">
      <div className="max-w-lg w-full bg-slate-900 border-2 border-yellow-500/60 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col relative max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="font-arcade text-lg md:text-xl text-white">BOSTON HUB LEADERBOARD</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          All gymnasts sprinting across the Boston MBTA T tracks!
        </p>

        {/* Leaderboard list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1">
          {entries.map((entry, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const medalColor =
              rank === 1
                ? 'from-yellow-400 to-amber-500 text-slate-950'
                : rank === 2
                ? 'from-slate-200 to-slate-400 text-slate-950'
                : rank === 3
                ? 'from-amber-600 to-amber-800 text-white'
                : 'bg-slate-800 text-slate-400';

            return (
              <div
                key={entry.id || index}
                className={`p-3 rounded-2xl border transition flex items-center gap-3 ${
                  rank === 1
                    ? 'border-yellow-400/50 bg-yellow-500/10 shadow-lg'
                    : 'border-slate-800 bg-slate-800/40'
                }`}
              >
                {/* Rank Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-arcade text-sm font-black shadow-inner shrink-0 ${
                    isTop3 ? `bg-gradient-to-tr ${medalColor}` : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                </div>

                {/* Avatar */}
                <img
                  src={entry.avatar}
                  alt={entry.playerName}
                  className="w-10 h-10 rounded-full border border-slate-700 shadow-md shrink-0 bg-slate-950"
                />

                {/* Info */}
                <div className="flex-1 truncate text-left">
                  <div className="text-sm font-black text-white truncate flex items-center gap-1.5">
                    <span>{entry.playerName}</span>
                    {rank === 1 && (
                      <span className="text-[10px] bg-yellow-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                        CHAMPION
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{entry.stationReached || 'Park Street'}</span>
                    <span>•</span>
                    <span className="text-amber-400">{entry.distance}m</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <div className="font-arcade text-base md:text-lg text-yellow-400">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">{entry.dateStr || 'Today'}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition"
        >
          BACK TO GAME
        </button>
      </div>
    </div>
  );
};
