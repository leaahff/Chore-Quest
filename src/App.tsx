import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, Chore, Reward, Frequency, AvatarItem } from './types';
import {
  AVATARS,
  BADGE_CHAINS,
  DEFAULT_REWARDS,
} from './data/constants';
import {
  levelInfo,
  getLevelTitle,
  coinsForChore,
  coinsForLevel,
  coinsForStreak,
  nextStreak,
  applyWeeklyReset,
  chainProgress,
  weekStats,
  dayKey,
  haptic,
  triggerConfetti,
} from './utils/gameLogic';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestPermission,
  sendDailyStreakReminder,
  sendLevelUpNotification,
} from './utils/notifications';

import { Header } from './components/Header';
import { LevelCard } from './components/LevelCard';
import { WeekRecap } from './components/WeekRecap';
import { ChoresSection } from './components/ChoresSection';
import { AddChoreSection } from './components/AddChoreSection';
import { ShopSheet } from './components/sheets/ShopSheet';
import { BadgesSheet } from './components/sheets/BadgesSheet';
import { AvatarSheet } from './components/sheets/AvatarSheet';
import { StatsSheet } from './components/sheets/StatsSheet';
import { LevelUpModal } from './components/modals/LevelUpModal';
import { Toast } from './components/Toast';
import { UndoToast } from './components/UndoToast';

const STORAGE_KEY = 'chorequest.state.v1';
const THEME_KEY = 'chorequest.theme';
const NOTIF_KEY = 'chorequest.notif.v1';

function getInitialState(): AppState {
  const defaultChores: Chore[] = [
    { id: 'c1', name: 'Clean bathroom', category: 'Bathroom', frequency: 'weekly', difficulty: 'hard', xp: 50, completedAt: null },
    { id: 'c2', name: 'Vacuum living room', category: 'Living room', frequency: 'weekly', difficulty: 'easy', xp: 20, completedAt: null },
    { id: 'c3', name: 'Fold the laundry', category: 'Laundry', frequency: 'weekly', difficulty: 'medium', xp: 35, completedAt: null },
    { id: 'c4', name: 'Deep clean the fridge', category: 'Kitchen', frequency: 'monthly', difficulty: 'hard', xp: 50, completedAt: null },
    { id: 'c5', name: 'Wash the windows', category: 'Outdoors', frequency: 'monthly', difficulty: 'medium', xp: 35, completedAt: null },
  ];

  const base: AppState = {
    chores: defaultChores,
    totalXp: 0,
    streak: 0,
    bestStreak: 0,
    lastCompletedDay: null,
    completedCount: 0,
    lastResetWeek: null,
    coins: 0,
    rewards: DEFAULT_REWARDS,
    redeemed: [],
    xpLog: {},
    completionsLog: {},
    dailySnapshots: {},
    freezes: 1,
    perfectWeeks: 0,
    rewardsClaimed: 0,
    avatar: 'sparkles',
    avatarSeen: 0,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const initial = getInitialState();
    const { state: resetState } = applyWeeklyReset(initial);
    return resetState;
  });

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Notifications state
  const [notifEnabled, setNotifEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      return stored === 'true' && getNotificationPermission() === 'granted';
    } catch {
      return false;
    }
  });

  // Active views / sheets / modals
  const [currentTab, setCurrentTab] = useState<Frequency>('weekly');
  const [choreFilter, setChoreFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [shopOpen, setShopOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [avatarsOpen, setAvatarsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  // Burst animations on cards
  const [burstId, setBurstId] = useState<string | null>(null);
  const [undoBurstId, setUndoBurstId] = useState<string | null>(null);

  // Celebratory Level Up Modal state
  const [levelUpModal, setLevelUpModal] = useState<{
    level: number;
    title: string;
    bonusXp: number;
    coins: number;
    avatars: AvatarItem[];
  } | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIcon, setToastIcon] = useState<string>('Sparkles');

  // Deletion undo
  const [pendingDelete, setPendingDelete] = useState<{
    chore: Chore;
    index: number;
  } | null>(null);

  const showToast = useCallback((msg: string, icon = 'Sparkles', duration = 2400) => {
    setToastMessage(msg);
    setToastIcon(icon);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, duration);
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota exceeded
    }
  }, [state]);

  // Sync dark class on document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore
    }
  }, [isDark]);

  // Sync notification preferences
  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_KEY, String(notifEnabled));
    } catch {
      // Ignore
    }
  }, [notifEnabled]);

  // Check for weekly reset on mount and visibility change
  useEffect(() => {
    const checkReset = () => {
      setState((prev) => {
        const { state: updated, resetOccurred, completedCountBefore } = applyWeeklyReset(prev);
        if (resetOccurred && completedCountBefore > 0) {
          showToast(`New week started! Chores reset for a fresh streak.`, 'CalendarCheck2');
        }
        return updated;
      });
    };

    checkReset();
    window.addEventListener('focus', checkReset);
    return () => window.removeEventListener('focus', checkReset);
  }, [showToast]);

  // Send daily reminder if active
  useEffect(() => {
    if (!notifEnabled) return;
    const timer = setTimeout(() => {
      sendDailyStreakReminder(state);
    }, 2000);
    return () => clearTimeout(timer);
  }, [notifEnabled, state]);

  // Keyboard shortcut support (Escape to close modals, Ctrl+Z to undo delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (levelUpModal) setLevelUpModal(null);
        else if (shopOpen) setShopOpen(false);
        else if (badgesOpen) setBadgesOpen(false);
        else if (avatarsOpen) setAvatarsOpen(false);
        else if (statsOpen) setStatsOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && pendingDelete) {
        e.preventDefault();
        handleUndoDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Calculate computed level details
  const currentLevelInfo = useMemo(() => levelInfo(state.totalXp), [state.totalXp]);
  const currentTitle = useMemo(
    () => getLevelTitle(currentLevelInfo.level),
    [currentLevelInfo.level]
  );
  const currentAvatar = useMemo(
    () => AVATARS.find((a) => a.id === state.avatar) || AVATARS[0],
    [state.avatar]
  );

  const unlockedAvatarsCount = useMemo(
    () => AVATARS.filter((a) => a.level <= currentLevelInfo.level).length,
    [currentLevelInfo.level]
  );
  const hasNewAvatars = unlockedAvatarsCount > (state.avatarSeen || 0);

  const badgeChainProgress = useMemo(
    () => BADGE_CHAINS.map((chain) => chainProgress(chain, state)),
    [state]
  );
  const unlockedBadgeTiers = useMemo(
    () => badgeChainProgress.reduce((acc, curr) => acc + curr.unlockedCount, 0),
    [badgeChainProgress]
  );
  const totalBadgeTiers = useMemo(
    () => badgeChainProgress.reduce((acc, curr) => acc + curr.totalTiers, 0),
    [badgeChainProgress]
  );

  const weeklyStats = useMemo(() => weekStats(state), [state]);

  // Complete chore handler
  const handleCompleteChore = (id: string) => {
    const chore = state.chores.find((c) => c.id === id);
    if (!chore || chore.completedAt) return;

    haptic(20);
    setBurstId(id);
    setTimeout(() => setBurstId((prev) => (prev === id ? null : prev)), 1100);

    const beforeLevel = levelInfo(state.totalXp).level;
    const baseXp = state.totalXp + chore.xp;
    const levelFromChore = levelInfo(baseXp).level;
    const levelUpBonus = levelFromChore > beforeLevel ? levelFromChore * 25 : 0;
    const totalXp = baseXp + levelUpBonus;
    const xpGained = chore.xp + levelUpBonus;

    const streakInfo = nextStreak(state);
    const streak = streakInfo.streak;
    const bestStreak = streakInfo.bestStreak;
    const freezeUsed = streakInfo.freezeUsed;
    const freezesToSpend = streakInfo.freezesToSpend;

    const afterLevel = levelInfo(totalXp).level;
    const streakBonus = streak !== state.streak ? coinsForStreak(streak) : 0;
    const levelCoins = afterLevel > beforeLevel ? coinsForLevel(afterLevel) : 0;
    const choreCoins = coinsForChore(chore.xp);
    const coinsGained = choreCoins + levelCoins + streakBonus;

    const today = dayKey();
    const wasFirstToday = (state.completionsLog[today] || 0) === 0;

    const xpLog = { ...state.xpLog, [today]: (state.xpLog[today] || 0) + xpGained };
    const completionsLog = {
      ...state.completionsLog,
      [today]: (state.completionsLog[today] || 0) + 1,
    };
    const freezesLeft = freezeUsed
      ? Math.max(0, state.freezes - freezesToSpend)
      : state.freezes;

    const dailySnapshots = { ...(state.dailySnapshots || {}) };
    if (wasFirstToday) {
      dailySnapshots[today] = {
        streak: state.streak,
        bestStreak: state.bestStreak,
        freezes: state.freezes,
        lastCompletedDay: state.lastCompletedDay,
      };
    }

    const nowIso = new Date().toISOString();
    const completionMeta = {
      xpGained,
      coinsGained,
      day: today,
      at: nowIso,
    };

    setState((prev) => ({
      ...prev,
      totalXp,
      coins: prev.coins + coinsGained,
      completedCount: prev.completedCount + 1,
      lastCompletedDay: today,
      streak,
      bestStreak,
      freezes: freezesLeft,
      xpLog,
      completionsLog,
      dailySnapshots,
      chores: prev.chores.map((c) =>
        c.id === id ? { ...c, completedAt: nowIso, completionMeta } : c
      ),
    }));

    if (afterLevel > beforeLevel) {
      triggerConfetti();
      haptic([30, 60, 30, 60, 90]);
      const newAvatars = AVATARS.filter(
        (a) => a.level > beforeLevel && a.level <= afterLevel
      );

      setLevelUpModal({
        level: afterLevel,
        title: getLevelTitle(afterLevel),
        bonusXp: levelUpBonus,
        coins: levelCoins,
        avatars: newAvatars,
      });

      if (notifEnabled) {
        sendLevelUpNotification(afterLevel, chore.name, levelUpBonus, levelCoins);
      }
    } else {
      showToast(`+${chore.xp} XP earned!`, 'Sparkles');
    }
  };

  // Undo chore completion handler
  const handleUndoCompleteChore = (id: string) => {
    const chore = state.chores.find((c) => c.id === id);
    if (!chore || !chore.completedAt) return;

    const meta = chore.completionMeta;
    if (!meta) {
      setState((prev) => ({
        ...prev,
        chores: prev.chores.map((c) => (c.id === id ? { ...c, completedAt: null } : c)),
      }));
      showToast('Completion undone', 'Undo2');
      return;
    }

    const day = meta.day;
    const xpLog = { ...state.xpLog };
    const newDayXp = Math.max(0, (xpLog[day] || 0) - meta.xpGained);
    if (newDayXp > 0) xpLog[day] = newDayXp;
    else delete xpLog[day];

    const completionsLog = { ...state.completionsLog };
    const newDayCompletions = Math.max(0, (completionsLog[day] || 0) - 1);
    const dayIsEmpty = newDayCompletions === 0;
    if (dayIsEmpty) delete completionsLog[day];
    else completionsLog[day] = newDayCompletions;

    let streak = state.streak;
    let bestStreak = state.bestStreak;
    let freezes = state.freezes;
    let lastCompletedDay = state.lastCompletedDay;

    const dailySnapshots = { ...(state.dailySnapshots || {}) };
    if (dayIsEmpty && dailySnapshots[day]) {
      const snap = dailySnapshots[day];
      streak = snap.streak;
      bestStreak = snap.bestStreak;
      freezes = snap.freezes;
      lastCompletedDay = snap.lastCompletedDay;
      delete dailySnapshots[day];
    }

    setState((prev) => ({
      ...prev,
      totalXp: Math.max(0, prev.totalXp - meta.xpGained),
      coins: Math.max(0, prev.coins - meta.coinsGained),
      completedCount: Math.max(0, prev.completedCount - 1),
      streak,
      bestStreak,
      freezes,
      lastCompletedDay,
      xpLog,
      completionsLog,
      dailySnapshots,
      chores: prev.chores.map((c) => {
        if (c.id !== id) return c;
        const { completionMeta: _, ...rest } = c;
        return { ...rest, completedAt: null };
      }),
    }));

    setUndoBurstId(id);
    setTimeout(() => setUndoBurstId((prev) => (prev === id ? null : prev)), 1100);
    haptic(15);
    showToast('Completion undone', 'Undo2');
  };

  // Delete chore with undo toast
  const handleDeleteChore = (id: string) => {
    const idx = state.chores.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const chore = state.chores[idx];

    setState((prev) => ({
      ...prev,
      chores: prev.chores.filter((c) => c.id !== id),
    }));

    setPendingDelete({ chore, index: idx });
    haptic(15);

    setTimeout(() => {
      setPendingDelete((current) => (current?.chore.id === id ? null : current));
    }, 5000);
  };

  // Undo deletion handler
  const handleUndoDelete = () => {
    if (!pendingDelete) return;
    const { chore, index } = pendingDelete;
    setPendingDelete(null);

    setState((prev) => {
      const copy = [...prev.chores];
      const insertAt = Math.min(Math.max(0, index), copy.length);
      copy.splice(insertAt, 0, chore);
      return { ...prev, chores: copy };
    });

    haptic(15);
    showToast(`Restored "${chore.name}"`, 'Check');
  };

  // Add chore handler
  const handleAddChore = (choreData: Omit<Chore, 'id' | 'completedAt'>) => {
    const newChore: Chore = {
      ...choreData,
      id: 'chore-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      completedAt: null,
    };

    setState((prev) => ({
      ...prev,
      chores: [newChore, ...prev.chores],
    }));

    haptic(15);
    showToast(`Added "${newChore.name}"`, 'Plus');
  };

  // Reward handlers
  const handleClaimReward = (reward: Reward) => {
    if (state.coins < reward.cost) return;

    setState((prev) => ({
      ...prev,
      coins: prev.coins - reward.cost,
      rewardsClaimed: (prev.rewardsClaimed || 0) + 1,
      redeemed: [
        {
          id: 'red-' + Date.now(),
          name: reward.name,
          cost: reward.cost,
          at: new Date().toISOString(),
        },
        ...prev.redeemed,
      ],
    }));

    haptic([15, 30, 15]);
    showToast(`Claimed: ${reward.name}! Enjoy!`, 'Gift');
  };

  const handleDeleteReward = (id: string) => {
    setState((prev) => ({
      ...prev,
      rewards: prev.rewards.filter((r) => r.id !== id),
    }));
    showToast('Reward deleted', 'Trash2');
  };

  const handleAddReward = (name: string, cost: number, icon: string) => {
    const newReward: Reward = {
      id: 'rew-' + Date.now(),
      name,
      cost,
      icon,
    };

    setState((prev) => ({
      ...prev,
      rewards: [...prev.rewards, newReward],
    }));

    showToast(`Added reward "${name}"`, 'Plus');
  };

  // Select Avatar handler
  const handleSelectAvatar = (avatarId: string) => {
    const target = AVATARS.find((a) => a.id === avatarId);
    if (!target || target.level > currentLevelInfo.level) return;

    setState((prev) => ({
      ...prev,
      avatar: avatarId,
    }));

    haptic(15);
    showToast(`${target.name} equipped!`, 'UserCheck');
  };

  // Open avatars sheet and acknowledge all unlocked avatars
  const handleOpenAvatars = () => {
    setAvatarsOpen(true);
    setState((prev) => ({
      ...prev,
      avatarSeen: unlockedAvatarsCount,
    }));
  };

  // Toggle notifications
  const handleToggleNotifications = async () => {
    if (!isNotificationSupported()) {
      showToast('Notifications are not supported in this browser.', 'BellOff');
      return;
    }

    if (notifEnabled) {
      setNotifEnabled(false);
      showToast('Reminders turned off.', 'BellOff');
    } else {
      const granted = await requestPermission();
      if (granted) {
        setNotifEnabled(true);
        showToast('Streak reminders enabled!', 'BellRing');
        sendDailyStreakReminder(state);
      } else {
        setNotifEnabled(false);
        showToast('Notifications blocked in browser settings.', 'BellOff');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#182323] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      <main className="max-w-[460px] mx-auto px-4 pt-5 pb-16">
        {/* Header */}
        <Header
          currentAvatar={currentAvatar}
          levelTitle={currentTitle}
          coins={state.coins}
          hasNewAvatars={hasNewAvatars}
          unlockedAvatarsCount={unlockedAvatarsCount}
          totalAvatarsCount={AVATARS.length}
          notificationsActive={notifEnabled}
          notificationsBlocked={getNotificationPermission() === 'denied'}
          isDark={isDark}
          onOpenAvatars={handleOpenAvatars}
          onOpenShop={() => setShopOpen(true)}
          onOpenStats={() => setStatsOpen(true)}
          onToggleNotifications={handleToggleNotifications}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />

        {/* Level Progression Card */}
        <LevelCard
          level={currentLevelInfo}
          totalXp={state.totalXp}
          chores={state.chores}
          streak={state.streak}
          bestStreak={state.bestStreak}
          freezes={state.freezes}
          badgesUnlocked={unlockedBadgeTiers}
          badgesTotal={totalBadgeTiers}
          currentAvatar={currentAvatar}
          onOpenBadges={() => setBadgesOpen(true)}
          onOpenAvatars={handleOpenAvatars}
        />

        {/* Weekly Activity Recap */}
        <WeekRecap stats={weeklyStats} />

        {/* Chores Section (Tabs, Filters, Category List) */}
        <ChoresSection
          chores={state.chores}
          currentTab={currentTab}
          filter={choreFilter}
          burstId={burstId}
          undoBurstId={undoBurstId}
          onTabChange={setCurrentTab}
          onFilterChange={setChoreFilter}
          onComplete={handleCompleteChore}
          onUndoComplete={handleUndoCompleteChore}
          onDelete={handleDeleteChore}
        />

        {/* Add Chore Section (Templates + Form) */}
        <AddChoreSection onAddChore={handleAddChore} />
      </main>

      {/* Reward Shop Bottom Sheet */}
      {shopOpen && (
        <ShopSheet
          coins={state.coins}
          rewards={state.rewards}
          redeemed={state.redeemed}
          onClose={() => setShopOpen(false)}
          onClaimReward={handleClaimReward}
          onDeleteReward={handleDeleteReward}
          onAddReward={handleAddReward}
        />
      )}

      {/* Badges Bottom Sheet */}
      {badgesOpen && (
        <BadgesSheet state={state} onClose={() => setBadgesOpen(false)} />
      )}

      {/* Avatars Bottom Sheet */}
      {avatarsOpen && (
        <AvatarSheet
          currentAvatarId={state.avatar}
          userLevel={currentLevelInfo.level}
          onClose={() => setAvatarsOpen(false)}
          onSelectAvatar={handleSelectAvatar}
        />
      )}

      {/* Statistics Bottom Sheet */}
      {statsOpen && (
        <StatsSheet
          state={state}
          userLevel={currentLevelInfo.level}
          onClose={() => setStatsOpen(false)}
        />
      )}

      {/* Celebratory Level-Up Modal */}
      {levelUpModal && (
        <LevelUpModal
          level={levelUpModal.level}
          title={levelUpModal.title}
          bonusXp={levelUpModal.bonusXp}
          coins={levelUpModal.coins}
          avatars={levelUpModal.avatars}
          onClose={() => setLevelUpModal(null)}
        />
      )}

      {/* General Feedback Toast */}
      <Toast message={toastMessage} iconName={toastIcon} />

      {/* Deletion Undo Toast */}
      <UndoToast
        message={pendingDelete ? `Deleted "${pendingDelete.chore.name}"` : null}
        onUndo={handleUndoDelete}
      />
    </div>
  );
}
