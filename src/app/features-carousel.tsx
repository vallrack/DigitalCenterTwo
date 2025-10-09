// /src/app/features-carousel.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  imageUrl: string;
}

interface FeaturesCarouselProps {
  features: Feature[];
}

export function FeaturesCarousel({ features }: FeaturesCarouselProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const numSlides = features.length;
  const angleIncrement = 360 / numSlides;

  const getPosition = (index: number, radius: number) => {
    const angle = (rotationAngle + index * angleIncrement) * (Math.PI / 180);
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    return { top: `${y}px`, left: `${x}px` };
  };

  const updateActiveSlide = useCallback(() => {
    const currentRotation = (rotationAngle % 360 + 360) % 360;
    const closestIndex = Math.round((360 - currentRotation) / angleIncrement) % numSlides;
    setActiveSlideIndex(closestIndex);
  }, [rotationAngle, angleIncrement, numSlides]);
  
  const startAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }
    autoplayIntervalRef.current = setInterval(() => {
      setRotationAngle(prev => prev - angleIncrement);
    }, 3000);
  }, [angleIncrement]);

  const stopAutoplay = () => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }
  };

  useEffect(() => {
    updateActiveSlide();
  }, [rotationAngle, updateActiveSlide]);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay]);
  
  const handlePrev = () => {
    setRotationAngle(prev => prev + angleIncrement);
    stopAutoplay();
    startAutoplay();
  };
  
  const handleNext = () => {
    setRotationAngle(prev => prev - angleIncrement);
    stopAutoplay();
    startAutoplay();
  };

  const activeFeature = features[activeSlideIndex];

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-20 w-full overflow-hidden">
      <div 
        ref={containerRef}
        className="relative w-[80vw] h-[80vw] sm:w-[65vw] sm:h-[65vw] md:w-[55vw] md:h-[55vw] lg:w-[35vw] lg:h-[35vw] rounded-full shadow-2xl bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-cyan-400/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300"
      >
        {/* Central Content */}
        <div className="text-center text-primary z-10 p-4 sm:p-8 w-[70%] sm:w-[60%]">
          {activeFeature && (
            <>
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4">
                  <Image src={activeFeature.imageUrl} alt={activeFeature.title} layout="fill" className="rounded-lg object-cover" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">{activeFeature.title}</h3>
              <p className="text-xs sm:text-sm text-primary/80 mt-2">{activeFeature.description}</p>
            </>
          )}
        </div>

        {/* Orbiting Slides */}
        {features.map((feature, i) => (
          <div
            key={i}
            className={cn(
              "slide absolute w-[20vw] h-[20vw] sm:w-[15vw] sm:h-[15vw] md:w-[13vw] md:h-[13vw] lg:w-[8vw] lg:h-[8vw] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg cursor-pointer transition-all duration-300 z-20",
              i === activeSlideIndex ? 'scale-125 border-2 border-primary' : 'opacity-80'
            )}
            style={{
              ...getPosition(i, (containerRef.current?.offsetWidth || 0) / 2),
            }}
            onMouseEnter={() => { stopAutoplay(); setActiveSlideIndex(i); }}
            onMouseLeave={startAutoplay}
          >
             <Image src={feature.imageUrl} alt={feature.title} layout="fill" className="rounded-full object-cover" />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-8">
        <Button onClick={handlePrev} variant="outline" className="text-primary bg-white/50 hover:bg-white/80 border-primary/20 backdrop-blur-sm">
            <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button onClick={handleNext} variant="outline" className="text-primary bg-white/50 hover:bg-white/80 border-primary/20 backdrop-blur-sm">
            Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
