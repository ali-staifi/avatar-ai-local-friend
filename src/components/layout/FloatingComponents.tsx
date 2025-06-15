
import React from 'react';
import { AccessibilityControls } from '@/components/accessibility/AccessibilityControls';
import { ConversationMetricsDisplay } from '@/components/metrics/ConversationMetricsDisplay';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';

interface FloatingComponentsProps {
  showAccessibilityControls: boolean;
  setShowAccessibilityControls: (show: boolean) => void;
  showMetrics: boolean;
  setShowMetrics: (show: boolean) => void;
  showTutorial: boolean;
  closeTutorial: () => void;
  completeTutorial: () => void;
}

export const FloatingComponents: React.FC<FloatingComponentsProps> = ({
  showAccessibilityControls,
  setShowAccessibilityControls,
  showMetrics,
  setShowMetrics,
  showTutorial,
  closeTutorial,
  completeTutorial
}) => {
  return (
    <>
      <AccessibilityControls
        isVisible={showAccessibilityControls}
        onToggleVisibility={() => setShowAccessibilityControls(!showAccessibilityControls)}
      />

      <ConversationMetricsDisplay
        isVisible={showMetrics}
        onToggle={() => setShowMetrics(!showMetrics)}
      />

      <TutorialOverlay
        isVisible={showTutorial}
        onClose={closeTutorial}
        onComplete={completeTutorial}
      />
    </>
  );
};
