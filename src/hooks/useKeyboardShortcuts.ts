
import { useEffect, useCallback } from 'react';
import { accessibilityManager } from '@/services/AccessibilityManager';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const matchingShortcut = shortcuts.find(shortcut => {
      return shortcut.key.toLowerCase() === event.key.toLowerCase() &&
             !!shortcut.ctrlKey === event.ctrlKey &&
             !!shortcut.shiftKey === event.shiftKey &&
             !!shortcut.altKey === event.altKey;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
      
      // Annoncer l'action pour les lecteurs d'écran
      accessibilityManager.announce(`Raccourci activé: ${matchingShortcut.description}`);
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  const getShortcutHelp = useCallback(() => {
    return shortcuts.map(shortcut => {
      const keys = [];
      if (shortcut.ctrlKey) keys.push('Ctrl');
      if (shortcut.shiftKey) keys.push('Shift');
      if (shortcut.altKey) keys.push('Alt');
      keys.push(shortcut.key.toUpperCase());
      
      return {
        combination: keys.join(' + '),
        description: shortcut.description
      };
    });
  }, [shortcuts]);

  return { getShortcutHelp };
};
