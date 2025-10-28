
// /src/app/features-carousel.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState(0);
  const requestRef = useRef<number>();

  const animate = () => {
    if (!isHovered) {
      setRotation(prev => prev + 0.05);
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current as number);
  }, [isHovered]);

  const numFeatures = features.length;
  const angleIncrement = 360 / numFeatures;
  const radius = 400; // Increased radius for more spacing

  const handleNext = () => {
    setRotation(rotation - angleIncrement);
  };

  const handlePrev = () => {
    setRotation(rotation + angleIncrement);
  };

  return (
    <div
      className="relative w-full flex items-center justify-center h-[300px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button onClick={handlePrev} variant="outline" size="icon" className="absolute left-10 z-10 rounded-full bg-white/50 hover:bg-white">
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <div className="w-[180px] h-[120px] relative" style={{ perspective: '1000px' }}>
        <div
          className="w-full h-full absolute transition-transform duration-500 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="absolute w-[150px] h-[100px] border-2 border-gray-300 rounded-lg overflow-hidden"
              style={{
                transform: `rotateY(${i * angleIncrement}deg) translateZ(${radius}px)`
              }}
            >
              <Image
                src={feature.imageUrl}
                alt={feature.title}
                layout="fill"
                objectFit="cover"
              />
               <div className="absolute bottom-0 left-0 w-full p-1 bg-black/50 text-white text-center">
                 <p className="text-xs font-bold truncate">{feature.title}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
      <Button onClick={handleNext} variant="outline" size="icon" className="absolute right-10 z-10 rounded-full bg-white/50 hover:bg-white">
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
