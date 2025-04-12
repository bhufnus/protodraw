"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function WaitingRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lobbyCode = searchParams.get('lobby');
  const nickname = searchParams.get('nickname') || 'Guest';
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  useEffect(() => {
    // Simulate adding the creator to the list of connected users
    setConnectedUsers([nickname]);
  }, [nickname]);

  const handleCancel = () => {
    router.push('/');
  };

  const handleStartGame = () => {
    router.push(`/game?lobby=${lobbyCode}&nickname=${nickname}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <h1 className="text-4xl font-bold mb-8">Waiting Room</h1>
      <h2 className="text-2xl font-semibold mb-4">Lobby Code: {lobbyCode}</h2>

      <div>
        <h3 className="text-lg font-semibold mb-2">Connected Users:</h3>
        <ul>
          {connectedUsers.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>

      <div className="flex items-center space-x-4 mt-6">
        <Button variant="secondary" onClick={handleCancel}>
          <Home className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button style={{backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))'}} onClick={handleStartGame}>Start Game</Button>
      </div>
    </div>
  );
}

