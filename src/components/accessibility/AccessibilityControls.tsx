
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { accessibilityManager } from '@/services/AccessibilityManager';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Eye, Keyboard, Volume2, Contrast } from 'lucide-react';

interface AccessibilityControlsProps {
  onToggleVisibility?: () => void;
  isVisible?: boolean;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  onToggleVisibility,
  isVisible = false
}) => {
  const [highContrast, setHighContrast] = useState(accessibilityManager.getHighContrastMode());
  const [reducedMotion, setReducedMotion] = useState(accessibilityManager.getReducedMotion());
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcuts = [
    {
      key: 'h',
      ctrlKey: true,
      action: () => toggleHighContrast(),
      description: 'Basculer le mode contraste élevé'
    },
    {
      key: 'm',
      ctrlKey: true,
      action: () => toggleReducedMotion(),
      description: 'Basculer les animations réduites'
    },
    {
      key: '?',
      ctrlKey: true,
      action: () => setShowShortcuts(!showShortcuts),
      description: 'Afficher/masquer l\'aide des raccourcis'
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => onToggleVisibility?.(),
      description: 'Ouvrir/fermer les contrôles d\'accessibilité'
    }
  ];

  const { getShortcutHelp } = useKeyboardShortcuts({ shortcuts });

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    accessibilityManager.setHighContrastMode(newValue);
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    accessibilityManager.setReducedMotion(newValue);
  };

  useEffect(() => {
    accessibilityManager.announce('Contrôles d\'accessibilité chargés');
  }, []);

  if (!isVisible) {
    return (
      <Button
        onClick={onToggleVisibility}
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50"
        aria-label="Ouvrir les contrôles d'accessibilité"
        title="Ouvrir les contrôles d'accessibilité (Ctrl+A)"
      >
        <Eye className="h-4 w-4" />
        A11y
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Accessibilité
            </div>
            <Button onClick={onToggleVisibility} variant="ghost" size="sm">
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-sm">
          {/* Contrôles visuels */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              Paramètres visuels
            </h4>
            
            <div className="flex items-center justify-between">
              <label htmlFor="high-contrast" className="flex-1">
                Contraste élevé
              </label>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={toggleHighContrast}
                aria-describedby="high-contrast-desc"
              />
            </div>
            <p id="high-contrast-desc" className="text-xs text-muted-foreground">
              Active un thème à fort contraste pour une meilleure lisibilité
            </p>
            
            <div className="flex items-center justify-between">
              <label htmlFor="reduced-motion" className="flex-1">
                Animations réduites
              </label>
              <Switch
                id="reduced-motion"
                checked={reducedMotion}
                onCheckedChange={toggleReducedMotion}
                aria-describedby="reduced-motion-desc"
              />
            </div>
            <p id="reduced-motion-desc" className="text-xs text-muted-foreground">
              Réduit les animations pour les utilisateurs sensibles au mouvement
            </p>
          </div>

          {/* Raccourcis clavier */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Raccourcis clavier
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(!showShortcuts)}
                aria-expanded={showShortcuts}
              >
                {showShortcuts ? 'Masquer' : 'Afficher'}
              </Button>
            </h4>
            
            {showShortcuts && (
              <div className="space-y-2 p-3 bg-muted rounded-lg" role="region" aria-label="Liste des raccourcis clavier">
                {getShortcutHelp().map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs">{shortcut.description}</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {shortcut.combination}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lecteur d'écran */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Lecteur d'écran
            </h4>
            <p className="text-xs text-muted-foreground">
              Cette application est compatible avec les lecteurs d'écran et inclut des annonces vocales automatiques.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
