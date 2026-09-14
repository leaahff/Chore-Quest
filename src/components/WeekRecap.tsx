import React from 'react';
import { WeekStatsResult } from '../utils/gameLogic';
import { DynamicIcon } from './DynamicIcon';

interface WeekRecapProps {
  stats: WeekStatsResult;
}

export const WeekRecap: React.FC<WeekRecapProps> = ({ stats }) => {
  if (stats.xp === 0 && stats.chores === 0) return null;

  const isUp = stats.trend !== null && stats.trend >= 0;
  const choresLabel = stats.chores === 1 ? 'chore' : 'chores';

  return (
    <div className="flex items-center gap-3.5 p-3.5 bg-teal-500/10 dark:bg-teal-950/30 border border-teal-500/25 dark:border-teal-800/40 rounded-2xl mb-4 shadow-sm">
      <span className="w-10 h-10 flex-shrink-0 grid place-items-center rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300">
        <DynamicIcon name="CalendarCheck2" className="w-5 h-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          This week
        </p>
        <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
          <span className="font-['Space_Grotesk'] text-xl font-extrabold text-stone-900 dark:text-stone-50">
            {stats.xp.toLocaleString()}
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 ml-1">
              XP
            </span>
          </span>

          {stats.trend !== null && stats.lastXp > 0 && (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                isUp
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
              }`}
            >
              <DynamicIcon
                name={isUp ? 'TrendingUp' : 'TrendingDown'}
                className="w-3 h-3"
              />
              {isUp ? '+' : ''}
              {stats.trend}%
            </span>
          )}
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
          <strong className="font-bold text-stone-900 dark:text-stone-100 font-['Space_Grotesk']">
            {stats.chores}
          </strong>{' '}
          {choresLabel} completed since Sunday
        </p>
      </div>
    </div>
  );
};
