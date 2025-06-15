
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { SimpleAvatar } from '@/components/SimpleAvatar';
import { FemaleAvatar } from '@/components/FemaleAvatar';
import { AdvancedErrorBoundary } from '@/components/error/AdvancedErrorBoundary';
import { performanceManager } from '@/services/PerformanceManager';
import { Gender } from '@/types/gender';

interface LazyAvatar3DProps {
  isListening: boolean;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
  gender?: Gender;
  enableLazyLoading?: boolean;
  intersectionThreshold?: number;
}

// Lazy load du composant Avatar3D
const Avatar3D = lazy(() => import('@/components/Avatar3D').then(module => ({ default: module.Avatar3D })));

export const LazyAvatar3D: React.FC<LazyAvatar3DProps> = ({
  isListening,
  isSpeaking,
  emotion,
  gender = 'male',
  enableLazyLoading = false,
  intersectionThreshold = 0.1
}) => {
  const [shouldLoad, setShouldLoad] = useState(!enableLazyLoading);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  console.log('🎭 LazyAvatar3D render:', { 
    gender, 
    isListening, 
    isSpeaking, 
    emotion, 
    enableLazyLoading, 
    shouldLoad 
  });
  console.log('🚺🚹 LazyAvatar3D - Genre analysé:', gender, 'Type:', typeof gender);

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (!enableLazyLoading || !containerRef || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log('🎯 Avatar3D entré dans le viewport - démarrage du lazy loading');
            setShouldLoad(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: intersectionThreshold }
    );

    observer.observe(containerRef);

    return () => {
      if (containerRef) {
        observer.unobserve(containerRef);
      }
    };
  }, [containerRef, enableLazyLoading, shouldLoad, intersectionThreshold]);

  const avatarProps = { isListening, isSpeaking, emotion };

  // Avatar féminin - logique simplifiée et debug renforcé
  if (gender === 'female') {
    console.log('✅ CONDITION FEMALE MATCHED - Rendu FemaleAvatar');
    console.log('👩 Rendu FemaleAvatar avec props:', avatarProps);
    return (
      <div ref={setContainerRef} className="w-full h-full">
        <AdvancedErrorBoundary 
          componentName="FemaleAvatar"
          severity="medium"
          fallback={() => {
            console.log('⚠️ FemaleAvatar fallback utilisé');
            return <SimpleAvatar {...avatarProps} />;
          }}
        >
          <FemaleAvatar {...avatarProps} />
        </AdvancedErrorBoundary>
      </div>
    );
  }

  // Avatar masculin avec lazy loading du 3D
  console.log('👨 CONDITION MALE - Rendu Avatar3D avec props:', avatarProps, 'shouldLoad:', shouldLoad);
  return (
    <div ref={setContainerRef} className="w-full h-full">
      <AdvancedErrorBoundary 
        componentName="Avatar3D"
        severity="high"
        fallback={() => {
          console.log('⚠️ Avatar3D fallback utilisé');
          return <SimpleAvatar {...avatarProps} />;
        }}
      >
        {shouldLoad ? (
          <Suspense fallback={
            <div className="w-full h-96 bg-gradient-to-b from-slate-900 to-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-pulse text-4xl mb-2">🤖</div>
                <div className="text-sm">Chargement de l'avatar 3D...</div>
              </div>
            </div>
          }>
            <Avatar3D {...avatarProps} />
          </Suspense>
        ) : (
          <div className="w-full h-96 bg-gradient-to-b from-slate-900 to-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-pulse text-4xl mb-2">🤖</div>
              <div className="text-sm">Avatar prêt à charger...</div>
            </div>
          </div>
        )}
      </AdvancedErrorBoundary>
    </div>
  );
};
