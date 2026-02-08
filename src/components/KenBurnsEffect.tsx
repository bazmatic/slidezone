import React, { useState, useEffect } from 'react';

export enum KenBurnsType {
  ZOOM_IN = 'zoom-in',
  ZOOM_OUT = 'zoom-out',
  PAN_LEFT = 'pan-left',
  PAN_RIGHT = 'pan-right',
  PAN_UP = 'pan-up',
  PAN_DOWN = 'pan-down',
  ZOOM_PAN = 'zoom-pan',
  STATIC = 'static'
}

interface KenBurnsEffectProps {
  src: string;
  alt: string;
  duration: number;
  effectType?: KenBurnsType;
  className?: string;
}

const KenBurnsEffect: React.FC<KenBurnsEffectProps> = ({
  src,
  alt,
  duration,
  effectType = KenBurnsType.ZOOM_PAN,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const getTransformValue = () => {
    switch (effectType) {
      case KenBurnsType.ZOOM_IN:
        return 'scale(1.2)';
      case KenBurnsType.ZOOM_OUT:
        return 'scale(0.9)';
      case KenBurnsType.PAN_LEFT:
        return 'translateX(-8%)';
      case KenBurnsType.PAN_RIGHT:
        return 'translateX(8%)';
      case KenBurnsType.PAN_UP:
        return 'translateY(-8%)';
      case KenBurnsType.PAN_DOWN:
        return 'translateY(8%)';
      case KenBurnsType.ZOOM_PAN:
        return 'scale(1.15) translateX(-5%) translateY(-4%)';
      case KenBurnsType.STATIC:
      default:
        return 'scale(1)';
    }
  };

  const getRandomEffect = (): KenBurnsType => {
    const effects = [
      KenBurnsType.ZOOM_IN,
      KenBurnsType.ZOOM_OUT,
      KenBurnsType.PAN_LEFT,
      KenBurnsType.PAN_RIGHT,
      KenBurnsType.PAN_UP,
      KenBurnsType.PAN_DOWN,
      KenBurnsType.ZOOM_PAN,
    ];
    return effects[Math.floor(Math.random() * effects.length)];
  };

  useEffect(() => {
    if (isLoaded && effectType !== KenBurnsType.STATIC) {
      // Start animation after a short delay
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, effectType]);

  const handleLoad = () => {
    setIsLoaded(true);
    // Reset animation state when new image loads
    setIsAnimating(false);
  };

  // Create an image element to detect when it loads
  useEffect(() => {
    const img = new Image();
    img.onload = handleLoad;
    img.src = src;
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
          transform: isAnimating ? getTransformValue() : 'scale(1) translateX(0) translateY(0)',
        }}
      />
    </div>
  );
};

export default KenBurnsEffect; 