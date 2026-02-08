import React, { useState, useEffect, useCallback } from 'react';

const FADE_DURATION_MS = 600;

interface SplashScreenProps {
  onDone: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDone }) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const splashUrl =
    typeof window !== 'undefined' ? window.electronAPI?.getSplashUrl?.() ?? '' : '';

  const finishSplash = useCallback(() => {
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (!splashUrl) {
      const t = setTimeout(finishSplash, 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(t);
  }, [splashUrl, finishSplash]);

  const handleEnded = useCallback(() => {
    setFadeOut(true);
  }, []);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName === 'opacity' && fadeOut) {
        finishSplash();
      }
    },
    [fadeOut, finishSplash]
  );

  const handleError = useCallback(() => {
    setTimeout(finishSplash, 500);
  }, [finishSplash]);

  if (!splashUrl) {
    return null;
  }

  const opacity = fadeOut ? 0 : fadeIn ? 1 : 0;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      style={{
        opacity,
        transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <video
        src={splashUrl}
        className="w-full h-full object-contain"
        muted
        autoPlay
        playsInline
        preload="auto"
        onEnded={handleEnded}
        onError={handleError}
      />
    </div>
  );
};
