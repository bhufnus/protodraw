"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function generateGameCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');

  const handleCreateNewGame = () => {
    setIsLoading(true);
    const newGameCode = generateGameCode(7);
    router.push(`/waiting-room?lobby=${newGameCode}`);
  };

  const handleJoinGame = () => {
    setIsLoading(true);
    router.push(`/game?lobby=${joinCode}&nickname=${nickname}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <h1 className="text-4xl font-bold mb-8">Drawing Roguelike</h1>

      {/* Create New Game Section */}
      <div className="mb-6">
        <Button
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
        </Button>
      </div>

      {/* Join Game Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Join Game</h2>
        <div className="flex flex-col items-center space-y-2">
          <Input
            type="text"
            placeholder="Enter Lobby Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="w-full max-w-xs"
          />
          <Input
            type="text"
            placeholder="Enter Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full max-w-xs"
          />
          <Button
            className="bg-secondary text-secondary-foreground rounded-md px-4 py-2 hover:bg-secondary/80 disabled:bg-secondary/50"
            onClick={handleJoinGame}
            disabled={isLoading || joinCode.length !== 7 || nickname.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining Game...
              </>
            ) : (
            "Join Game"
            )}
          </Button>
          {(joinCode.length !== 7) && (
            <p className="text-sm text-muted-foreground">
              Lobby code must be 7 characters long.
            </p>
          )}
          {(nickname.length === 0) && (
             <p className="text-sm text-muted-foreground">
              Nickname is required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
