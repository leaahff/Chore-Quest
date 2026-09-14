export type Frequency = 'weekly' | 'monthly';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 
  | 'Kitchen' 
  | 'Bathroom' 
  | 'Bedroom' 
  | 'Living room' 
  | 'Laundry' 
  | 'Outdoors' 
  | 'Admin';

export interface CompletionMeta {
  xpGained: number;
  coinsGained: number;
  day: string;
  at: string;
}

export interface Chore {
  id: string;
  name: string;
  category: Category;
  frequency: Frequency;
  difficulty: Difficulty;
  xp: number;
  completedAt: string | null;
  completionMeta?: CompletionMeta;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
}

export interface RedeemedReward {
  id: string;
  name: string;
  cost: number;
  at: string;
}

export interface AvatarItem {
  id: string;
  name: string;
  title?: string;
  description?: string;
  icon: string;
  level: number;
  color: string;
}

export interface BadgeTier {
  threshold: number;
  name: string;
  hint: string;
}

export interface BadgeChain {
  id: string;
  name: string;
  icon: string;
  tiers: BadgeTier[];
  getValue: (state: AppState) => number;
  formatValue: (value: number) => string;
}

export interface DailySnapshot {
  streak: number;
  bestStreak: number;
  freezes: number;
  lastCompletedDay: string | null;
}

export interface AppState {
  chores: Chore[];
  totalXp: number;
  streak: number;
  bestStreak: number;
  lastCompletedDay: string | null;
  completedCount: number;
  lastResetWeek: string | null;
  coins: number;
  rewards: Reward[];
  redeemed: RedeemedReward[];
  xpLog: Record<string, number>;
  completionsLog: Record<string, number>;
  dailySnapshots: Record<string, DailySnapshot>;
  freezes: number;
  perfectWeeks: number;
  rewardsClaimed: number;
  avatar: string;
  avatarSeen: number;
}

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  progress: number;
  xpToNext: number;
}
