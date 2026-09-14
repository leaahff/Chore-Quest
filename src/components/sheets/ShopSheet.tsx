import React, { useState } from 'react';
import { Reward, RedeemedReward } from '../../types';
import { REWARD_ICONS } from '../../data/constants';
import { DynamicIcon } from '../DynamicIcon';

interface ShopSheetProps {
  coins: number;
  rewards: Reward[];
  redeemed: RedeemedReward[];
  onClose: () => void;
  onClaimReward: (reward: Reward) => void;
  onDeleteReward: (id: string) => void;
  onAddReward: (name: string, cost: number, icon: string) => void;
}

export const ShopSheet: React.FC<ShopSheetProps> = ({
  coins,
  rewards,
  redeemed,
  onClose,
  onClaimReward,
  onDeleteReward,
  onAddReward,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [cost, setCost] = useState(20);
  const [selectedIcon, setSelectedIcon] = useState('gift');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddReward(name.trim(), Math.max(1, Number(cost) || 1), selectedIcon);
    setName('');
    setCost(20);
    setSelectedIcon('gift');
    setIsFormOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] bg-[#faf8f5] dark:bg-[#182323] text-stone-900 dark:text-stone-100 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Grabber */}
        <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mt-3 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
          <h2 className="font-['Space_Grotesk'] text-lg font-extrabold">Reward shop</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-['Space_Grotesk'] font-extrabold text-sm">
              <DynamicIcon name="Coins" className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{coins} coins</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 grid place-items-center rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
              aria-label="Close shop"
            >
              <DynamicIcon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Rewards List */}
          <div className="flex flex-col gap-2.5">
            {rewards.length === 0 ? (
              <p className="p-6 text-center text-sm text-stone-500 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl">
                No rewards yet. Create one below that will motivate you!
              </p>
            ) : (
              rewards.map((r) => {
                const canAfford = coins >= r.cost;

                return (
                  <div
                    key={r.id}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm transition ${
                      canAfford ? '' : 'opacity-70'
                    }`}
                  >
                    <span
                      className={`w-10 h-10 flex-shrink-0 grid place-items-center rounded-full ${
                        canAfford
                          ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                      }`}
                    >
                      <DynamicIcon name={r.icon} className="w-5 h-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate text-stone-900 dark:text-stone-100">
                        {r.name}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {r.cost} coins
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteReward(r.id)}
                      className="w-8 h-8 grid place-items-center rounded-full text-stone-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete reward"
                      aria-label={`Delete ${r.name}`}
                    >
                      <DynamicIcon name="Trash2" className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onClaimReward(r)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
                        canAfford
                          ? 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {canAfford ? 'Claim' : `${r.cost - coins} more`}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Reward Form / Trigger */}
          {isFormOpen ? (
            <form
              onSubmit={handleAddSubmit}
              className="mt-4 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col gap-3 shadow-sm"
            >
              <input
                type="text"
                required
                placeholder="Reward title (e.g., Weekend movie or Special treat)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:border-teal-500"
              />

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  required
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:border-teal-500"
                />
                <span className="text-xs text-stone-500">coins cost</span>
              </div>

              {/* Icon selection */}
              <div>
                <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Select Icon
                </span>
                <div className="flex flex-wrap gap-2">
                  {REWARD_ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedIcon(i)}
                      className={`w-9 h-9 grid place-items-center rounded-full border transition cursor-pointer ${
                        selectedIcon === i
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:border-stone-400'
                      }`}
                    >
                      <DynamicIcon name={i} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Save reward
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="mt-3.5 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-teal-500 text-stone-600 dark:text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 font-bold text-xs transition cursor-pointer"
            >
              <DynamicIcon name="Plus" className="w-4 h-4" />
              <span>Create custom reward</span>
            </button>
          )}

          {/* Recently Claimed List */}
          {redeemed.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                Claimed history
              </h3>
              <div className="flex flex-col gap-1.5">
                {redeemed.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-100/70 dark:bg-stone-800/50 text-xs"
                  >
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {item.name}
                    </span>
                    <span className="text-stone-500 dark:text-stone-400 flex-shrink-0 ml-2">
                      −{item.cost} coins · {new Date(item.at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
