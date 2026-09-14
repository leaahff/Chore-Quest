import React from 'react';
import { AppState } from '../../types';
import { dateKeyOffset } from '../../utils/gameLogic';
import { AVATARS } from '../../data/constants';
import { DynamicIcon } from '../DynamicIcon';

interface StatsSheetProps {
  state: AppState;
  userLevel: number;
  onClose: () => void;
}

export const StatsSheet: React.FC<StatsSheetProps> = ({ state, userLevel, onClose }) => {
  const days: Array<{ key: string; xp: number; isToday: boolean }> = [];
  let maxXp = 1;

  for (let i = 13; i >= 0; i--) {
    const key = dateKeyOffset(-i);
    const xp = state.xpLog[key] || 0;
    if (xp > maxXp) maxXp = xp;
    days.push({ key, xp, isToday: i === 0 });
  }

  const avg7 = Math.round(days.slice(7).reduce((sum, d) => sum + d.xp, 0) / 7);

  let bestDayKey: string | null = null;
  let bestDayXp = 0;
  for (const [k, rawV] of Object.entries(state.xpLog)) {
    const v = Number(rawV) || 0;
    if (v > bestDayXp) {
      bestDayXp = v;
      bestDayKey = k;
    }
  }

  const bestDayLabel = bestDayKey
    ? `${new Date(bestDayKey + 'T00:00:00').toLocaleDateString()} — ${bestDayXp} XP`
    : '—';

  const avatarsUnlocked = AVATARS.filter((a) => a.level <= userLevel).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] bg-[#faf8f5] dark:bg-[#182323] text-stone-900 dark:text-stone-100 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mt-3 flex-shrink-0" />

        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
          <h2 className="font-['Space_Grotesk'] text-lg font-extrabold">Statistics</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
            aria-label="Close statistics"
          >
            <DynamicIcon name="X" className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center">
              <p className="font-['Space_Grotesk'] text-2xl font-extrabold text-teal-600 dark:text-teal-400 leading-none">
                {state.totalXp.toLocaleString()}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-1">
                Total XP
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center">
              <p className="font-['Space_Grotesk'] text-2xl font-extrabold text-teal-600 dark:text-teal-400 leading-none">
                {state.completedCount}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-1">
                Chores done
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center">
              <p className="font-['Space_Grotesk'] text-2xl font-extrabold text-amber-500 leading-none">
                {state.streak}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-1">
                Current streak
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center">
              <p className="font-['Space_Grotesk'] text-2xl font-extrabold text-amber-500 leading-none">
                {state.bestStreak}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-1">
                Best streak
              </p>
            </div>
          </div>

          {/* 14-Day XP Activity Chart */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
            XP activity · last 14 days
          </h3>
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm mb-5">
            <div className="flex items-end gap-1.5 h-28 pt-2">
              {days.map((d) => {
                const heightPct = d.xp === 0 ? 0 : Math.max(8, (d.xp / maxXp) * 100);
                const dayNum = d.key.slice(8);

                return (
                  <div
                    key={d.key}
                    className="flex-1 flex flex-col items-center justify-end h-full gap-1"
                    title={`${d.key} — ${d.xp} XP`}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        d.xp === 0
                          ? 'h-1 bg-stone-100 dark:bg-stone-800'
                          : 'bg-gradient-to-t from-teal-600 to-teal-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span
                      className={`text-[9px] font-bold ${
                        d.isToday ? 'text-teal-600 dark:text-teal-400' : 'text-stone-400'
                      }`}
                    >
                      {dayNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Highlights Breakdown */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
            Highlights
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
              <span className="text-stone-600 dark:text-stone-400">Avg XP / day (last 7 days)</span>
              <strong className="font-['Space_Grotesk'] text-stone-900 dark:text-stone-100 font-bold">
                {avg7} XP
              </strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
              <span className="text-stone-600 dark:text-stone-400">Best single day</span>
              <strong className="font-['Space_Grotesk'] text-stone-900 dark:text-stone-100 font-bold">
                {bestDayLabel}
              </strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
              <span className="text-stone-600 dark:text-stone-400">Perfect weeks</span>
              <strong className="font-['Space_Grotesk'] text-stone-900 dark:text-stone-100 font-bold">
                {state.perfectWeeks || 0}
              </strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
              <span className="text-stone-600 dark:text-stone-400">Rewards claimed</span>
              <strong className="font-['Space_Grotesk'] text-stone-900 dark:text-stone-100 font-bold">
                {state.rewardsClaimed || 0}
              </strong>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
              <span className="text-stone-600 dark:text-stone-400">Avatars unlocked</span>
              <strong className="font-['Space_Grotesk'] text-stone-900 dark:text-stone-100 font-bold">
                {avatarsUnlocked} / {AVATARS.length}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
