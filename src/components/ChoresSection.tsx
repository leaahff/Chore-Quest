import React from 'react';
import { Chore, Frequency, Category } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { CATEGORY_ICONS } from '../data/constants';

interface ChoresSectionProps {
  chores: Chore[];
  currentTab: Frequency;
  filter: 'all' | 'pending' | 'done';
  burstId: string | null;
  undoBurstId: string | null;
  onTabChange: (tab: Frequency) => void;
  onFilterChange: (filter: 'all' | 'pending' | 'done') => void;
  onComplete: (id: string) => void;
  onUndoComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ChoresSection: React.FC<ChoresSectionProps> = ({
  chores,
  currentTab,
  filter,
  burstId,
  undoBurstId,
  onTabChange,
  onFilterChange,
  onComplete,
  onUndoComplete,
  onDelete,
}) => {
  const tabList = chores.filter((c) => c.frequency === currentTab);
  const pending = tabList.filter((c) => !c.completedAt);
  const done = tabList.filter((c) => c.completedAt);
  const remainingXp = pending.reduce((sum, c) => sum + c.xp, 0);

  const counts = {
    all: tabList.length,
    pending: pending.length,
    done: done.length,
  };

  let visible: Chore[];
  if (filter === 'pending') visible = pending;
  else if (filter === 'done') visible = done;
  else visible = tabList;

  const sorted = [...visible].sort((a, b) => {
    if (Boolean(a.completedAt) !== Boolean(b.completedAt)) {
      return a.completedAt ? 1 : -1;
    }
    return b.xp - a.xp;
  });

  const groups = new Map<Category, Chore[]>();
  for (const c of sorted) {
    if (!groups.has(c.category)) groups.set(c.category, []);
    groups.get(c.category)!.push(c);
  }

  const difficultyColors = {
    easy: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    hard: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  };

  return (
    <section className="mt-6 mb-6">
      {/* Tabs & Summary row */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-full">
          <button
            type="button"
            onClick={() => onTabChange('weekly')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
              currentTab === 'weekly'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => onTabChange('monthly')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
              currentTab === 'monthly'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Monthly
          </button>
        </div>

        <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
          {pending.length} left · {remainingXp} XP
        </span>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        {(['all', 'pending', 'done'] as const).map((f) => {
          const isActive = filter === f;
          const label = f === 'all' ? 'All' : f === 'pending' ? 'To do' : 'Done';
          const iconName =
            f === 'all' ? 'Layers' : f === 'pending' ? 'CircleDashed' : 'CheckCheck';

          return (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-teal-300 dark:hover:border-teal-800'
              }`}
            >
              <DynamicIcon name={iconName} className="w-3.5 h-3.5" />
              <span>{label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chores list */}
      {groups.size === 0 ? (
        <div className="text-center p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-sm">
          <div className="w-12 h-12 mx-auto mb-2.5 grid place-items-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">
            <DynamicIcon
              name={filter === 'done' ? 'CircleDashed' : 'CheckCircle2'}
              className="w-6 h-6"
            />
          </div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            {filter === 'pending' && tabList.length > 0
              ? 'All done — everything in this tab is completed!'
              : filter === 'done' && tabList.length > 0
              ? 'No chores completed yet in this tab.'
              : 'No chores yet. Add one below or use a quick template.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Array.from(groups.entries()).map(([category, categoryChores]) => (
            <div key={category}>
              <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-2 mt-1">
                <DynamicIcon
                  name={CATEGORY_ICONS[category] || 'Home'}
                  className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400"
                />
                <span>{category}</span>
              </h3>

              <div className="flex flex-col gap-2.5">
                {categoryChores.map((chore) => {
                  const isDone = Boolean(chore.completedAt);
                  const isBurst = burstId === chore.id;
                  const isUndoBurst = undoBurstId === chore.id;

                  return (
                    <div
                      key={chore.id}
                      className={`relative flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm transition-all duration-200 ${
                        isDone ? 'opacity-65 dark:opacity-60' : 'hover:border-teal-300 dark:hover:border-teal-800'
                      }`}
                    >
                      {/* Left: Info */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-['Space_Grotesk'] text-[15px] font-bold leading-snug flex items-center gap-2 ${
                            isDone
                              ? 'line-through text-stone-400 dark:text-stone-500'
                              : 'text-stone-900 dark:text-stone-100'
                          }`}
                        >
                          <DynamicIcon
                            name={CATEGORY_ICONS[chore.category] || 'Home'}
                            className="w-4 h-4 text-stone-400 flex-shrink-0"
                          />
                          <span className="truncate">{chore.name}</span>
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                            {chore.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium capitalize">
                            {chore.frequency}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold capitalize ${
                              difficultyColors[chore.difficulty]
                            }`}
                          >
                            {chore.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="relative flex items-center gap-2 flex-shrink-0">
                        {/* Burst animations */}
                        {isBurst && (
                          <span className="absolute -top-6 right-0 font-['Space_Grotesk'] font-bold text-sm text-teal-600 dark:text-teal-400 pointer-events-none animate-bounce">
                            +{chore.xp} XP
                          </span>
                        )}
                        {isUndoBurst && (
                          <span className="absolute -top-6 right-0 font-['Space_Grotesk'] font-bold text-sm text-rose-600 dark:text-rose-400 pointer-events-none animate-bounce">
                            −{chore.xp} XP
                          </span>
                        )}

                        <span className="font-['Space_Grotesk'] font-bold text-sm text-teal-600 dark:text-teal-400 mr-1">
                          +{chore.xp}
                        </span>

                        {isDone ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onUndoComplete(chore.id)}
                              className="w-9 h-9 grid place-items-center rounded-xl text-stone-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition active:scale-95 cursor-pointer"
                              title="Undo completion"
                              aria-label={`Undo completion of ${chore.name}`}
                            >
                              <DynamicIcon name="Undo2" className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(chore.id)}
                              className="w-9 h-9 grid place-items-center rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition active:scale-95 cursor-pointer"
                              title="Delete chore"
                              aria-label={`Delete ${chore.name}`}
                            >
                              <DynamicIcon name="Trash2" className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onComplete(chore.id)}
                            className="w-10 h-10 grid place-items-center rounded-xl border-2 border-stone-300 dark:border-stone-700 text-stone-400 hover:border-teal-500 hover:bg-teal-500 hover:text-white transition active:scale-90 cursor-pointer shadow-sm"
                            aria-label={`Complete ${chore.name}`}
                          >
                            <DynamicIcon name="Check" className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
