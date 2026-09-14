import React from 'react';
import { AppState } from '../../types';
import { BADGE_CHAINS } from '../../data/constants';
import { chainProgress } from '../../utils/gameLogic';
import { DynamicIcon } from '../DynamicIcon';

interface BadgesSheetProps {
  state: AppState;
  onClose: () => void;
}

export const BadgesSheet: React.FC<BadgesSheetProps> = ({ state, onClose }) => {
  const chainData = BADGE_CHAINS.map((chain) => ({
    chain,
    progress: chainProgress(chain, state),
  }));

  const unlockedTiers = chainData.reduce((acc, curr) => acc + curr.progress.unlockedCount, 0);
  const totalTiers = chainData.reduce((acc, curr) => acc + curr.progress.totalTiers, 0);
  const overallPct = Math.round((unlockedTiers / totalTiers) * 100);

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
          <h2 className="font-['Space_Grotesk'] text-lg font-extrabold">Badge chains</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-['Space_Grotesk'] font-extrabold text-sm">
              <DynamicIcon name="Award" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>
                {unlockedTiers} / {totalTiers}
              </span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 grid place-items-center rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
              aria-label="Close badges"
            >
              <DynamicIcon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {/* Summary Banner */}
          <div className="flex items-center gap-3 p-4 mb-4 rounded-2xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/20 dark:border-purple-800/40">
            <span className="w-10 h-10 flex-shrink-0 grid place-items-center rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
              <DynamicIcon name="Award" className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-['Space_Grotesk'] font-bold text-sm text-stone-900 dark:text-stone-100">
                {unlockedTiers} of {totalTiers} tiers unlocked ({overallPct}%)
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Complete daily and weekly chores to level up each achievement chain.
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-purple-200/60 dark:bg-purple-900/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Badge Chains List */}
          <div className="flex flex-col gap-3">
            {chainData.map(({ chain, progress }) => {
              const {
                value,
                unlockedCount,
                totalTiers,
                isMaxed,
                nextTier,
                currentTier,
                progressPct,
              } = progress;

              return (
                <div
                  key={chain.id}
                  className={`p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm transition ${
                    isMaxed ? 'border-purple-300 dark:border-purple-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 flex-shrink-0 grid place-items-center rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400">
                      <DynamicIcon name={chain.icon} className="w-5 h-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-['Space_Grotesk'] font-bold text-sm text-stone-900 dark:text-stone-100">
                        {chain.name}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {isMaxed ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {chain.formatValue(value)} — All tiers unlocked!
                          </span>
                        ) : currentTier ? (
                          <span>
                            <strong>{currentTier.name}</strong> · {chain.formatValue(value)} (
                            {nextTier!.threshold - value} to {nextTier!.name})
                          </span>
                        ) : (
                          <span>
                            Next: <strong>{nextTier!.name}</strong> ({nextTier!.threshold - value}{' '}
                            to go)
                          </span>
                        )}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-['Space_Grotesk'] font-bold text-xs">
                      {unlockedCount}/{totalTiers}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Tier Dots */}
                  <div className="mt-2.5 flex items-center gap-1">
                    {chain.tiers.map((tier, index) => {
                      const isFilled = index < unlockedCount;
                      const isCurrent = index === unlockedCount && !isMaxed;

                      return (
                        <div
                          key={index}
                          title={`${tier.name} — ${tier.hint}`}
                          className={`flex-1 h-1 rounded-full transition-all ${
                            isFilled
                              ? 'bg-purple-500'
                              : isCurrent
                              ? 'bg-purple-500 ring-2 ring-purple-300 dark:ring-purple-900 animate-pulse'
                              : 'bg-stone-200 dark:bg-stone-800'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
