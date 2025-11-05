
// src/components/loading-screen.tsx
import { Logo } from "./logo";

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse">
        <Logo />
      </div>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Cargando...</p>
    </div>
  );
}
