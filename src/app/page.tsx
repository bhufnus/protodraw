"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNewGame = () => {
    setIsLoading(true);
    router.push('/game');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted">
      <h1 className="text-4xl font-bold mb-8">Firebase Studio Skribbl</h1>
      <button
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/80 disabled:bg-primary/50 flex items-center justify-center"
        onClick={handleCreateNewGame}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Game...
          </>
        ) : (
          "Create New Game"
        )}
      </button>
    </div>
  );
}

