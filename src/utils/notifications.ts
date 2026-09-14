import { AppState } from '../types';
import { dayKey, getLevelTitle } from './gameLogic';

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export async function requestPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

export function sendNotification(title: string, options: NotificationOptions = {}) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return null;
  try {
    return new Notification(title, {
      ...options,
      tag: options.tag || 'chorequest',
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230d9488'/%3E%3Ctext x='32' y='42' font-size='34' font-family='sans-serif' font-weight='800' text-anchor='middle' fill='white'%3EC%3C/text%3E%3C/svg%3E",
    });
  } catch {
    return null;
  }
}

export function sendDailyStreakReminder(state: AppState) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const pending = state.chores.filter((c) => !c.completedAt);
  if (pending.length === 0) return;

  const count = pending.length;
  const choreWord = count > 1 ? 'chores' : 'chore';
  const hasStreak = state.streak > 0;
  const streakDays = state.streak;
  const day = new Date().getDay();
  const isWeekend = day === 6 || day === 0;
  const isFriday = day === 5;

  let title: string;
  let body: string;

  if (isWeekend) {
    title = 'Chorequest — Weekly reset approaching';
    body = `${count} ${choreWord} remaining before Sunday's reset. Keep your momentum going!`;
  } else if (isFriday) {
    title = hasStreak ? `🔥 ${streakDays}-day streak waiting!` : 'Weekend is near!';
    body = hasStreak
      ? `${count} ${choreWord} left to keep your ${streakDays}-day streak going strong.`
      : `${count} ${choreWord} to tackle — start a fresh streak this weekend!`;
  } else if (hasStreak) {
    title = `🔥 Keep your ${streakDays}-day streak alive!`;
    body = `Just ${count} ${choreWord} left today. A little progress makes a big difference!`;
  } else {
    title = 'Ready for a quick win?';
    body = `${count} ${choreWord} ready in Chorequest. Check one off and level up!`;
  }

  sendNotification(title, { body, tag: 'chorequest-daily-reminder' });
}

export function sendLevelUpNotification(
  level: number,
  choreName: string,
  bonusXp: number,
  coins: number
) {
  sendNotification(`Level ${level} Unlocked! — ${getLevelTitle(level)}`, {
    body: `Completed "${choreName}". +${bonusXp} bonus XP and +${coins} coins earned!`,
    tag: 'chorequest-level-up',
  });
}
