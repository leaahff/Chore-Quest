import confetti from 'canvas-confetti';
import { AppState, BadgeChain, LevelInfo } from '../types';
import { LEVEL_TITLES } from '../data/constants';

export const dayKey = (d = new Date()): string => d.toISOString().slice(0, 10);

export const weekKey = (d = new Date()): string => {
  const day = new Date(d);
  day.setDate(day.getDate() - day.getDay());
  return dayKey(day);
};

export const dateKeyOffset = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return dayKey(d);
};

export function levelInfo(totalXp: number): LevelInfo {
  let level = 0;
  let remaining = totalXp;
  let need = 100;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = 100 * (level + 1);
  }
  return {
    level,
    xpIntoLevel: remaining,
    xpForLevel: need,
    progress: Math.min(100, Math.round((remaining / need) * 100)),
    xpToNext: need - remaining,
  };
}

export const getLevelTitle = (level: number): string => {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];
};

export const coinsForChore = (xp: number): number => Math.max(1, Math.round(xp / 10));
export const coinsForLevel = (level: number): number => 5 + level * 2;
export const coinsForStreak = (streak: number): number => (streak > 0 && streak % 3 === 0 ? streak : 0);

export function nextStreak(state: AppState): {
  streak: number;
  bestStreak: number;
  freezeUsed: boolean;
  freezesToSpend: number;
} {
  const today = dayKey();
  if (state.lastCompletedDay === today) {
    return { streak: state.streak, bestStreak: state.bestStreak, freezeUsed: false, freezesToSpend: 0 };
  }
  if (!state.lastCompletedDay) {
    return { streak: 1, bestStreak: Math.max(1, state.bestStreak), freezeUsed: false, freezesToSpend: 0 };
  }
  const yesterdayKey = dateKeyOffset(-1);
  if (state.lastCompletedDay === yesterdayKey) {
    const streak = state.streak + 1;
    return { streak, bestStreak: Math.max(streak, state.bestStreak), freezeUsed: false, freezesToSpend: 0 };
  }
  const twoDaysAgoKey = dateKeyOffset(-2);
  if (state.lastCompletedDay === twoDaysAgoKey && state.streak > 0 && state.freezes > 0) {
    const streak = state.streak + 1;
    return { streak, bestStreak: Math.max(streak, state.bestStreak), freezeUsed: true, freezesToSpend: 1 };
  }
  return { streak: 1, bestStreak: Math.max(1, state.bestStreak), freezeUsed: false, freezesToSpend: 0 };
}

export function applyWeeklyReset(state: AppState): { state: AppState; resetOccurred: boolean; completedCountBefore: number } {
  const current = weekKey();
  if (state.lastResetWeek === current) {
    return { state, resetOccurred: false, completedCountBefore: 0 };
  }
  const weekly = state.chores.filter((c) => c.frequency === 'weekly');
  const completedCountBefore = weekly.filter((c) => c.completedAt).length;
  const allDone = weekly.length > 0 && weekly.every((c) => c.completedAt);
  
  const newState: AppState = {
    ...state,
    lastResetWeek: current,
    chores: state.chores.map((c) => ({ ...c, completedAt: null })),
    freezes: 1, // Replenish streak freeze each week
    perfectWeeks: (state.perfectWeeks || 0) + (allDone ? 1 : 0),
  };

  return { state: newState, resetOccurred: true, completedCountBefore };
}

export interface ChainProgressResult {
  value: number;
  unlockedCount: number;
  totalTiers: number;
  isMaxed: boolean;
  nextTier: { threshold: number; name: string; hint: string } | null;
  currentTier: { threshold: number; name: string; hint: string } | null;
  progressPct: number;
}

export function chainProgress(chain: BadgeChain, state: AppState): ChainProgressResult {
  const value = chain.getValue(state);
  const tiers = chain.tiers;
  let unlockedCount = 0;
  for (const t of tiers) {
    if (value >= t.threshold) unlockedCount++;
  }
  const totalTiers = tiers.length;
  const isMaxed = unlockedCount >= totalTiers;
  const nextTier = isMaxed ? null : tiers[unlockedCount];
  const currentTier = unlockedCount > 0 ? tiers[unlockedCount - 1] : null;

  let progressPct = 0;
  if (isMaxed) {
    progressPct = 100;
  } else if (currentTier && nextTier) {
    const from = currentTier.threshold;
    const to = nextTier.threshold;
    progressPct = Math.min(100, Math.max(0, ((value - from) / (to - from)) * 100));
  } else if (nextTier) {
    progressPct = Math.min(100, (value / nextTier.threshold) * 100);
  }

  return { value, unlockedCount, totalTiers, isMaxed, nextTier, currentTier, progressPct };
}

export interface WeekStatsResult {
  xp: number;
  chores: number;
  lastXp: number;
  trend: number | null;
}

export function weekStats(state: AppState): WeekStatsResult {
  const now = new Date();
  const wkStart = weekKey(now);
  const today = dayKey(now);

  let xp = 0;
  let chores = 0;
  for (const [k, v] of Object.entries(state.xpLog || {})) {
    if (k >= wkStart && k <= today) xp += v;
  }
  for (const [k, v] of Object.entries(state.completionsLog || {})) {
    if (k >= wkStart && k <= today) chores += v;
  }

  const lastWeekEnd = new Date(wkStart + 'T00:00:00');
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const lwEnd = dayKey(lastWeekEnd);
  const lwStartDate = new Date(lastWeekEnd);
  lwStartDate.setDate(lwStartDate.getDate() - 6);
  const lwStart = dayKey(lwStartDate);

  let lastXp = 0;
  for (const [k, v] of Object.entries(state.xpLog || {})) {
    if (k >= lwStart && k <= lwEnd) lastXp += v;
  }

  const trend = lastXp > 0 ? Math.round(((xp - lastXp) / lastXp) * 100) : (xp > 0 ? 100 : null);

  return { xp, chores, lastXp, trend };
}

export function haptic(pattern: number | number[] = 15) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore unsupported vibration
  }
}

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2dd4bf', '#fb923c', '#facc15', '#38bdf8', '#c084fc', '#f43f5e'],
      disableForReducedMotion: true,
    });
  } catch {
    // Fallback if canvas is disabled
  }
}
