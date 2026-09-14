import React from 'react';
import { LevelInfo, Chore, AvatarItem } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface LevelCardProps {
  level: LevelInfo;
  totalXp: number;
  chores: Chore[];
  streak: number;
  bestStreak: number;
  freezes: number;
  badgesUnlocked: number;
  badgesTotal: number;
  currentAvatar?: AvatarItem;
  onOpenBadges: () => void;
  onOpenAvatars?: () => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  totalXp,
  chores,
  streak,
  bestStreak,
  freezes,
  badgesUnlocked,
  badgesTotal,
  currentAvatar,
  onOpenBadges,
  onOpenAvatars,
}) => {
  const total = chores.length;
  const done = chores.filter((c) => c.completedAt).length;
  const pct = total === 0 ? 0 : (done / total) * 100;
  const weekly = chores.filter((c) => c.frequency === 'weekly');
  const monthly = chores.filter((c) => c.frequency === 'monthly');
  const weeklyDone = weekly.filter((c) => c.completedAt).length;
  const monthlyDone = monthly.filter((c) => c.completedAt).length;

  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;

  const badgesPct = Math.round((badgesUnlocked / badgesTotal) * 100);
  const streakLabel = streak === 1 ? 'day' : 'days';
  const bestStreakLabel = bestStreak === 1 ? 'day' : 'days';

  return (
    <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm mb-3">
      {/* Level Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-teal-600 dark:text-teal-400">
            Current Level
          </p>
          <div className="flex items-center gap-3 mt-1">
            {currentAvatar && (
              <button
                type="button"
                onClick={onOpenAvatars}
                className="group relative w-12 h-12 flex-shrink-0 grid place-items-center rounded-2xl border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                style={{
                  borderColor: `${currentAvatar.color}50`,
                  backgroundColor: `${currentAvatar.color}18`,
                  color: currentAvatar.color,
                }}
                title={`${currentAvatar.name} — Equipped Avatar (Tap to change)`}
                aria-label={`Equipped avatar: ${currentAvatar.name}`}
              >
                <DynamicIcon name={currentAvatar.icon} className="w-6 h-6 transition-transform group-hover:scale-110" />
              </button>
            )}
            <p className="font-['Space_Grotesk'] text-6xl font-extrabold leading-none text-stone-900 dark:text-stone-50">
              {level.level}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-['Space_Grotesk'] text-sm font-bold text-teal-600 dark:text-teal-400">
            {totalXp.toLocaleString()} XP total
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {level.xpToNext} XP to level {level.level + 1}
          </p>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="mt-4 h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-700 ease-out"
          style={{ width: `${level.progress}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-stone-500 dark:text-stone-400">
        {level.xpIntoLevel} / {level.xpForLevel} XP this level
      </p>

      {/* Completion Ring Card */}
      <div className="mt-4 flex items-center gap-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-3 border border-stone-100 dark:border-stone-800/80">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-stone-200 dark:text-stone-700"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              className="text-teal-500 transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center font-['Space_Grotesk'] font-bold text-sm text-stone-800 dark:text-stone-100">
            {Math.round(pct)}%
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-['Space_Grotesk'] font-bold text-sm text-stone-900 dark:text-stone-100">
            All chores progress
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
            {done}/{total} completed · {weeklyDone}/{weekly.length} weekly · {monthlyDone}/{monthly.length} monthly
          </p>
        </div>
      </div>

      {/* Dashboard Quick Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {/* Streak Stat */}
        <div
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80"
          title={`Current streak: ${streak} ${streakLabel} (Best: ${bestStreak} ${bestStreakLabel})`}
        >
          <span className="w-9 h-9 grid place-items-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex-shrink-0">
            <DynamicIcon name="Flame" className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-['Space_Grotesk'] text-xl font-extrabold text-stone-900 dark:text-stone-100 leading-none flex items-baseline">
              {streak}
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 ml-1">
                {streakLabel}
              </span>
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-0.5">
              Streak
            </p>
          </div>
          {freezes > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 ml-auto"
              title={`${freezes} streak freeze protection available`}
            >
              <DynamicIcon name="Snowflake" className="w-3 h-3" />
              {freezes}
            </span>
          )}
        </div>

        {/* Badges Stat */}
        <button
          type="button"
          onClick={onOpenBadges}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80 text-left hover:bg-stone-100 dark:hover:bg-stone-800 transition active:scale-98 cursor-pointer"
          title={`${badgesUnlocked} of ${badgesTotal} badge tiers unlocked — tap to explore`}
          aria-label={`View badge chains (${badgesUnlocked} of ${badgesTotal} unlocked)`}
        >
          <span className="w-9 h-9 grid place-items-center rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex-shrink-0">
            <DynamicIcon name="Award" className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-['Space_Grotesk'] text-xl font-extrabold text-stone-900 dark:text-stone-100 leading-none flex items-baseline">
              {badgesUnlocked}
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 ml-1">
                /{badgesTotal}
              </span>
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-0.5">
              Badges
            </p>
            <div className="mt-1.5 h-1 rounded-full bg-purple-200/50 dark:bg-purple-950 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${badgesPct}%` }}
              />
            </div>
          </div>
        </button>
      </div>
    </section>
  );
};
