import React from 'react';
import { DynamicIcon } from './DynamicIcon';

interface UndoToastProps {
  message: string | null;
  onUndo: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({ message, onUndo }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs shadow-2xl animate-pop max-w-[calc(100%-32px)] border border-stone-800 dark:border-stone-200">
      <span className="font-medium truncate">{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-['Space_Grotesk'] font-bold text-xs transition active:scale-95 cursor-pointer flex-shrink-0"
      >
        <DynamicIcon name="Undo2" className="w-3.5 h-3.5" />
        <span>Undo</span>
      </button>
    </div>
  );
};
