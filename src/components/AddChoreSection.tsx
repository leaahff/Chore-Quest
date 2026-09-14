import React, { useState } from 'react';
import { Category, Frequency, Difficulty, Chore } from '../types';
import { CATEGORIES, CATEGORY_ICONS, DIFFICULTY_XP, CHORE_TEMPLATES } from '../data/constants';
import { DynamicIcon } from './DynamicIcon';

interface AddChoreSectionProps {
  onAddChore: (chore: Omit<Chore, 'id' | 'completedAt'>) => void;
}

export const AddChoreSection: React.FC<AddChoreSectionProps> = ({ onAddChore }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [xp, setXp] = useState<number>(DIFFICULTY_XP.medium);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddChore({
      name: name.trim(),
      category,
      frequency,
      difficulty,
      xp: Math.max(5, Number(xp) || 5),
    });

    setName('');
  };

  const handlePickTemplate = (template: (typeof CHORE_TEMPLATES)[number]) => {
    setName(template.name);
    setCategory(template.category);
    setDifficulty(template.difficulty);
    setXp(DIFFICULTY_XP[template.difficulty]);
  };

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    setXp(DIFFICULTY_XP[d]);
  };

  return (
    <section className="mt-8 mb-12">
      <h2 className="font-['Space_Grotesk'] text-base font-bold text-stone-900 dark:text-stone-100 mb-3">
        New chore
      </h2>

      {/* Quick Add Templates */}
      <div className="mb-3.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
          Quick add
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {CHORE_TEMPLATES.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePickTemplate(t)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-stone-300 dark:border-stone-700 bg-transparent text-stone-600 dark:text-stone-400 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <DynamicIcon
                name={CATEGORY_ICONS[t.category] || 'Home'}
                className="w-3.5 h-3.5 text-stone-400"
              />
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Chore Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm flex flex-col gap-3.5"
      >
        <div>
          <label
            htmlFor="chore-name"
            className="block text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-1"
          >
            Chore name
          </label>
          <input
            id="chore-name"
            type="text"
            required
            placeholder="e.g., Clean bathroom or Vacuum floors"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
          />
        </div>

        <div>
          <label
            htmlFor="chore-category"
            className="block text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-1"
          >
            Category
          </label>
          <select
            id="chore-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-1">
            Frequency
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(['weekly', 'monthly'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`py-2 rounded-xl text-sm font-semibold capitalize border transition cursor-pointer ${
                  frequency === f
                    ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:border-teal-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-1">
            Difficulty
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDifficultyChange(d)}
                className={`py-2 rounded-xl text-sm font-semibold capitalize border transition cursor-pointer ${
                  difficulty === d
                    ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:border-teal-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="chore-xp"
            className="block text-[11px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 mb-1"
          >
            XP reward
          </label>
          <input
            id="chore-xp"
            type="number"
            min={5}
            step={5}
            value={xp}
            onChange={(e) => setXp(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
          />
        </div>

        <button
          type="submit"
          className="mt-1 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-['Space_Grotesk'] font-bold text-sm shadow-md transition active:scale-98 cursor-pointer"
        >
          <DynamicIcon name="Plus" className="w-4 h-4" />
          <span>Add chore</span>
        </button>
      </form>
    </section>
  );
};
