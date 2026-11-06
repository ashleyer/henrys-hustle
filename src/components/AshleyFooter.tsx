/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Github, X } from 'lucide-react';

interface AshleyFooterProps {
  className?: string;
}

export const AshleyFooter: React.FC<AshleyFooterProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <footer
        className={`w-full text-center py-2 text-xs md:text-sm font-['Courier_New',Courier,monospace] text-emerald-400 select-none z-30 pointer-events-auto ${className}`}
      >
        <span>built with 💚 by </span>
        <button
          onClick={() => setIsOpen(true)}
          className="underline hover:text-emerald-300 font-bold transition cursor-pointer"
        >
          Ashley
        </button>
        <span> in Boston 02116 for Henry, 2026.</span>
      </footer>

      {/* Ashley Contact Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-5 max-w-xs w-full shadow-2xl relative text-center animate-in fade-in zoom-in-95 font-['Courier_New',Courier,monospace]">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-emerald-400 font-bold text-base mb-1">
              Ashley in Boston 02116
            </div>
            <p className="text-slate-400 text-xs mb-4">
              Developer & Creator of Henry's Hustle
            </p>

            {/* Links */}
            <div className="flex flex-col gap-2.5">
              <a
                href="mailto:ashleye.romano@gmail.com"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Email (ashleye.romano@gmail.com)</span>
              </a>

              <a
                href="https://github.com/ashleyer/henrys-hustle"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Github className="w-4 h-4 text-emerald-400" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
