import React from 'react';
import { AvatarItem } from '../../types';
import { AVATARS } from '../../data/constants';
import { DynamicIcon } from '../DynamicIcon';

interface AvatarSheetProps {
  currentAvatarId: string;
  userLevel: number;
  onClose: () => void;
  onSelectAvatar: (avatarId: string) => void;
}

export const AvatarSheet: React.FC<AvatarSheetProps> = ({
  currentAvatarId,
  userLevel,
  onClose,
  onSelectAvatar,
}) => {
  const currentAvatar = AVATARS.find((a) => a.id === currentAvatarId) || AVATARS[0];
  const unlockedCount = AVATARS.filter((a) => a.level <= userLevel).length;
  const totalCount = AVATARS.length;
  const nextAvatar = AVATARS.find((a) => a.level > userLevel);

  let nextProgressPct = 100;
  if (nextAvatar) {
    const prevLevel = AVATARS.filter((a) => a.level <= userLevel).slice(-1)[0]?.level || 0;
    const span = Math.max(1, nextAvatar.level - prevLevel);
    nextProgressPct = Math.min(100, Math.max(0, Math.round(((userLevel - prevLevel) / span) * 100)));
  }

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
          <h2 className="font-['Space_Grotesk'] text-lg font-extrabold">Avatars</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-['Space_Grotesk'] font-extrabold text-sm">
              <DynamicIcon name="User" className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>
                {unlockedCount} / {totalCount}
              </span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 grid place-items-center rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
              aria-label="Close avatars"
            >
              <DynamicIcon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {/* Equipped Hero Card */}
          <div
            className="flex items-center gap-3.5 p-4 rounded-2xl border shadow-sm"
            style={{
              borderColor: `${currentAvatar.color}50`,
              backgroundColor: `${currentAvatar.color}15`,
            }}
          >
            <span
              className="w-14 h-14 flex-shrink-0 grid place-items-center rounded-full shadow-sm"
              style={{
                backgroundColor: `${currentAvatar.color}35`,
                color: currentAvatar.color,
              }}
            >
              <DynamicIcon name={currentAvatar.icon} className="w-7 h-7" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-['Space_Grotesk'] font-extrabold text-base text-stone-900 dark:text-stone-100">
                  {currentAvatar.name}
                </p>
                {currentAvatar.title && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300">
                    {currentAvatar.title}
                  </span>
                )}
              </div>
              {currentAvatar.description && (
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 italic leading-snug">
                  "{currentAvatar.description}"
                </p>
              )}
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Equipped · {unlockedCount} of {totalCount} unlocked
              </p>
            </div>
          </div>

          {/* Next Avatar Unlock Card */}
          {nextAvatar ? (
            <div className="mt-3 p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/70">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                  <DynamicIcon name="Lock" className="w-3.5 h-3.5 text-stone-400" />
                  Next: {nextAvatar.name}
                </span>
                <span className="text-teal-600 dark:text-teal-400 font-['Space_Grotesk']">
                  Level {nextAvatar.level}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${nextProgressPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                {nextAvatar.level - userLevel} level
                {nextAvatar.level - userLevel === 1 ? '' : 's'} to unlock
              </p>
            </div>
          ) : (
            <div className="mt-3 p-3 text-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-400">
              All {totalCount} avatars unlocked — legendary status!
            </div>
          )}

          {/* Grid of Avatars */}
          <h3 className="text-xs font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mt-5 mb-3">
            Collection
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {AVATARS.map((avatar) => {
              const isUnlocked = avatar.level <= userLevel;
              const isCurrent = avatar.id === currentAvatarId;

              return (
                <button
                  key={avatar.id}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => onSelectAvatar(avatar.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition cursor-pointer ${
                    isCurrent
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/25 shadow-sm'
                      : isUnlocked
                      ? 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-teal-300 dark:hover:border-teal-800'
                      : 'border-stone-200 dark:border-stone-800/60 bg-stone-50/70 dark:bg-stone-900/40 opacity-55 cursor-not-allowed'
                  }`}
                >
                  <span
                    className="w-11 h-11 grid place-items-center rounded-full"
                    style={{
                      backgroundColor: isUnlocked ? `${avatar.color}25` : undefined,
                      color: isUnlocked ? avatar.color : '#a8a29e',
                    }}
                  >
                    <DynamicIcon name={isUnlocked ? avatar.icon : 'Lock'} className="w-5 h-5" />
                  </span>

                  <span className="font-['Space_Grotesk'] text-xs font-bold text-stone-900 dark:text-stone-100 text-center leading-tight">
                    {avatar.name}
                  </span>

                  {isUnlocked && avatar.description && (
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight text-center line-clamp-2 px-0.5">
                      {avatar.description}
                    </span>
                  )}

                  <span
                    className={`text-[10px] font-semibold mt-auto pt-1 ${
                      isCurrent
                        ? 'text-teal-600 dark:text-teal-400 font-bold'
                        : 'text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    {isUnlocked ? (isCurrent ? 'Equipped' : 'Tap to equip') : `Level ${avatar.level}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
