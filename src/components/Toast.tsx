import React from 'react';
import { DynamicIcon } from './DynamicIcon';

interface ToastProps {
  message: string | null;
  iconName?: string;
}

export const Toast: React.FC<ToastProps> = ({ message, iconName = 'Sparkles' }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-600 text-white font-['Space_Grotesk'] font-bold text-xs shadow-xl animate-pop max-w-[calc(100%-32px)]">
      <DynamicIcon name={iconName} className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
};
