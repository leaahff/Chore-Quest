import React from 'react';
import { DynamicIcon } from './DynamicIcon';
import { AvatarItem } from '../types';

interface HeaderProps {
  currentAvatar: AvatarItem;
  levelTitle: string;
  coins: number;
  hasNewAvatars: boolean;
  unlockedAvatarsCount: number;
  totalAvatarsCount: number;
  notificationsActive: boolean;
  notificationsBlocked: boolean;
  isDark: boolean;
  onOpenAvatars: () => void;
  onOpenShop: () => void;
  onOpenStats: () => void;
  onToggleNotifications: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAvatar,
  levelTitle,
  coins,
  hasNewAvatars,
  unlockedAvatarsCount,
  totalAvatarsCount,
  notificationsActive,
  notificationsBlocked,
  isDark,
  onOpenAvatars,
  onOpenShop,
  onOpenStats,
  onToggleNotifications,
  onToggleTheme,
}) => {
  const coinLabel = coins > 999 ? '999+' : String(coins);

  return (
    <header className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3 min-w-0 mr-auto pr-3">
        <button
          type="button"
          onClick={onOpenAvatars}
          className="relative w-11 h-11 flex-shrink-0 grid place-items-center rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
          style={{ borderColor: currentAvatar.color }}
          title={`${currentAvatar.name} — ${unlockedAvatarsCount}/${totalAvatarsCount} avatars unlocked`}
          aria-label={`Avatars — ${currentAvatar.name} equipped`}
        >
          <span
            className="w-8 h-8 grid place-items-center rounded-full"
            style={{
              backgroundColor: `${currentAvatar.color}25`,
              color: currentAvatar.color,
            }}
          >
            <DynamicIcon name={currentAvatar.icon} className="w-4 h-4" />
          </span>
          {hasNewAvatars && (
            <span
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-stone-100 dark:border-stone-900 animate-pulse"
              aria-hidden="true"
            />
          )}
        </button>

        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight font-['Space_Grotesk'] text-stone-900 dark:text-stone-50 leading-tight whitespace-nowrap pr-2">
            Chorequest
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[130px] sm:max-w-[200px]">
            {levelTitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        {/* Reward Shop Button */}
        <button
          type="button"
          onClick={onOpenShop}
          className="relative w-9 h-9 grid place-items-center rounded-full border border-teal-200 dark:border-teal-900/60 bg-white dark:bg-stone-900 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition active:scale-95 cursor-pointer"
          title={`Reward shop — ${coins} coins`}
          aria-label={`Reward shop (${coins} coins)`}
        >
          <DynamicIcon name="ShoppingBag" className="w-4 h-4" />
          {coins > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-teal-600 text-white font-['Space_Grotesk'] text-[9px] font-extrabold grid place-items-center border-2 border-white dark:border-stone-900 leading-none">
              {coinLabel}
            </span>
          )}
        </button>

        {/* Stats Button */}
        <button
          type="button"
          onClick={onOpenStats}
          className="w-9 h-9 grid place-items-center rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition active:scale-95 cursor-pointer"
          title="Statistics"
          aria-label="View statistics"
        >
          <DynamicIcon name="BarChart3" className="w-4 h-4" />
        </button>

        {/* Notifications Button */}
        <button
          type="button"
          onClick={onToggleNotifications}
          className={`w-9 h-9 grid place-items-center rounded-full border transition active:scale-95 cursor-pointer ${
            notificationsActive
              ? 'border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40'
              : notificationsBlocked
              ? 'border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-600 bg-white dark:bg-stone-900 opacity-60'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
          title={
            notificationsActive
              ? 'Reminders enabled — click to disable'
              : notificationsBlocked
              ? 'Notifications blocked in browser'
              : 'Enable streak reminders'
          }
          aria-label="Toggle notifications"
        >
          <DynamicIcon
            name={
              notificationsActive
                ? 'BellRing'
                : notificationsBlocked
                ? 'BellOff'
                : 'Bell'
            }
            className="w-4 h-4"
          />
        </button>

        {/* Dark/Light Mode Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-9 h-9 grid place-items-center rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition active:scale-95 cursor-pointer"
          title="Toggle theme"
          aria-label="Toggle dark mode"
        >
          <DynamicIcon name={isDark ? 'Sun' : 'Moon'} className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
