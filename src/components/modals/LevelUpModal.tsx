import React from 'react';
import { AvatarItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface LevelUpModalProps {
  level: number;
  title: string;
  bonusXp: number;
  coins: number;
  avatars: AvatarItem[];
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level,
  title,
  bonusXp,
  coins,
  avatars,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md grid place-items-center p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs bg-white dark:bg-stone-900 border border-teal-500/40 rounded-3xl p-8 text-center shadow-2xl overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Background Glow */}
        <div className="absolute -inset-10 bg-radial from-teal-500/20 via-transparent to-transparent pointer-events-none animate-pulse" />

        <div className="relative z-10">
          <DynamicIcon
            name="Crown"
            className="w-12 h-12 mx-auto text-amber-500 filter drop-shadow-md mb-2"
          />

          <p className="text-xs font-extrabold tracking-widest uppercase text-teal-600 dark:text-teal-400">
            Level up!
          </p>

          <p className="font-['Space_Grotesk'] text-7xl font-extrabold my-2 bg-gradient-to-br from-teal-500 via-teal-600 to-amber-500 bg-clip-text text-transparent leading-none">
            {level}
          </p>

          <p className="font-['Space_Grotesk'] text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">
            {title}
          </p>

          {/* Bonus rewards */}
          <div className="flex justify-center gap-2 flex-wrap mb-5">
            {bonusXp > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-['Space_Grotesk'] font-bold text-xs">
                <DynamicIcon name="Sparkles" className="w-3.5 h-3.5" />
                +{bonusXp} XP bonus
              </span>
            )}
            {coins > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-['Space_Grotesk'] font-bold text-xs">
                <DynamicIcon name="Coins" className="w-3.5 h-3.5" />
                +{coins} coins
              </span>
            )}
          </div>

          {/* Newly Unlocked Avatars */}
          {avatars.length > 0 && (
            <div className="mb-5 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 text-center">
                New avatar{avatars.length > 1 ? 's' : ''} unlocked!
              </p>
              <div className="space-y-2">
                {avatars.map((av) => (
                  <div
                    key={av.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-700/60 shadow-xs"
                  >
                    <span
                      title={av.name}
                      className="w-10 h-10 flex-shrink-0 grid place-items-center rounded-xl shadow-xs"
                      style={{
                        backgroundColor: `${av.color}25`,
                        color: av.color,
                      }}
                    >
                      <DynamicIcon name={av.icon} className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100 font-['Space_Grotesk'] leading-tight">
                        {av.name}
                      </p>
                      {av.description && (
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate leading-snug mt-0.5">
                          {av.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-['Space_Grotesk'] font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            Claim & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
