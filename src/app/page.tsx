"use client";

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleCreateNewGame = () => {
    router.push('/game');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted">
      <h1 className="text-4xl font-bold mb-8">Firebase Studio Skribbl</h1>
      <button
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:bg-primary/80"
        onClick={handleCreateNewGame}
      >
        Create New Game
      </button>
    </div>
  );
}

