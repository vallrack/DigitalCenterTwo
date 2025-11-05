
// src/components/logo.tsx
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className, isCollapsed }: { className?: string, isCollapsed?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className, isCollapsed ? "justify-center" : "")}>
       <Image 
        src="https://dprogramadores.com.co/img/logoD.png" 
        alt="DigitalCenter Logo" 
        width={36}
        height={36} 
        className="rounded-md"
      />
      {!isCollapsed && (
        <span className="text-xl font-bold text-white whitespace-nowrap">
          DigitalCenter
        </span>
      )}
    </div>
  );
}
